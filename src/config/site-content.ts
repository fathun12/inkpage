// Content settings of the public website. Plain data: no database and no React here.
// The Pages menu writes them to profiles.site. readSite reads them and never throws.

import { dayParts, type DayPart } from "@/config/intro";
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
  email: 120,
  highlights: 5,
  highlightBody: 1500,
  highlightMedia: 6,
  credit: 120,
  creditCount: 80,
  introHeadline: 120,
  introHeadlines: 3,
  greeting: 60,
  introNote: 160,
  visits: 6,
  visitName: 60,
  visitBody: 300,
  altNames: 5,
  altName: 60,
} as const;

export type IntroSettings = {
  enabled: boolean;
  // Own wording per part of the day. null = the built-in text (config/intro.ts).
  greetings: Record<DayPart, string | null>;
  note: string | null;
  headlines: string[];
};

export type NewsItem = { text: string; url: string | null };
export type VisitItem = { name: string; body: string | null; url: string };
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
  // The text under the Writing label on Home.
  cardsIntro: string | null;
  // The text under the Articles label on Home.
  articlesHomeIntro: string | null;
  // The text under the Projects label on Home.
  projectsHomeIntro: string | null;
  // The text under the Biblia label on Home (the page /biblia has its own text, bibliaIntro).
  bibliaHomeIntro: string | null;
  highlightsTitle: string | null;
  showcaseTitle: string | null;
  // The text under the Showcase label.
  showcaseIntro: string | null;
  // Address of the Biblia library (empty = no Biblia section) and its label.
  bibliaUrl: string | null;
  bibliaTitle: string | null;
  bibliaIntro: string | null;
  // Address of the House Showcase website (empty = no design section), its label and the text under the label.
  designsUrl: string | null;
  designsTitle: string | null;
  designsIntro: string | null;
  // GitHub username (empty = no GitHub section) and its label.
  githubUser: string | null;
  githubTitle: string | null;
  // Steam profile (SteamID64, 17 digits). Empty = no Steam section on the About page.
  steamId: string | null;
  // The media behind the Steam section of the About page (empty = none).
  steamMedia: string | null;
  // YouTube or Spotify link of the music player (empty = no player).
  musicUrl: string | null;
  // The "Visit website" cards of Home and the label above them.
  visitTitle: string | null;
  visits: VisitItem[];
  highlights: Highlight[];
  // Credit (source) text of a media, by the file name of the media.
  credits: Record<string, string>;
  projects: PageText;
  writing: PageText;
  articles: PageText;
  about: AboutText;
  // Other ways the owner's name is written. Only search engines see them (structured data), not visitors.
  alternateNames: string[];
  footerNote: string | null;
  // Email and WhatsApp number (digits with country code) of the footer Connect column.
  contactEmail: string | null;
  whatsapp: string | null;
  intro: IntroSettings;
  showClock: boolean;
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

// A GitHub username: letters, numbers and single hyphens, 1 to 39 characters.
export function githubName(v: unknown): string | null {
  return typeof v === "string" && /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(v) ? v : null;
}

// A SteamID64: 17 digits that start with 7656119.
export function steamIdNumber(v: unknown): string | null {
  return typeof v === "string" && /^7656119\d{10}$/.test(v) ? v : null;
}

// An email address: one @, a dot in the domain, no spaces.
export function emailAddress(v: unknown): string | null {
  return typeof v === "string" && v.length <= siteLimits.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
}

// A WhatsApp number for wa.me: digits only, country code first, no 0 and no + in front, 8 to 15 digits.
export function whatsappNumber(v: unknown): string | null {
  return typeof v === "string" && /^[1-9]\d{7,14}$/.test(v) ? v : null;
}

// Other ways the owner's name is written: trimmed, no repeats, no empty lines.
export function nameList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    const t = text(item, siteLimits.altName);
    if (t && !out.includes(t)) out.push(t);
    if (out.length >= siteLimits.altNames) break;
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

function readVisits(v: unknown): VisitItem[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, siteLimits.visits).flatMap((item): VisitItem[] => {
    const r = obj(item);
    const name = text(r.name, siteLimits.visitName);
    const url = link(r.url);
    return name && url ? [{ name, body: text(r.body, siteLimits.visitBody), url }] : [];
  });
}

function readIntro(v: unknown): IntroSettings {
  const r = obj(v);
  const g = obj(r.greetings);
  const greetings = Object.fromEntries(
    dayParts.map((part) => [part, text(g[part], siteLimits.greeting)]),
  ) as Record<DayPart, string | null>;
  const headlines = Array.isArray(r.headlines)
    ? r.headlines
        .map((h) => text(h, siteLimits.introHeadline))
        .filter((h): h is string => h !== null)
        .slice(0, siteLimits.introHeadlines)
    : [];
  return { enabled: r.enabled !== false, greetings, note: text(r.note, siteLimits.introNote), headlines };
}

export function readSite(raw: unknown): SiteSettings {
  const r = obj(raw);
  const projects = obj(r.projects);
  const writing = obj(r.writing);
  const articles = obj(r.articles);
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
    cardsIntro: text(r.cardsIntro, siteLimits.intro),
    articlesHomeIntro: text(r.articlesHomeIntro, siteLimits.intro),
    projectsHomeIntro: text(r.projectsHomeIntro, siteLimits.intro),
    bibliaHomeIntro: text(r.bibliaHomeIntro, siteLimits.intro),
    highlightsTitle: text(r.highlightsTitle, siteLimits.title),
    showcaseTitle: text(r.showcaseTitle, siteLimits.title),
    showcaseIntro: text(r.showcaseIntro, siteLimits.intro),
    bibliaUrl: link(r.bibliaUrl),
    bibliaTitle: text(r.bibliaTitle, siteLimits.title),
    bibliaIntro: text(r.bibliaIntro, siteLimits.intro),
    designsUrl: link(r.designsUrl),
    designsTitle: text(r.designsTitle, siteLimits.title),
    designsIntro: text(r.designsIntro, siteLimits.intro),
    githubUser: githubName(r.githubUser),
    githubTitle: text(r.githubTitle, siteLimits.title),
    steamId: steamIdNumber(r.steamId),
    steamMedia: link(r.steamMedia),
    musicUrl: link(r.musicUrl),
    visitTitle: text(r.visitTitle, siteLimits.title),
    visits: readVisits(r.visits),
    highlights: readHighlights(r.highlights),
    credits: creditMap(r.credits),
    projects: { title: text(projects.title, siteLimits.title), intro: text(projects.intro, siteLimits.intro) },
    writing: { title: text(writing.title, siteLimits.title), intro: text(writing.intro, siteLimits.intro) },
    articles: { title: text(articles.title, siteLimits.title), intro: text(articles.intro, siteLimits.intro) },
    about: {
      title: text(about.title, siteLimits.title),
      body: text(about.body, siteLimits.aboutBody),
      photo: link(about.photo),
    },
    alternateNames: nameList(r.alternateNames),
    footerNote: text(r.footerNote, siteLimits.footerNote),
    contactEmail: emailAddress(r.contactEmail),
    whatsapp: whatsappNumber(r.whatsapp),
    intro: readIntro(r.intro),
    showClock: r.showClock === true,
  };
}

// Every uploaded file the settings use. Files in the site folder that are not listed here get deleted.
export function siteMediaUrls(site: SiteSettings): string[] {
  return [
    ...site.hero,
    ...site.gallery,
    ...(site.indexMedia ? [site.indexMedia] : []),
    ...(site.about.photo ? [site.about.photo] : []),
    ...(site.steamMedia ? [site.steamMedia] : []),
    ...site.highlights.flatMap((h) => h.media),
  ];
}

export function hasAbout(site: SiteSettings): boolean {
  return Boolean(site.about.body || site.about.photo);
}