"use server";

import { z } from "zod";
import { resolveTab, tabHref, type PagesTab } from "@/config/item-data";
import {
  emailAddress,
  fileKey,
  githubName,
  whatsappNumber,
  readSite,
  siteLimits,
  siteMediaUrls,
  type NewsItem,
  type SiteSettings,
  type VisitItem,
} from "@/config/site-content";
import { requireUser } from "@/features/auth/queries";
import { findSitePaths, signSiteUpload } from "@/features/media/upload";
import { getProfileById } from "@/features/profile/queries";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { field } from "@/lib/form";
import { musicEmbed } from "@/lib/music";
import { createClient } from "@/lib/supabase/server";
import { firstError, isHttpUrl } from "@/lib/validation";
import type { VideoSignInput, VideoSignResult } from "@/types/media";
import { sweepKeeping } from "./sweep";

const slotMax = {
  hero: siteLimits.hero,
  index: 1,
  gallery: siteLimits.gallery,
  about: 1,
} as const;
type Slot = keyof typeof slotMax;

// Which media slots each tab of the Pages screen has.
const tabSlots: Record<PagesTab, Slot[]> = {
  home: ["hero", "index", "gallery"],
  projects: [],
  writing: [],
  articles: [],
  about: ["about"],
  footer: [],
};

function slotLabel(slot: Slot): string {
  if (slot === "hero") return "The hero";
  if (slot === "index") return "The list background";
  if (slot === "gallery") return "The gallery";
  return "The About photo";
}

function text(label: string, max: number) {
  return z.string().trim().max(max, `${label} can be at most ${max} characters.`).optional();
}

const textSchema = z.object({
  hero_caption: text("The hero caption", siteLimits.caption),
  cards_title: text("The Writing label", siteLimits.title),
  showcase_title: text("The Showcase label", siteLimits.title),
  biblia_title: text("The Biblia label", siteLimits.title),
  biblia_intro: text("The Biblia text", siteLimits.intro),
  designs_title: text("The design projects label", siteLimits.title),
  github_title: text("The GitHub label", siteLimits.title),
  visit_title: text("The Visit website label", siteLimits.title),
  projects_title: text("The Projects title", siteLimits.title),
  projects_intro: text("The Projects text", siteLimits.intro),
  writing_title: text("The Writing title", siteLimits.title),
  writing_intro: text("The Writing text", siteLimits.intro),
  articles_title: text("The Articles title", siteLimits.title),
  articles_intro: text("The Articles text", siteLimits.intro),
  about_title: text("The About title", siteLimits.title),
  about_body: text("The About text", siteLimits.aboutBody),
  footer_note: text("The footer note", siteLimits.footerNote),
  contact_email: text("The email address", siteLimits.email),
  whatsapp: text("The WhatsApp number", 40),
  intro_note: text("The intro note", siteLimits.introNote),
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

function readVisitForm(formData: FormData): { items: VisitItem[] } | { error: string } {
  const items: VisitItem[] = [];
  for (let i = 0; i < siteLimits.visits; i++) {
    const name = field(formData, `visit_name_${i}`);
    const url = field(formData, `visit_url_${i}`);
    const body = field(formData, `visit_body_${i}`);
    if (!name && !url) {
      if (body) return { error: `Site ${i + 1} has a description but no name and no address.` };
      continue;
    }
    if (!name) return { error: `Site ${i + 1} has an address but no name.` };
    if (!url) return { error: `Site ${i + 1} has a name but no address.` };
    if (name.length > siteLimits.visitName) {
      return { error: `The name of site ${i + 1} can be at most ${siteLimits.visitName} characters.` };
    }
    if (!isHttpUrl(url)) return { error: `The address of site ${i + 1} must start with http:// or https://` };
    if (body && body.length > siteLimits.visitBody) {
      return { error: `The description of site ${i + 1} can be at most ${siteLimits.visitBody} characters.` };
    }
    items.push({ name, body: body ?? null, url });
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
    return { error: `${slotLabel(slot)} can hold up to ${max} items. Remove some first.` };
  }
  return { list: [...kept, ...added] };
}

function strings(formData: FormData, name: string): string[] {
  return formData.getAll(name).filter((x): x is string => typeof x === "string");
}

const one = (url: string | null | undefined): string[] => (url ? [url] : []);

// Called by the browser before it uploads a file straight to Storage.
export async function signSiteUploadAction(input: VideoSignInput): Promise<VideoSignResult> {
  const user = await requireUser();
  return signSiteUpload(user.id, input);
}

// Saves ONE tab of the Pages screen (the form says which one in "tab"). The other tabs keep what they have.
export async function saveSiteAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const tab = resolveTab(field(formData, "tab"));
  const back = tabHref(tab);
  const current = await getProfileById(user.id);
  const old = readSite(current?.site);

  // Files uploaded but not saved are lost after a redirect, so they are deleted on every failure.
  const abort = async (message: string): Promise<void> => {
    await sweepKeeping(user.id, siteMediaUrls(old));
    return redirectWithError(back, message);
  };

  const parsed = textSchema.safeParse({
    hero_caption: field(formData, "hero_caption"),
    cards_title: field(formData, "cards_title"),
    showcase_title: field(formData, "showcase_title"),
    biblia_title: field(formData, "biblia_title"),
    biblia_intro: field(formData, "biblia_intro"),
    designs_title: field(formData, "designs_title"),
    github_title: field(formData, "github_title"),
    visit_title: field(formData, "visit_title"),
    projects_title: field(formData, "projects_title"),
    projects_intro: field(formData, "projects_intro"),
    writing_title: field(formData, "writing_title"),
    writing_intro: field(formData, "writing_intro"),
    articles_title: field(formData, "articles_title"),
    articles_intro: field(formData, "articles_intro"),
    about_title: field(formData, "about_title"),
    about_body: field(formData, "about_body"),
    footer_note: field(formData, "footer_note"),
    contact_email: field(formData, "contact_email"),
    whatsapp: field(formData, "whatsapp"),
    intro_note: field(formData, "intro_note"),
  });
  if (!parsed.success) return abort(firstError(parsed.error));
  const v = parsed.data;

  const oldBySlot: Record<Slot, string[]> = {
    hero: old.hero,
    index: one(old.indexMedia),
    gallery: old.gallery,
    about: one(old.about.photo),
  };
  const lists: Partial<Record<Slot, string[]>> = {};
  for (const slot of tabSlots[tab]) {
    const found = await findSitePaths(user.id, strings(formData, `add_${slot}`));
    if ("error" in found) return abort(found.error);
    const merged = merge(slot, oldBySlot[slot], new Set(strings(formData, `remove_${slot}`)), found.urls);
    if ("error" in merged) return abort(merged.error);
    lists[slot] = merged.list;
  }
  const got = (slot: Slot): string[] => lists[slot] ?? oldBySlot[slot];

  const next: SiteSettings = { ...old };
  if (tab === "home") {
    const news = readNews(formData);
    if ("error" in news) return abort(news.error);
    next.news = news.items;
    next.heroCaption = v.hero_caption ?? null;
    next.cardsTitle = v.cards_title ?? null;
    next.showcaseTitle = v.showcase_title ?? null;
    const biblia = field(formData, "biblia_url");
    if (biblia && !isHttpUrl(biblia)) return abort("The Biblia address must start with http:// or https://");
    next.bibliaUrl = biblia ? biblia.replace(/\/+$/, "") : null;
    next.bibliaTitle = v.biblia_title ?? null;
    next.bibliaIntro = v.biblia_intro ?? null;
    const designs = field(formData, "designs_url");
    if (designs && !isHttpUrl(designs)) return abort("The House Showcase address must start with http:// or https://");
    next.designsUrl = designs ? designs.replace(/\/+$/, "") : null;
    next.designsTitle = v.designs_title ?? null;
    // A pasted address or an @ is accepted: only the username is kept.
    const gh = field(formData, "github_user")
      ?.replace(/^https?:\/\/(www\.)?github\.com\//i, "")
      .replace(/^@/, "")
      .replace(/[/?#].*$/, "");
    if (gh && !githubName(gh)) {
      return abort("The GitHub username can only use letters, numbers and hyphens, up to 39 characters.");
    }
    next.githubUser = gh ? gh : null;
    next.githubTitle = v.github_title ?? null;
    const visits = readVisitForm(formData);
    if ("error" in visits) return abort(visits.error);
    next.visits = visits.items;
    next.visitTitle = v.visit_title ?? null;
    const music = field(formData, "music_url");
    if (music && !musicEmbed(music)) {
      return abort("The music link must be a YouTube or Spotify link (a video, a song or a playlist).");
    }
    next.musicUrl = music ?? null;
    next.hero = got("hero");
    next.indexMedia = got("index")[0] ?? null;
    next.gallery = got("gallery");

    const headlines: string[] = [];
    for (let i = 0; i < siteLimits.introHeadlines; i++) {
      const h = field(formData, `intro_headline_${i}`);
      if (!h) continue;
      if (h.length > siteLimits.introHeadline) {
        return abort(`Big sentence ${i + 1} can be at most ${siteLimits.introHeadline} characters.`);
      }
      headlines.push(h);
    }
    next.intro = {
      enabled: formData.get("intro_enabled") === "on",
      greetings: old.intro.greetings,
      note: v.intro_note ?? null,
      headlines,
    };
    next.showClock = formData.get("show_clock") === "on";
  }
  if (tab === "projects") next.projects = { title: v.projects_title ?? null, intro: v.projects_intro ?? null };
  if (tab === "writing") next.writing = { title: v.writing_title ?? null, intro: v.writing_intro ?? null };
  if (tab === "articles") next.articles = { title: v.articles_title ?? null, intro: v.articles_intro ?? null };
  if (tab === "about") {
    next.about = { title: v.about_title ?? null, body: v.about_body ?? null, photo: got("about")[0] ?? null };
  }
  if (tab === "footer") {
    next.footerNote = v.footer_note ?? null;
    const email = v.contact_email ?? null;
    if (email && !emailAddress(email)) return abort("The email address is not valid. Example: name@example.com");
    next.contactEmail = email;
    // Spaces, dashes, dots and brackets are removed, and so is a + at the start.
    const wa = v.whatsapp?.replace(/[\s().-]/g, "").replace(/^\+/, "") ?? "";
    if (wa && !whatsappNumber(wa)) {
      return abort(
        "The WhatsApp number must start with the country code and have 8 to 15 digits, with no 0 in front. Example: 6281234567890",
      );
    }
    next.whatsapp = wa ? wa : null;
  }

  // Credits come as credit__<file name>. An empty box clears a credit. Only credits of files in use are kept.
  const typed: Record<string, string> = {};
  const cleared = new Set<string>();
  for (const [name, value] of formData.entries()) {
    if (!name.startsWith("credit__") || typeof value !== "string") continue;
    const key = name.slice("credit__".length);
    if (!/^[\w.-]+$/.test(key)) continue;
    const t = value.trim();
    if (t) typed[key] = t.slice(0, siteLimits.credit);
    else cleared.add(key);
  }
  const merged = { ...old.credits };
  for (const key of cleared) delete merged[key];
  Object.assign(merged, typed);
  const used = new Set(siteMediaUrls(next).map(fileKey));
  next.credits = Object.fromEntries(Object.entries(merged).filter(([key]) => used.has(key)));

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

  await sweepKeeping(user.id, siteMediaUrls(next));
  redirectWithSaved(back, "Saved.");
}