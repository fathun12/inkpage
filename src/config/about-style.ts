// Settings of the About page (Customize studio, page "About"). Plain data: no database and no React here.
// Stored in profiles.site_style next to the Home settings. The readers never throw.

import { readChoice, sectionSpace, sectionSurfaces, type SectionSetting } from "@/config/layout";

export const aboutSectionIds = ["profile", "steam"] as const;
export type AboutSectionId = (typeof aboutSectionIds)[number];

export const aboutSectionLabels: Record<AboutSectionId, string> = {
  profile: "Photo and text",
  steam: "Steam",
};

export type AboutSections = Record<AboutSectionId, SectionSetting>;

const none = (): SectionSetting => ({ hidden: false, top: 0, bottom: 0, surface: "page", line: false });

export const aboutSectionDefaults: AboutSections = { profile: none(), steam: none() };

// The photo and the text of the About page. Photo left is the original look.
export const aboutLayouts = ["split", "flip", "stack"] as const;
export type AboutLayout = (typeof aboutLayouts)[number];

export const aboutLayoutLabels: Record<AboutLayout, string> = {
  split: "Photo left",
  flip: "Photo right",
  stack: "Photo on top",
};

export const aboutLayoutHints: Record<AboutLayout, string> = {
  split: "Photo on the left, text on the right (the original).",
  flip: "Text on the left, photo on the right.",
  stack: "Photo on top, text below. A portrait or square photo stays narrow; a landscape photo spans the page.",
};

export const aboutPhotoShapes = ["portrait", "square", "landscape"] as const;
export type AboutPhotoShape = (typeof aboutPhotoShapes)[number];

export const aboutPhotoLabels: Record<AboutPhotoShape, string> = {
  portrait: "Portrait",
  square: "Square",
  landscape: "Landscape",
};

export const aboutPhotoHints: Record<AboutPhotoShape, string> = {
  portrait: "4:5, tall (the original). The photo is cropped to this shape.",
  square: "1:1. The photo is cropped to this shape.",
  landscape: "3:2, wide and low. The photo is cropped to this shape.",
};

// The Steam section of the About page.
export const steamLayouts = ["split", "stack"] as const;
export type SteamLayout = (typeof steamLayouts)[number];

export const steamLayoutLabels: Record<SteamLayout, string> = {
  split: "Side by side",
  stack: "Stacked",
};

export const steamLayoutHints: Record<SteamLayout, string> = {
  split: "Profile on the left, games on the right (the original).",
  stack: "Profile on top, games below.",
};

export const aboutDefaults: {
  aboutLayout: AboutLayout;
  aboutPhoto: AboutPhotoShape;
  steamLayout: SteamLayout;
} = {
  aboutLayout: "split",
  aboutPhoto: "portrait",
  steamLayout: "split",
};

function space(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  const n = Math.min(sectionSpace.max, Math.max(sectionSpace.min, value));
  return Math.round(n / sectionSpace.step) * sectionSpace.step;
}

// Safe reader: missing or dirty data gives the default. Unknown ids are dropped. Never throws.
export function readAboutSections(raw: unknown): AboutSections {
  const all = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out: AboutSections = { profile: none(), steam: none() };
  for (const id of aboutSectionIds) {
    const e = all[id];
    const o = typeof e === "object" && e !== null && !Array.isArray(e) ? (e as Record<string, unknown>) : {};
    out[id] = {
      hidden: o.hidden === true,
      top: space(o.top),
      bottom: space(o.bottom),
      surface: readChoice(o.surface, sectionSurfaces, "page"),
      line: o.line === true,
    };
  }
  return out;
}

// Unknown ids and repeats are dropped, and a missing section is added at the end.
export function readAboutOrder(raw: unknown): AboutSectionId[] {
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set<AboutSectionId>();
  for (const value of list) {
    if ((aboutSectionIds as readonly string[]).includes(value as string)) seen.add(value as AboutSectionId);
  }
  for (const id of aboutSectionIds) seen.add(id);
  return [...seen];
}