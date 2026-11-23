// Content settings of the public website. Plain data: no database and no React here.
// The Pages menu writes them to profiles.site. readSite reads them and never throws.

export const blockPages = ["home", "projects", "writing"] as const;
export type BlockPage = (typeof blockPages)[number];

export const blockPageLabels: Record<BlockPage, string> = {
  home: "Home",
  projects: "Projects",
  writing: "Writing",
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
} as const;

export type NewsItem = { text: string; url: string | null };
export type PageText = { title: string | null; intro: string | null };
export type AboutText = { title: string | null; body: string | null; photo: string | null };

export type SiteSettings = {
  news: NewsItem[];
  heroCaption: string | null;
  hero: string[];
  indexMedia: string | null;
  gallery: string[];
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
    news,
    heroCaption: text(r.heroCaption, siteLimits.caption),
    hero: links(r.hero, siteLimits.hero),
    indexMedia: link(r.indexMedia),
    gallery: links(r.gallery, siteLimits.gallery),
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
  ];
}

export function hasAbout(site: SiteSettings): boolean {
  return Boolean(site.about.body || site.about.photo);
}