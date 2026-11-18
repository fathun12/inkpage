"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/features/auth/queries";
import { filesFrom, removeImages, uploadImages } from "@/features/media/upload";
import { mediaConfig } from "@/config/media";
import { routes } from "@/config/site";
import { localInputToIso } from "@/lib/datetime";
import { redirectWithError } from "@/lib/flash";
import { field } from "@/lib/form";
import { splitLines, toSocialItems } from "@/lib/social";
import { createClient } from "@/lib/supabase/server";
import { firstError } from "@/lib/validation";
import type { Block, BlockData } from "@/types/block";
import { parseBlockForm, type BlockInput } from "./schema";

const back = routes.links;
const galleryEmpty = "A gallery needs at least one image.";
const galleryFull = `A gallery can hold up to ${mediaConfig.maxGallery} images.`;

function toRow(v: BlockInput, imageUrl: string | null, images: string[]) {
  const hasUrl = v.type === "link" || v.type === "project" || v.type === "embed";
  const hasBody = v.type === "link" || v.type === "project" || v.type === "text";
  const hasImage = v.type === "link" || v.type === "project";

  const data: BlockData = {};
  if (v.type === "gallery") data.images = images;
  if (v.type === "socials") data.items = toSocialItems(splitLines(v.links));
  if (v.type === "countdown") data.target = localInputToIso(v.target) ?? undefined;

  return {
    type: v.type,
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
    .insert({ user_id: user.id, position, ...toRow(v, imageUrl, images) });
  if (error) {
    await removeImages(user.id, uploaded.urls);
    return redirectWithError(back, "Could not add the block. Try again.");
  }

  redirect(back);
}

export async function updateBlockAction(formData: FormData): Promise<void> {
  const user = await requireUser();
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

  const { error } = await supabase
    .from("blocks")
    .update(toRow(v, imageUrl, images))
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    await removeImages(user.id, uploaded.urls);
    return redirectWithError(back, "Could not save the block. Try again.");
  }

  await removeImages(user.id, removed);
  redirect(back);
}

export async function deleteBlockAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = field(formData, "id");
  if (!id) return redirectWithError(back, "Missing block.");

  const supabase = await createClient();
  const { data: found } = await supabase
    .from("blocks")
    .select("image_url, data")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  await supabase.from("blocks").delete().eq("id", id).eq("user_id", user.id);

  if (found) {
    const data = (found.data ?? {}) as BlockData;
    await removeImages(user.id, [found.image_url as string | null, ...(data.images ?? [])]);
  }
  redirect(back);
}

export async function reorderBlocksAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const order = (field(formData, "order") ?? "").split(",").filter(Boolean);

  const supabase = await createClient();
  const { data } = await supabase.from("blocks").select("id").eq("user_id", user.id);
  const owned = new Set(((data ?? []) as { id: string }[]).map((r) => r.id));

  const valid =
    order.length === owned.size &&
    new Set(order).size === order.length &&
    order.every((id) => owned.has(id));
  if (!valid) return;

  await Promise.all(
    order.map((id, index) =>
      supabase.from("blocks").update({ position: index }).eq("id", id).eq("user_id", user.id),
    ),
  );
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
  await Promise.all(
    rows.map((r, index) =>
      supabase.from("blocks").update({ position: index }).eq("id", r.id).eq("user_id", user.id),
    ),
  );
  redirect(back);
}

const flagSchema = z.object({
  id: z.string().min(1),
  flag: z.enum(["is_visible", "is_pinned"]),
  value: z.enum(["true", "false"]),
});

export async function setBlockFlagAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = flagSchema.safeParse({
    id: field(formData, "id"),
    flag: field(formData, "flag"),
    value: field(formData, "value"),
  });
  if (!parsed.success) return redirect(back);

  const supabase = await createClient();
  await supabase
    .from("blocks")
    .update({ [parsed.data.flag]: parsed.data.value === "true" })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);
  redirect(back);
}
