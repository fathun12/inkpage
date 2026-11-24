"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/features/auth/queries";
import { filesFrom, removeImages, uploadCardMedia, uploadImages } from "@/features/media/upload";
import { mediaConfig } from "@/config/media";
import { routes } from "@/config/site";
import { localInputToIso } from "@/lib/datetime";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { field } from "@/lib/form";
import { splitLines, toSocialItems } from "@/lib/social";
import { createClient } from "@/lib/supabase/server";
import { firstError } from "@/lib/validation";
import type { Block, BlockData, CardMedia } from "@/types/block";
import { parseBlockForm, parseMediaSettings, type BlockInput } from "./schema";

const back = routes.links;

// Forms on the Pages screen send return_to=pages, so they come back there and not to Links.
function backOf(formData: FormData): string {
  return formData.get("return_to") === "pages" ? routes.pages : back;
}
const galleryEmpty = "A gallery needs at least one image.";
const galleryFull = `A gallery can hold up to ${mediaConfig.maxGallery} images.`;

type Db = Awaited<ReturnType<typeof createClient>>;

// How many of the user's blocks hold a GIF (the block being edited can be left out).
async function countAnimated(supabase: Db, userId: string, exceptId: string | null): Promise<number> {
  const { data } = await supabase.from("blocks").select("id, data").eq("user_id", userId);
  const rows = (data ?? []) as { id: string; data: BlockData | null }[];
  return rows.filter((r) => r.id !== exceptId && r.data?.media?.kind === "gif").length;
}

type MediaPlan = { media: CardMedia | null; fresh: string[]; removed: string[] } | { error: string };

// Decides what happens to the card media of a link or project block:
//   new file picked  -> upload it; the old file is deleted after saving
//   "Remove" ticked  -> no media; the old file is deleted after saving
//   nothing picked   -> keep the file, only update the settings (opacity, fit ...)
// fresh = files uploaded now (delete them again if saving fails). removed = old files to delete after saving.
async function planMedia(
  supabase: Db,
  userId: string,
  formData: FormData,
  type: BlockInput["type"],
  current: CardMedia | null,
  blockId: string | null,
): Promise<MediaPlan> {
  if (type !== "link" && type !== "project") return { media: null, fresh: [], removed: [] };

  const settings = parseMediaSettings(formData);
  if (!settings.success) return { error: firstError(settings.error) };

  const file = filesFrom(formData, "media")[0];
  const oldUrl = current ? [current.url] : [];

  if (file) {
    if (file.type === "image/gif") {
      const used = await countAnimated(supabase, userId, blockId);
      if (used >= mediaConfig.cardMedia.maxAnimatedPerPage) {
        return {
          error: `A page can have up to ${mediaConfig.cardMedia.maxAnimatedPerPage} GIFs in its cards. Remove a GIF from another card first.`,
        };
      }
    }
    const up = await uploadCardMedia(userId, file);
    if ("error" in up) return { error: up.error };
    return { media: { url: up.url, kind: up.kind, ...settings.data }, fresh: [up.url], removed: oldUrl };
  }

  if (formData.get("remove_media") === "on") return { media: null, fresh: [], removed: oldUrl };
  if (current) return { media: { ...current, ...settings.data }, fresh: [], removed: [] };
  return { media: null, fresh: [], removed: [] };
}

function toRow(
  v: BlockInput,
  imageUrl: string | null,
  images: string[],
  media: CardMedia | null,
  current: BlockData | null,
) {
  const hasUrl = v.type === "link" || v.type === "project" || v.type === "embed";
  const hasBody = v.type === "link" || v.type === "project" || v.type === "text";
  const hasImage = v.type === "link" || v.type === "project";

  const data: BlockData = {};
  if (v.type === "gallery") data.images = images;
  if (v.type === "socials") data.items = toSocialItems(splitLines(v.links));
  if (v.type === "countdown") data.target = localInputToIso(v.target) ?? undefined;
  // The media comes from planMedia, so saving a block never drops it.
  if (hasImage && media) data.media = media;
  // Home flag, shape and download links are set on the Pages screen (item_fields=1).
  // Any other screen keeps what is saved.
  if (hasImage) {
    const src = v.items
      ? { home: v.home, shape: v.shape, nexus: v.nexus, github: v.github }
      : { home: current?.home, shape: current?.shape, nexus: current?.nexus, github: current?.github };
    if (src.home) data.home = true;
    if (src.shape && src.shape !== "card") data.shape = src.shape;
    if (src.nexus) data.nexus = src.nexus;
    if (src.github) data.github = src.github;
  }

  return {
    type: v.type,
    page: v.page,
    title: v.title,
    url: hasUrl ? (v.url ?? null) : null,
    body: hasBody ? (v.body ?? null) : null,
    image_url: hasImage ? imageUrl : null,
    data,
    publish_at: localInputToIso(v.publish_at),
    expire_at: localInputToIso(v.expire_at),
  };
}

export async function createBlockAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = backOf(formData);
  const parsed = parseBlockForm(formData);
  if (!parsed.success) return redirectWithError(back, firstError(parsed.error));
  const v = parsed.data;

  const single = v.type === "link" || v.type === "project" ? filesFrom(formData, "image").slice(0, 1) : [];
  const multi = v.type === "gallery" ? filesFrom(formData, "images") : [];
  if (v.type === "gallery") {
    if (multi.length === 0) return redirectWithError(back, galleryEmpty);
    if (multi.length > mediaConfig.maxGallery) return redirectWithError(back, galleryFull);
  }

  const uploaded = await uploadImages(user.id, [...single, ...multi]);
  if ("error" in uploaded) return redirectWithError(back, uploaded.error);
  const imageUrl = single.length > 0 ? (uploaded.urls[0] ?? null) : null;
  const images = v.type === "gallery" ? uploaded.urls : [];

  const supabase = await createClient();
  const plan = await planMedia(supabase, user.id, formData, v.type, null, null);
  if ("error" in plan) {
    await removeImages(user.id, uploaded.urls);
    return redirectWithError(back, plan.error);
  }
  const { data: last } = await supabase
    .from("blocks")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = ((last?.position as number | undefined) ?? -1) + 1;
  const { error } = await supabase
    .from("blocks")
    .insert({ user_id: user.id, position, ...toRow(v, imageUrl, images, plan.media, null) });
  if (error) {
    await removeImages(user.id, [...uploaded.urls, ...plan.fresh]);
    return redirectWithError(back, `Could not add the block: ${error.message}`);
  }

  redirectWithSaved(back, "Block added.");
}

export async function updateBlockAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = backOf(formData);
  const id = field(formData, "id");
  if (!id) return redirectWithError(back, "Missing block.");
  const parsed = parseBlockForm(formData);
  if (!parsed.success) return redirectWithError(back, firstError(parsed.error));
  const v = parsed.data;

  const supabase = await createClient();
  const { data: found } = await supabase
    .from("blocks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!found) return redirectWithError(back, "Block not found.");
  const current = found as Block;
  if (current.type !== v.type) return redirectWithError(back, "A block's type cannot be changed.");

  const single = v.type === "link" || v.type === "project" ? filesFrom(formData, "image").slice(0, 1) : [];
  const multi = v.type === "gallery" ? filesFrom(formData, "images") : [];

  let imageUrl = current.image_url;
  let images = current.data.images ?? [];
  const removed: string[] = [];

  if (v.type === "link" || v.type === "project") {
    if (single.length > 0 || formData.get("remove_image") === "on") {
      if (current.image_url) removed.push(current.image_url);
      imageUrl = null;
    }
  }
  if (v.type === "gallery") {
    const drop = new Set(
      formData.getAll("remove_images").filter((x): x is string => typeof x === "string"),
    );
    removed.push(...images.filter((url) => drop.has(url)));
    images = images.filter((url) => !drop.has(url));
    if (images.length + multi.length === 0) return redirectWithError(back, galleryEmpty);
    if (images.length + multi.length > mediaConfig.maxGallery) {
      return redirectWithError(back, galleryFull);
    }
  }

  const uploaded = await uploadImages(user.id, [...single, ...multi]);
  if ("error" in uploaded) return redirectWithError(back, uploaded.error);
  if (single.length > 0) imageUrl = uploaded.urls[0] ?? null;
  if (v.type === "gallery") images = [...images, ...uploaded.urls];

  const plan = await planMedia(supabase, user.id, formData, v.type, current.data.media ?? null, id);
  if ("error" in plan) {
    await removeImages(user.id, uploaded.urls);
    return redirectWithError(back, plan.error);
  }

  const { error } = await supabase
    .from("blocks")
    .update(toRow(v, imageUrl, images, plan.media, current.data))
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    await removeImages(user.id, [...uploaded.urls, ...plan.fresh]);
    return redirectWithError(back, `Could not save the block: ${error.message}`);
  }

  await removeImages(user.id, [...removed, ...plan.removed]);
  redirectWithSaved(back, "Block saved.");
}

export async function deleteBlockAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = backOf(formData);
  const id = field(formData, "id");
  if (!id) return redirectWithError(back, "Missing block.");

  const supabase = await createClient();
  const { data: found } = await supabase
    .from("blocks")
    .select("image_url, data")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("blocks").delete().eq("id", id).eq("user_id", user.id);
  if (error) return redirectWithError(back, `Could not delete the block: ${error.message}`);

  if (found) {
    const data = (found.data ?? {}) as BlockData;
    await removeImages(user.id, [
      found.image_url as string | null,
      ...(data.images ?? []),
      data.media?.url,
    ]);
  }
  redirectWithSaved(back, "Block deleted.");
}

export async function reorderBlocksAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = backOf(formData);
  const order = (field(formData, "order") ?? "").split(",").filter(Boolean);

  const supabase = await createClient();
  const { data } = await supabase.from("blocks").select("id").eq("user_id", user.id);
  const owned = new Set(((data ?? []) as { id: string }[]).map((r) => r.id));

  const valid =
    order.length === owned.size &&
    new Set(order).size === order.length &&
    order.every((id) => owned.has(id));
  if (!valid) {
    return redirectWithError(back, "Could not reorder: the list is out of date. Reload the page.");
  }

  const results = await Promise.all(
    order.map((id, index) =>
      supabase.from("blocks").update({ position: index }).eq("id", id).eq("user_id", user.id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return redirectWithError(back, `Could not reorder: ${failed.error.message}`);
  }
  revalidatePath(back);
}

const moveSchema = z.object({ id: z.string().min(1), direction: z.enum(["up", "down"]) });

export async function moveBlockAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = moveSchema.safeParse({
    id: field(formData, "id"),
    direction: field(formData, "direction"),
  });
  if (!parsed.success) return redirect(back);

  const supabase = await createClient();
  const { data } = await supabase
    .from("blocks")
    .select("id")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  const rows = (data ?? []) as { id: string }[];
  const i = rows.findIndex((r) => r.id === parsed.data.id);
  const j = parsed.data.direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) return redirect(back);

  [rows[i], rows[j]] = [rows[j], rows[i]];
  const results = await Promise.all(
    rows.map((r, index) =>
      supabase.from("blocks").update({ position: index }).eq("id", r.id).eq("user_id", user.id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return redirectWithError(back, `Could not move the block: ${failed.error.message}`);
  redirect(back);
}

const flagSchema = z.object({
  id: z.string().min(1),
  flag: z.enum(["is_visible", "is_pinned"]),
  value: z.enum(["true", "false"]),
});

export async function setBlockFlagAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = backOf(formData);
  const parsed = flagSchema.safeParse({
    id: field(formData, "id"),
    flag: field(formData, "flag"),
    value: field(formData, "value"),
  });
  if (!parsed.success) return redirect(back);

  const supabase = await createClient();
  const { error } = await supabase
    .from("blocks")
    .update({ [parsed.data.flag]: parsed.data.value === "true" })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);
  if (error) return redirectWithError(back, `Could not update the block: ${error.message}`);

  const on = parsed.data.value === "true";
  const text =
    parsed.data.flag === "is_visible"
      ? on ? "Block is now visible." : "Block is now hidden."
      : on ? "Block pinned." : "Block unpinned.";
  redirectWithSaved(back, text);
}
