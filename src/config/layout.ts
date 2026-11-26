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

// How the Projects section looks on Home. The Projects page is always a list.
export const projectViews = ["list", "grid", "slider"] as const;
export type ProjectView = (typeof projectViews)[number];

export const projectViewLabels: Record<ProjectView, string> = {
  list: "List",
  grid: "Grid",
  slider: "Slider",
};

export const projectViewHints: Record<ProjectView, string> = {
  list: "Photos on the left, text on the right (the original).",
  grid: "Two columns: one photo on top, text below. One column on a phone.",
  slider: "One project at a time. It slides by itself and has arrows.",
};

// How the Design projects section looks on Home. Grid is the original look.
export const designViews = ["grid", "list", "slider"] as const;
export type DesignView = (typeof designViews)[number];

export const designViewLabels: Record<DesignView, string> = {
  grid: "Grid",
  list: "List",
  slider: "Slider",
};

export const designViewHints: Record<DesignView, string> = {
  grid: "Cards side by side: cover, photos and title (the original).",
  list: "One project per row: photos on the left, text on the right.",
  slider: "One project at a time. It slides by itself and has arrows.",
};

export const designSizes = ["small", "medium", "large"] as const;
export type DesignSize = (typeof designSizes)[number];

export const designSizeLabels: Record<DesignSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

export const designSizeHints: Record<DesignSize, string> = {
  small: "Five cards per row. In List and Slider: the narrowest photo column and the smallest title.",
  medium: "Four cards per row. In List and Slider: a narrower photo column and a smaller title.",
  large: "The original size: three cards per row on a wide screen.",
};

// Design projects on Home: inside the page margins (Centered, the original) or edge to edge (Full width).
export const designModes = ["centered", "full"] as const;
export type DesignMode = (typeof designModes)[number];

export const designModeLabels: Record<DesignMode, string> = {
  centered: "Centered",
  full: "Full width",
};

export const designModeHints: Record<DesignMode, string> = {
  centered: "Inside the page margins, clean on the left and right (the original).",
  full: "Edge to edge, like the hero and the gallery.",
};

// The Full width forms.
export const designWideViews = ["stack", "split", "sheet", "mosaic", "filmstrip"] as const;
export type DesignWideView = (typeof designWideViews)[number];

export const designWideViewLabels: Record<DesignWideView, string> = {
  stack: "Stack",
  split: "Split",
  sheet: "Contact sheet",
  mosaic: "Mosaic",
  filmstrip: "Filmstrip",
};

export const designWideViewHints: Record<DesignWideView, string> = {
  stack: "One project per row: a photo across the whole screen, a tight row of photos, then the title.",
  split: "Two columns edge to edge with tall photos.",
  sheet: "Square photos touching each other, like a contact sheet. The title shows on hover.",
  mosaic: "Photos of different sizes in one tight grid.",
  filmstrip: "One row of tall photos that slides sideways, with arrows.",
};

// How the Countdown section looks.
export const countdownViews = ["section", "strip"] as const;
export type CountdownView = (typeof countdownViews)[number];

export const countdownViewLabels: Record<CountdownView, string> = {
  section: "Section",
  strip: "Strip",
};

export const countdownViewHints: Record<CountdownView, string> = {
  section: "The full block: message, title, text and big numbers.",
  strip: "One thin line: the title and the time left.",
};

// projectMedia = height of each Projects photo on Home in rem. 0 = Auto (the shape of each photo, as before).
export const layoutDefaults: {
  density: DensityMode;
  projectSize: ProjectSize;
  projectView: ProjectView;
  projectMedia: number;
  countdownView: CountdownView;
  designSize: DesignSize;
  designView: DesignView;
  designMode: DesignMode;
  designWideView: DesignWideView;
  designMedia: number;
  designCount: number;
} = {
  density: "comfortable",
  projectSize: "large",
  projectView: "list",
  projectMedia: 0,
  countdownView: "section",
  designSize: "large",
  designView: "grid",
  designMode: "centered",
  designWideView: "stack",
  designMedia: 0,
  designCount: 3,
};

// Safe reader: an unknown or missing value falls back to the default.
export function readChoice<T extends string>(value: unknown, list: readonly T[], fallback: T): T {
  return (list as readonly string[]).includes(value as string) ? (value as T) : fallback;
}

// The sections of Home the owner can hide and give extra space (Customize, "Sections").
// The hero and the footer are fixed and not in this list. The order here is the default order on the page;
// the owner can change it in Customize (readOrder).
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

// Background of one section: the Page color (as now), the Tertiary color, or the Secondary color.
export const sectionSurfaces = ["page", "tertiary", "band"] as const;
export type SectionSurface = (typeof sectionSurfaces)[number];

export const sectionSurfaceLabels: Record<SectionSurface, string> = {
  page: "Page",
  tertiary: "Tertiary",
  band: "Secondary",
};

export const sectionSurfaceHints: Record<SectionSurface, string> = {
  page: "The page color (as now).",
  tertiary: "The Tertiary color, like the top of the footer.",
  band: "The Secondary color, like the news bar and the bottom of the footer.",
};

// GitHub and Links paint their own black background, so a Background choice would not show there.
export const sectionHasSurface: Record<SectionId, boolean> = {
  countdown: true,
  writing: true,
  articles: true,
  projects: true,
  biblia: true,
  github: false,
  shop: true,
  links: false,
  showcase: true,
  designs: true,
  visit: true,
  gallery: false,
};

export type SectionSetting = {
  hidden: boolean;
  top: number;
  bottom: number;
  surface: SectionSurface;
  line: boolean;
};
export type SectionSettings = Record<SectionId, SectionSetting>;

const none = (): SectionSetting => ({ hidden: false, top: 0, bottom: 0, surface: "page", line: false });

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
    out[id] = {
      hidden: o.hidden === true,
      top: space(o.top),
      bottom: space(o.bottom),
      surface: sectionHasSurface[id] ? readChoice(o.surface, sectionSurfaces, "page") : "page",
      line: sectionHasSpace[id] && o.line === true,
    };
  }
  return out;
}

// The order of the sections on Home. Safe reader: unknown ids and repeats are dropped, and any section
// that is missing is added at the end in its default place. Missing or dirty data gives the default order.
export function readOrder(raw: unknown): SectionId[] {
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set<SectionId>();
  for (const value of list) {
    if ((sectionIds as readonly string[]).includes(value as string)) seen.add(value as SectionId);
  }
  for (const id of sectionIds) seen.add(id);
  return [...seen];
}