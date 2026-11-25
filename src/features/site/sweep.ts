import { sweepSiteMedia } from "@/features/media/upload";
import { createClient } from "@/lib/supabase/server";
import type { BlockData } from "@/types/block";

// Deletes unused files of the site folder, but never a file that an item uses: Projects media
// (blocks.data.files) and Writing images (blocks.image_url) live in the same folder.
// If the items cannot be read, nothing is swept (a stray file is better than a lost one).
export async function sweepKeeping(userId: string, keep: string[]): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("blocks").select("data, image_url").eq("user_id", userId);
  if (error || !data) {
    console.error("sweepKeeping: could not read the items, nothing was swept", error?.message);
    return;
  }
  const used = (data as { data: BlockData | null; image_url: string | null }[]).flatMap((row) => {
    const files = Array.isArray(row.data?.files) ? row.data.files : [];
    const urls = files.map((f) => f?.url).filter((u): u is string => typeof u === "string");
    const downloads = Array.isArray(row.data?.downloads) ? row.data.downloads : [];
    const logos = downloads.map((d) => d?.logoUrl).filter((u): u is string => typeof u === "string");
    const all = [...urls, ...logos];
    return row.image_url ? [...all, row.image_url] : all;
  });
  // Shop product media lives in the same folder too.
  const shop = await supabase.from("products").select("media").eq("user_id", userId);
  if (shop.error) {
    console.error("sweepKeeping: could not read the products, nothing was swept", shop.error.message);
    return;
  }
  const productMedia = ((shop.data ?? []) as { media: unknown }[]).flatMap((row) =>
    Array.isArray(row.media) ? row.media.filter((u): u is string => typeof u === "string") : [],
  );
  await sweepSiteMedia(userId, [...keep, ...used, ...productMedia]);
}