// Layout settings of the public website (Customize studio, "Layout"). Plain data: no database and no React here.
// Only the names live here. The sizes (rem) are in styles/site.css (--sec and the .site-proj-* rules).

export const densityModes = ["compact", "comfortable", "airy"] as const;
export type DensityMode = (typeof densityModes)[number];

export const densityLabels: Record<DensityMode, string> = {
  compact: "Compact",
  comfortable: "Comfortable",
  airy: "Airy",
};

export const densityHints: Record<DensityMode, string> = {
  compact: "Sections sit close together.",
  comfortable: "The original space between sections.",
  airy: "More empty space between sections.",
};

export const projectSizes = ["small", "medium", "large"] as const;
export type ProjectSize = (typeof projectSizes)[number];

export const projectSizeLabels: Record<ProjectSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

export const projectSizeHints: Record<ProjectSize, string> = {
  small: "Narrow photo column, small title, tight rows.",
  medium: "A bit narrower photos and tighter rows.",
  large: "The original size.",
};

export const layoutDefaults: { density: DensityMode; projectSize: ProjectSize } = {
  density: "comfortable",
  projectSize: "large",
};

// Safe reader: an unknown or missing value falls back to the default.
export function readChoice<T extends string>(value: unknown, list: readonly T[], fallback: T): T {
  return (list as readonly string[]).includes(value as string) ? (value as T) : fallback;
}

// The sections of Home the owner can hide and give extra space (Customize, "Sections").
// The hero and the footer are fixed and not in this list. The order here is the order on the page.
export const sectionIds = [
  "countdown",
  "writing",
  "articles",
  "projects",
  "biblia",
  "github",
  "shop",
  "links",
  "showcase",
  "designs",
  "visit",
  "gallery",
] as const;
export type SectionId = (typeof sectionIds)[number];

export const sectionLabels: Record<SectionId, string> = {
  countdown: "Countdown",
  writing: "Writing",
  articles: "Articles",
  projects: "Projects",
  biblia: "Biblia",
  github: "GitHub",
  shop: "Shop",
  links: "Links",
  showcase: "Showcase",
  designs: "Design projects",
  visit: "Visit website",
  gallery: "Gallery",
};

// The gallery is one full frame without padding, so it only has the Show tick.
export const sectionHasSpace: Record<SectionId, boolean> = {
  countdown: true,
  writing: true,
  articles: true,
  projects: true,
  biblia: true,
  github: true,
  shop: true,
  links: true,
  showcase: true,
  designs: true,
  visit: true,
  gallery: false,
};

// Extra space (rem) added to, or taken from, the Spacing choice. 0 = unchanged.
export const sectionSpace = { min: -6, max: 6, step: 0.5 } as const;

export type SectionSetting = { hidden: boolean; top: number; bottom: number };
export type SectionSettings = Record<SectionId, SectionSetting>;

const none = (): SectionSetting => ({ hidden: false, top: 0, bottom: 0 });

export const sectionDefaults: SectionSettings = {
  countdown: none(),
  writing: none(),
  articles: none(),
  projects: none(),
  biblia: none(),
  github: none(),
  shop: none(),
  links: none(),
  showcase: none(),
  designs: none(),
  visit: none(),
  gallery: none(),
};

function space(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  const n = Math.min(sectionSpace.max, Math.max(sectionSpace.min, value));
  return Math.round(n / sectionSpace.step) * sectionSpace.step;
}

// Safe reader: missing or dirty data gives the default. Unknown ids are dropped. Never throws.
export function readSections(raw: unknown): SectionSettings {
  const all = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out = { ...sectionDefaults };
  for (const id of sectionIds) {
    const e = all[id];
    const o = typeof e === "object" && e !== null && !Array.isArray(e) ? (e as Record<string, unknown>) : {};
    out[id] = { hidden: o.hidden === true, top: space(o.top), bottom: space(o.bottom) };
  }
  return out;
}