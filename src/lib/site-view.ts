import type { BackgroundView } from "@/config/background";
import { itemLimits } from "@/config/item-data";
import { fileKey, hasAbout, resolvePage, type BlockPage, type SiteSettings } from "@/config/site-content";
import type { Block, SocialItem } from "@/types/block";

export type MediaKind = "video" | "gif" | "image";

export function mediaKind(url: string): MediaKind {
  const path = url.split("?")[0].split("#")[0];
  if (/\.(mp4|webm)$/i.test(path)) return "video";
  if (/\.gif$/i.test(path)) return "gif";
  return "image";
}

// The credit (source) text written for a media, or null.
export function creditOf(credits: Record<string, string>, url: string | null | undefined): string | null {
  return url ? (credits[fileKey(url)] ?? null) : null;
}

// Links, projects and headers shown on one page.
export function listBlocks(blocks: Block[], page: BlockPage): Block[] {
  return blocks.filter(
    (b) => (b.type === "link" || b.type === "project" || b.type === "header") && resolvePage(b.page) === page,
  );
}

// Items marked "Also show on Home", split by their page.
function homeItems(blocks: Block[], page: BlockPage): Block[] {
  return blocks.filter(
    (b) => (b.type === "link" || b.type === "project") && b.data.home === true && resolvePage(b.page) === page,
  );
}

// Projects on Home. They do not slide.
export function homeProjects(blocks: Block[]): Block[] {
  return homeItems(blocks, "projects");
}

// Writing cards on Home. These are the ones that slide.
export function homeWriting(blocks: Block[]): Block[] {
  return newestFirst(homeItems(blocks, "writing"));
}

export function socialsOf(blocks: Block[]): SocialItem[] {
  return blocks.flatMap((b) => (b.type === "socials" ? (b.data.items ?? []) : []));
}

// The menu: Home, Projects and Writing are always there. Articles shows up once one is published.
// About shows up once it has content.
export function buildNav(
  base: string,
  site: SiteSettings,
  shop: { label: string } | null = null,
  hasArticles = false,
) {
  return [
    { label: "Home", href: base },
    { label: site.projects.title ?? "Projects", href: `${base}/projects` },
    { label: site.writing.title ?? "Writing", href: `${base}/writing` },
    ...(hasArticles ? [{ label: site.articles.title ?? "Articles", href: `${base}/articles` }] : []),
    ...(site.bibliaUrl ? [{ label: site.bibliaTitle ?? "Biblia", href: `${base}/biblia` }] : []),
    ...(shop ? [{ label: shop.label, href: `${base}/shop` }] : []),
    ...(hasAbout(site) ? [{ label: site.about.title ?? "About", href: `${base}/about` }] : []),
  ];
}

export type HomeMedia = { hero: string[]; indexMedia: string | null; gallery: string[] };

// Uses what the Pages menu saved. What is still empty falls back to what the page used before:
// the Customize background for the hero, and gallery blocks for the list background and the gallery.
export function resolveHomeMedia(site: SiteSettings, background: BackgroundView, blocks: Block[]): HomeMedia {
  const legacy = blocks.flatMap((b) => (b.type === "gallery" ? (b.data.images ?? []) : []));

  let hero = site.hero;
  if (hero.length === 0) {
    const photoMode = background.mode === "full" || background.mode === "banner" || background.mode === "frame";
    const old =
      background.mode === "video" && background.videoUrl
        ? background.videoUrl
        : photoMode && background.imageUrl
          ? background.imageUrl
          : null;
    hero = old ? [old] : [];
  }

  let indexMedia = site.indexMedia;
  let gallery = site.gallery;
  if (gallery.length === 0 && !indexMedia) {
    if (legacy.length > 2) {
      indexMedia = legacy[0];
      gallery = legacy.slice(1);
    } else {
      gallery = legacy;
    }
  }
  return { hero, indexMedia, gallery };
}

// Projects ticked "Show as Showcase", in the order of the list, at most 5.
export function homeShowcase(blocks: Block[]): Block[] {
  return blocks
    .filter(
      (b) =>
        (b.type === "project" || b.type === "link") &&
        b.data.showcase === true &&
        resolvePage(b.page) === "projects",
    )
    .slice(0, itemLimits.homeShowcase);
}

// Newest first (by the day the item was added).
export function newestFirst(blocks: Block[]): Block[] {
  return [...blocks].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// The countdown shown as a section on Home: the nearest one that has not come yet.
// When every countdown has come, the one that came last. It stays until the owner hides or deletes it.
export function homeCountdown(blocks: Block[]): Block | null {
  const now = Date.now();
  const items = blocks
    .filter((b) => b.type === "countdown" && b.data.target)
    .map((b) => ({ block: b, end: new Date(b.data.target as string).getTime() }))
    .filter((item) => Number.isFinite(item.end));
  if (items.length === 0) return null;
  const upcoming = items.filter((item) => item.end > now).sort((a, b) => a.end - b.end);
  if (upcoming.length > 0) return upcoming[0].block;
  return [...items].sort((a, b) => b.end - a.end)[0].block;
}

// "Recently added" on the Writing page: the 5 newest.
export function recentWriting(newest: Block[]): Block[] {
  return newest.slice(0, 5);
}

// Writing links marked "Journal article", newest first. The Journal slider shows these.
export function journalWriting(blocks: Block[]): Block[] {
  return newestFirst(
    blocks.filter(
      (b) =>
        (b.type === "link" || b.type === "project") && resolvePage(b.page) === "writing" && b.data.journal === true,
    ),
  );
}