import type { BackgroundView } from "@/config/background";
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

// Items of Projects and Writing that were marked "Also show on Home": the sliding cards on Home.
export function homeCards(blocks: Block[]): Block[] {
  return blocks.filter(
    (b) =>
      (b.type === "link" || b.type === "project") && b.data.home === true && resolvePage(b.page) !== "home",
  );
}

export function socialsOf(blocks: Block[]): SocialItem[] {
  return blocks.flatMap((b) => (b.type === "socials" ? (b.data.items ?? []) : []));
}

// The menu: Home, Projects and Writing are always there. About shows up once it has content.
export function buildNav(base: string, site: SiteSettings) {
  return [
    { label: "Home", href: base },
    { label: site.projects.title ?? "Projects", href: `${base}/projects` },
    { label: site.writing.title ?? "Writing", href: `${base}/writing` },
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