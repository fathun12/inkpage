// Settings of Projects and Writing items (Phase 13). Plain data: no database and no React here.
import { routes } from "@/config/site";
import type { DownloadLogo, ItemRatio } from "@/types/block";

export const itemLimits = {
  files: 6, // media per item (Projects page)
  homeMedia: 2, // media of a Project card on Home
  showcasePhotos: 3, // documentation photos of a Showcase item
  homeShowcase: 5, // Showcase items on Home
  downloads: 3,
  links: 3,
  label: 40,
  credit: 120,
} as const;

export const ratioLabels: Record<ItemRatio, string> = {
  landscape: "Landscape 16:9",
  portrait: "Portrait 4:5",
};

// CSS aspect-ratio value of each ratio.
export const ratioAspect: Record<ItemRatio, string> = {
  landscape: "16 / 9",
  portrait: "4 / 5",
};

export const logoLabels: Record<DownloadLogo, string> = {
  github: "GitHub",
  nexus: "Nexus Mods",
  none: "No logo",
};

// The label of every download button.
export const downloadWord = "Download";

// Tabs of the Pages screen (/admin/pages?tab=...).
export const pagesTabs = ["home", "projects", "writing", "about", "footer"] as const;
export type PagesTab = (typeof pagesTabs)[number];

export const pagesTabLabels: Record<PagesTab, string> = {
  home: "Home",
  projects: "Projects",
  writing: "Writing",
  about: "About",
  footer: "Footer",
};

export function resolveTab(value: string | null | undefined): PagesTab {
  return (pagesTabs as readonly string[]).includes(value ?? "") ? (value as PagesTab) : "home";
}

export function tabHref(tab: PagesTab): string {
  return `${routes.pages}?tab=${tab}`;
}

// Width of the media column of a Project card (about 4/12). Change the numbers to tune it.
export const projectLayout = {
  grid: "md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]",
} as const;

// Width of the main media of a Showcase item (about 5/12). Change the numbers to tune it.
export const showcaseLayout = {
  grid: "md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
} as const;