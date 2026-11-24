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
    return row.image_url ? [...urls, row.image_url] : urls;
  });
  await sweepSiteMedia(userId, [...keep, ...used]);
}