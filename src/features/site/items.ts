"use server";

import { itemLimits, tabHref } from "@/config/item-data";
import { fileKey, readSite, siteMediaUrls } from "@/config/site-content";
import { requireUser } from "@/features/auth/queries";
import { findSitePaths, removeImages } from "@/features/media/upload";
import { getProfileById } from "@/features/profile/queries";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { field } from "@/lib/form";
import { detectLogo, readProjectItem } from "@/lib/item-data";
import { socialLabel } from "@/lib/social";
import { createClient } from "@/lib/supabase/server";
import { isHttpUrl } from "@/lib/validation";
import {
  downloadLogos,
  itemRatios,
  type Block,
  type BlockData,
  type ItemDownload,
  type ItemFile,
  type ItemLink,
  type ItemRatio,
} from "@/types/block";
import { fetchOgImage } from "./og";
import { sweepKeeping } from "./sweep";

// The description limit matches the block forms. Raising it needs a look at the database first.
const bodyMax = 500;

type Db = Awaited<ReturnType<typeof createClient>>;

function strings(formData: FormData, name: string): string[] {
  return formData.getAll(name).filter((x): x is string => typeof x === "string");
}

async function nextPosition(supabase: Db, userId: string): Promise<number> {
  const { data } = await supabase
    .from("blocks")
    .select("position")
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((data?.position as number | undefined) ?? -1) + 1;
}

async function findOwn(supabase: Db, userId: string, id: string): Promise<Block | null> {
  const { data } = await supabase.from("blocks").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  return (data as Block | null) ?? null;
}

// Add or save one Projects item: title, description, media list (order, ratio, credit),
// Download buttons, text links and where it shows.
export async function saveProjectAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = tabHref("projects");
  const profile = await getProfileById(user.id);

  // Files uploaded but not saved are lost after a redirect, so they are deleted on every failure.
  const abort = async (message: string): Promise<void> => {
    await sweepKeeping(user.id, siteMediaUrls(readSite(profile?.site)));
    return redirectWithError(back, message);
  };

  const supabase = await createClient();
  const id = field(formData, "id");
  let current: Block | null = null;
  if (id) {
    current = await findOwn(supabase, user.id, id);
    if (!current) return abort("Project not found.");
  }

  const title = field(formData, "title");
  if (!title) return abort("Title is required.");
  if (title.length > 80) return abort("Title can be at most 80 characters.");
  const body = field(formData, "body");
  if (body && body.length > bodyMax) return abort(`The description can be at most ${bodyMax} characters.`);

  const downloads: ItemDownload[] = [];
  for (let i = 0; i < itemLimits.downloads; i++) {
    const url = field(formData, `dl_url_${i}`);
    if (!url) continue;
    if (!isHttpUrl(url)) return abort(`Download ${i + 1}: the link must start with http:// or https://`);
    const picked = field(formData, `dl_logo_${i}`);
    const logo = (downloadLogos as readonly string[]).includes(picked ?? "")
      ? (picked as ItemDownload["logo"])
      : detectLogo(url);
    downloads.push({ url, logo });
  }

  const links: ItemLink[] = [];
  for (let i = 0; i < itemLimits.links; i++) {
    const url = field(formData, `ln_url_${i}`);
    const label = field(formData, `ln_label_${i}`);
    if (!url) {
      if (label) return abort(`Text link ${i + 1} has a label but no address.`);
      continue;
    }
    if (!isHttpUrl(url)) return abort(`Text link ${i + 1}: the address must start with http:// or https://`);
    if (label && label.length > itemLimits.label) {
      return abort(`Text link ${i + 1}: the label can be at most ${itemLimits.label} characters.`);
    }
    links.push({ url, label: label ?? socialLabel(url) });
  }

  // Media: kept files and new uploads, in the order of the form.
  const oldUrls = new Set(current ? readProjectItem(current).files.map((f) => f.url) : []);
  const removed = new Set(strings(formData, "remove_files"));
  const addedPaths = strings(formData, "add_files");
  const found = await findSitePaths(user.id, addedPaths);
  if ("error" in found) return abort(found.error);
  const byPath = new Map(addedPaths.map((path, i) => [path, found.urls[i]] as const));

  const ordered: string[] = [];
  const put = (url: string | undefined) => {
    if (url && !ordered.includes(url)) ordered.push(url);
  };
  for (const token of strings(formData, "order_files")) {
    if (oldUrls.has(token) && !removed.has(token)) put(token);
    else put(byPath.get(token));
  }
  for (const url of oldUrls) if (!removed.has(url)) put(url);
  for (const url of byPath.values()) put(url);
  if (ordered.length > itemLimits.files) {
    return abort(`A project can hold up to ${itemLimits.files} media. Remove some first.`);
  }

  const files: ItemFile[] = ordered.map((url) => {
    const key = fileKey(url);
    const ratio = field(formData, `fratio__${key}`);
    return {
      url,
      ratio: (itemRatios as readonly string[]).includes(ratio ?? "") ? (ratio as ItemRatio) : "landscape",
      credit: field(formData, `fcredit__${key}`)?.slice(0, itemLimits.credit) ?? null,
    };
  });

  const data: BlockData = {};
  if (files.length > 0) data.files = files;
  if (downloads.length > 0) data.downloads = downloads;
  if (links.length > 0) data.links = links;
  if (formData.get("home") === "on") data.home = true;
  if (formData.get("showcase") === "on") data.showcase = true;
  // Older card media is kept as it is.
  if (current?.data?.media) data.media = current.data.media;

  // image_url is empty from now on: an older cover image is now the first file of the list.
  const row = {
    page: "projects",
    title,
    body: body ?? null,
    image_url: null,
    data,
    is_visible: formData.get("visible") === "on",
  };

  if (current) {
    const { error } = await supabase.from("blocks").update(row).eq("id", current.id).eq("user_id", user.id);
    if (error) return abort(`Could not save the project: ${error.message}`);
  } else {
    const position = await nextPosition(supabase, user.id);
    const { error } = await supabase
      .from("blocks")
      .insert({ user_id: user.id, type: "project", position, ...row });
    if (error) return abort(`Could not add the project: ${error.message}`);
  }

  await removeImages(user.id, [...oldUrls].filter((url) => !ordered.includes(url)));
  await sweepKeeping(user.id, siteMediaUrls(readSite(profile?.site)));
  redirectWithSaved(back, current ? "Project saved." : "Project added.");
}

// Add or save one Writing item: a link to an article with an optional image and short text.
export async function saveWritingAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = tabHref("writing");
  const profile = await getProfileById(user.id);

  const abort = async (message: string): Promise<void> => {
    await sweepKeeping(user.id, siteMediaUrls(readSite(profile?.site)));
    return redirectWithError(back, message);
  };

  const supabase = await createClient();
  const id = field(formData, "id");
  let current: Block | null = null;
  if (id) {
    current = await findOwn(supabase, user.id, id);
    if (!current) return abort("Writing item not found.");
  }

  const title = field(formData, "title");
  if (!title) return abort("Title is required.");
  if (title.length > 80) return abort("Title can be at most 80 characters.");
  const url = field(formData, "url");
  if (!url || !isHttpUrl(url)) return abort("The link is required and must start with http:// or https://");
  const body = field(formData, "body");
  if (body && body.length > bodyMax) return abort(`The text can be at most ${bodyMax} characters.`);

  const oldImage = current?.image_url ?? null;
  const addedPaths = strings(formData, "add_wimg");
  const found = await findSitePaths(user.id, addedPaths);
  if ("error" in found) return abort(found.error);
  const dropped = oldImage !== null && strings(formData, "remove_wimg").includes(oldImage);
  const imageUrl = found.urls.length > 0 ? found.urls[found.urls.length - 1] : dropped ? null : oldImage;

  const data: BlockData = { ...(current?.data ?? {}) };
  if (formData.get("home") === "on") data.home = true;
  else delete data.home;

  // No uploaded image: read the image of the link (og:image). An uploaded image always wins.
  let note = "";
  if (imageUrl) {
    delete data.og;
  } else if (formData.get("refresh_og") === "on" || !data.og || current?.url !== url) {
    const og = await fetchOgImage(url);
    if (og) data.og = og;
    else {
      delete data.og;
      note = " No image found on the link: upload one yourself.";
    }
  }

  const row = {
    page: "writing",
    title,
    url,
    body: body ?? null,
    image_url: imageUrl,
    data,
    is_visible: formData.get("visible") === "on",
  };

  if (current) {
    const { error } = await supabase.from("blocks").update(row).eq("id", current.id).eq("user_id", user.id);
    if (error) return abort(`Could not save the item: ${error.message}`);
  } else {
    const position = await nextPosition(supabase, user.id);
    const { error } = await supabase
      .from("blocks")
      .insert({ user_id: user.id, type: "link", position, ...row });
    if (error) return abort(`Could not add the item: ${error.message}`);
  }

  if (oldImage && oldImage !== imageUrl) await removeImages(user.id, [oldImage]);
  await sweepKeeping(user.id, siteMediaUrls(readSite(profile?.site)));
  redirectWithSaved(back, `${current ? "Writing item saved." : "Writing item added."}${note}`);
}