import { shopConfig } from "@/config/shop";
import { readSite, siteMediaUrls } from "@/config/site-content";
import { findSitePaths } from "@/features/media/upload";
import { getProfileById } from "@/features/profile/queries";
import { sweepKeeping } from "@/features/site/sweep";

function strings(formData: FormData, name: string): string[] {
  return formData.getAll(name).filter((x): x is string => typeof x === "string");
}

// Saved media + new uploads - removed ones. Files go to the public site folder (same flow as the Pages screen).
export async function readProductMedia(
  userId: string,
  formData: FormData,
  old: unknown,
): Promise<{ list: string[] } | { error: string }> {
  const current = Array.isArray(old) ? old.filter((u): u is string => typeof u === "string") : [];
  const removed = new Set(strings(formData, "remove_product"));
  const found = await findSitePaths(userId, strings(formData, "add_product"));
  if ("error" in found) return { error: found.error };
  const kept = current.filter((u) => !removed.has(u));
  if (kept.length + found.urls.length > shopConfig.limits.media) {
    return { error: `A product can hold up to ${shopConfig.limits.media} media. Remove some first.` };
  }
  return { list: [...kept, ...found.urls] };
}

// Deletes uploaded files that nothing uses (never saved, or removed). Products, items and Pages are all kept.
export async function sweepSiteFiles(userId: string): Promise<void> {
  const profile = await getProfileById(userId);
  await sweepKeeping(userId, siteMediaUrls(readSite(profile?.site)));
}