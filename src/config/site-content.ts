// Content settings of the public website. Plain data: no database and no React here.
// The Pages menu writes them to profiles.site. readSite reads them and never throws.

import type { ItemShape } from "@/types/block";

export const blockPages = ["home", "projects", "writing"] as const;
export type BlockPage = (typeof blockPages)[number];

export const blockPageLabels: Record<BlockPage, string> = {
  home: "Home",
  projects: "Projects",
  writing: "Writing",
};

export const itemShapeLabels: Record<ItemShape, string> = {
  card: "Card (image, title, text)",
  button: "Button (title only)",
  text: "Text link (big title)",
};

export function resolvePage(value: string | null | undefined): BlockPage {
  return (blockPages as readonly string[]).includes(value ?? "") ? (value as BlockPage) : "home";
}

export const siteLimits = {
  news: 5,
  newsText: 120,
  hero: 6,
  gallery: 12,
  caption: 160,
  title: 60,
  intro: 400,
  aboutBody: 4000,
  footerNote: 200,
  highlights: 5,
  highlightBody: 1500,
  highlightMedia: 6,
  credit: 120,
  creditCount: 80,
} as const;

export type NewsItem = { text: string; url: string | null };
export type PageText = { title: string | null; intro: string | null };
export type AboutText = { title: string | null; body: string | null; photo: string | null };
export type Highlight = {
  title: string | null;
  body: string | null;
  media: string[];
  nexus: string | null;
  github: string | null;
};

// Shown in the news bar until you write your own lines in Pages.
export const defaultNews: NewsItem[] = [
  { text: "Selected projects, writing and downloads. New work is added here.", url: null },
];

export type SiteSettings = {
  news: NewsItem[];
  heroCaption: string | null;
  hero: string[];
  indexMedia: string | null;
  gallery: string[];
  cardsTitle: string | null;
  highlightsTitle: string | null;
  showcaseTitle: string | null;
  // Address of the Biblia library (empty = no Biblia section) and its label.
  bibliaUrl: string | null;
  bibliaTitle: string | null;
  bibliaIntro: string | null;
  highlights: Highlight[];
  // Credit (source) text of a media, by the file name of the media.
  credits: Record<string, string>;
  projects: PageText;
  writing: PageText;
  about: AboutText;
  footerNote: string | null;
};

const httpUrl = /^https?:\/\//i;

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function text(v: unknown, max: number): string | null {
  return typeof v === "string" && v.trim() !== "" ? v.trim().slice(0, max) : null;
}

function link(v: unknown): string | null {
  return typeof v === "string" && httpUrl.test(v) ? v : null;
}

function links(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(link).filter((x): x is string => x !== null).slice(0, max);
}

// The file name at the end of a media address. It is the key of a credit.
export function fileKey(url: string): string {
  return url.split("?")[0].split("#")[0].split("/").pop() ?? url;
}

function creditMap(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj(v)).slice(0, siteLimits.creditCount)) {
    const t = text(value, siteLimits.credit);
    if (t && /^[\w.-]+$/.test(key)) out[key] = t;
  }
  return out;
}

function readHighlights(v: unknown): Highlight[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, siteLimits.highlights).flatMap((item): Highlight[] => {
    const h = obj(item);
    // Older saves kept one media as a text. Newer ones keep a list.
    const single = link(h.media);
    const media = Array.isArray(h.media)
      ? links(h.media, siteLimits.highlightMedia)
      : single
        ? [single]
        : [];
    const entry: Highlight = {
      title: text(h.title, siteLimits.title),
      body: text(h.body, siteLimits.highlightBody),
      media,
      nexus: link(h.nexus),
      github: link(h.github),
    };
    return entry.title || entry.body || entry.media.length > 0 || entry.nexus || entry.github ? [entry] : [];
  });
}

export function readSite(raw: unknown): SiteSettings {
  const r = obj(raw);
  const projects = obj(r.projects);
  const writing = obj(r.writing);
  const about = obj(r.about);
  const news = Array.isArray(r.news)
    ? r.news.slice(0, siteLimits.news).flatMap((item): NewsItem[] => {
        const n = obj(item);
        const t = text(n.text, siteLimits.newsText);
        return t ? [{ text: t, url: link(n.url) }] : [];
      })
    : [];
  return {
    news: news.length > 0 ? news : defaultNews,
    heroCaption: text(r.heroCaption, siteLimits.caption),
    hero: links(r.hero, siteLimits.hero),
    indexMedia: link(r.indexMedia),
    gallery: links(r.gallery, siteLimits.gallery),
    cardsTitle: text(r.cardsTitle, siteLimits.title),
    highlightsTitle: text(r.highlightsTitle, siteLimits.title),
    showcaseTitle: text(r.showcaseTitle, siteLimits.title),
    bibliaUrl: link(r.bibliaUrl),
    bibliaTitle: text(r.bibliaTitle, siteLimits.title),
    bibliaIntro: text(r.bibliaIntro, siteLimits.intro),
    highlights: readHighlights(r.highlights),
    credits: creditMap(r.credits),
    projects: { title: text(projects.title, siteLimits.title), intro: text(projects.intro, siteLimits.intro) },
    writing: { title: text(writing.title, siteLimits.title), intro: text(writing.intro, siteLimits.intro) },
    about: {
      title: text(about.title, siteLimits.title),
      body: text(about.body, siteLimits.aboutBody),
      photo: link(about.photo),
    },
    footerNote: text(r.footerNote, siteLimits.footerNote),
  };
}

// Every uploaded file the settings use. Files in the site folder that are not listed here get deleted.
export function siteMediaUrls(site: SiteSettings): string[] {
  return [
    ...site.hero,
    ...site.gallery,
    ...(site.indexMedia ? [site.indexMedia] : []),
    ...(site.about.photo ? [site.about.photo] : []),
    ...site.highlights.flatMap((h) => h.media),
  ];
}

export function hasAbout(site: SiteSettings): boolean {
  return Boolean(site.about.body || site.about.photo);
}