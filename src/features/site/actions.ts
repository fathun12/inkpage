"use server";

import { z } from "zod";
import { routes } from "@/config/site";
import {
  readSite,
  siteLimits,
  siteMediaUrls,
  type NewsItem,
  type SiteSettings,
} from "@/config/site-content";
import { requireUser } from "@/features/auth/queries";
import { findSitePaths, signSiteUpload, sweepSiteMedia } from "@/features/media/upload";
import { getProfileById } from "@/features/profile/queries";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { field } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { firstError, isHttpUrl } from "@/lib/validation";
import type { VideoSignInput, VideoSignResult } from "@/types/media";

const back = routes.pages;

const slotMax = { hero: siteLimits.hero, index: 1, gallery: siteLimits.gallery, about: 1 } as const;
type Slot = keyof typeof slotMax;
const slotLabel: Record<Slot, string> = {
  hero: "The hero",
  index: "The list background",
  gallery: "The gallery",
  about: "The About photo",
};

function text(label: string, max: number) {
  return z.string().trim().max(max, `${label} can be at most ${max} characters.`).optional();
}

const textSchema = z.object({
  hero_caption: text("The hero caption", siteLimits.caption),
  projects_title: text("The Projects title", siteLimits.title),
  projects_intro: text("The Projects text", siteLimits.intro),
  writing_title: text("The Writing title", siteLimits.title),
  writing_intro: text("The Writing text", siteLimits.intro),
  about_title: text("The About title", siteLimits.title),
  about_body: text("The About text", siteLimits.aboutBody),
  footer_note: text("The footer note", siteLimits.footerNote),
});

function readNews(formData: FormData): { items: NewsItem[] } | { error: string } {
  const items: NewsItem[] = [];
  for (let i = 0; i < siteLimits.news; i++) {
    const line = field(formData, `news_text_${i}`);
    const url = field(formData, `news_url_${i}`);
    if (!line) {
      if (url) return { error: `News line ${i + 1} has a link but no text.` };
      continue;
    }
    if (line.length > siteLimits.newsText) {
      return { error: `News line ${i + 1} can be at most ${siteLimits.newsText} characters.` };
    }
    if (url && !isHttpUrl(url)) {
      return { error: `The link of news line ${i + 1} must start with http:// or https://` };
    }
    items.push({ text: line, url: url ?? null });
  }
  return { items };
}

// Kept items + new uploads. A list of one (list background, About photo) is replaced by a new upload.
function merge(
  slot: Slot,
  old: string[],
  removed: Set<string>,
  added: string[],
): { list: string[] } | { error: string } {
  const max = slotMax[slot];
  const kept = old.filter((url) => !removed.has(url));
  if (max === 1) return { list: added.length > 0 ? [added[added.length - 1]] : kept.slice(0, 1) };
  if (kept.length + added.length > max) {
    return { error: `${slotLabel[slot]} can hold up to ${max} items. Remove some first.` };
  }
  return { list: [...kept, ...added] };
}

function strings(formData: FormData, name: string): string[] {
  return formData.getAll(name).filter((x): x is string => typeof x === "string");
}

// Called by the browser before it uploads a file straight to Storage.
export async function signSiteUploadAction(input: VideoSignInput): Promise<VideoSignResult> {
  const user = await requireUser();
  return signSiteUpload(user.id, input);
}

export async function saveSiteAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const current = await getProfileById(user.id);
  const old = readSite(current?.site);

  // Files uploaded but not saved are lost after a redirect, so they are deleted on every failure.
  const abort = async (message: string): Promise<void> => {
    await sweepSiteMedia(user.id, siteMediaUrls(old));
    return redirectWithError(back, message);
  };

  const parsed = textSchema.safeParse({
    hero_caption: field(formData, "hero_caption"),
    projects_title: field(formData, "projects_title"),
    projects_intro: field(formData, "projects_intro"),
    writing_title: field(formData, "writing_title"),
    writing_intro: field(formData, "writing_intro"),
    about_title: field(formData, "about_title"),
    about_body: field(formData, "about_body"),
    footer_note: field(formData, "footer_note"),
  });
  if (!parsed.success) return abort(firstError(parsed.error));
  const v = parsed.data;

  const news = readNews(formData);
  if ("error" in news) return abort(news.error);

  const oldBySlot: Record<Slot, string[]> = {
    hero: old.hero,
    index: old.indexMedia ? [old.indexMedia] : [],
    gallery: old.gallery,
    about: old.about.photo ? [old.about.photo] : [],
  };
  const lists = {} as Record<Slot, string[]>;
  for (const slot of Object.keys(slotMax) as Slot[]) {
    const found = await findSitePaths(user.id, strings(formData, `add_${slot}`));
    if ("error" in found) return abort(found.error);
    const merged = merge(slot, oldBySlot[slot], new Set(strings(formData, `remove_${slot}`)), found.urls);
    if ("error" in merged) return abort(merged.error);
    lists[slot] = merged.list;
  }

  const next: SiteSettings = {
    news: news.items,
    heroCaption: v.hero_caption ?? null,
    hero: lists.hero,
    indexMedia: lists.index[0] ?? null,
    gallery: lists.gallery,
    projects: { title: v.projects_title ?? null, intro: v.projects_intro ?? null },
    writing: { title: v.writing_title ?? null, intro: v.writing_intro ?? null },
    about: { title: v.about_title ?? null, body: v.about_body ?? null, photo: lists.about[0] ?? null },
    footerNote: v.footer_note ?? null,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ site: next }).eq("id", user.id);
  if (error) {
    const missing = error.code === "PGRST204" || error.code === "42703";
    return abort(
      missing
        ? "The database does not know these settings yet. Run the newest migration (20261124010000_site_pages.sql) in Supabase, then save again."
        : `Could not save: ${error.message}`,
    );
  }

  await sweepSiteMedia(user.id, siteMediaUrls(next));
  redirectWithSaved(back, "Saved.");
}