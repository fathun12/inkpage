// Layout of the footer (Customize studio, page "Bars & footer"). Plain data. Stored inside profiles.site_style.
import { readChoice } from "@/config/layout";

export const footerModes = ["centered", "full"] as const;
export type FooterMode = (typeof footerModes)[number];

export const footerModeLabels: Record<FooterMode, string> = { centered: "Centered", full: "Full width" };

export const footerModeHints: Record<FooterMode, string> = {
  centered: "Inside the page margins (the original).",
  full: "Edge to edge: the columns and the bottom band use the whole width of the screen.",
};

export const footerBlocks = ["note", "explore", "connect"] as const;
export type FooterBlock = (typeof footerBlocks)[number];

export const footerBlockLabels: Record<FooterBlock, string> = {
  note: "Note",
  explore: "Explore",
  connect: "Connect",
};

export const footerAligns = ["left", "center", "right"] as const;
export type FooterAlign = (typeof footerAligns)[number];

export const footerAlignLabels: Record<FooterAlign, string> = { left: "Left", center: "Center", right: "Right" };

// Where the big name (the username) sits: under the columns (the original, cut off by the band) or above them.
export const footerBrandSpots = ["below", "above"] as const;
export type FooterBrandSpot = (typeof footerBrandSpots)[number];

export const footerBrandSpotLabels: Record<FooterBrandSpot, string> = { below: "Below", above: "Above" };

export const footerBrandSpotHints: Record<FooterBrandSpot, string> = {
  below: "Under the columns, cut off by the band at the bottom (the original).",
  above: "Above the columns, whole.",
};

export type FooterStyle = {
  mode: FooterMode;
  order: FooterBlock[];
  align: Record<FooterBlock, FooterAlign>;
  brandAlign: FooterAlign;
  brandSpot: FooterBrandSpot;
};

export const footerDefaults: FooterStyle = {
  mode: "centered",
  order: [...footerBlocks],
  align: { note: "left", explore: "left", connect: "left" },
  brandAlign: "left",
  brandSpot: "below",
};

// Safe reader: missing or dirty data gives the default. Unknown names and repeats in the order are dropped,
// and a missing block is added at the end.
export function readFooter(raw: unknown): FooterStyle {
  const r = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const a = typeof r.align === "object" && r.align !== null && !Array.isArray(r.align) ? (r.align as Record<string, unknown>) : {};
  const seen = new Set<FooterBlock>();
  for (const v of Array.isArray(r.order) ? r.order : []) {
    if ((footerBlocks as readonly string[]).includes(v as string)) seen.add(v as FooterBlock);
  }
  for (const b of footerBlocks) seen.add(b);
  const d = footerDefaults;
  return {
    mode: readChoice(r.mode, footerModes, d.mode),
    order: [...seen],
    align: {
      note: readChoice(a.note, footerAligns, d.align.note),
      explore: readChoice(a.explore, footerAligns, d.align.explore),
      connect: readChoice(a.connect, footerAligns, d.align.connect),
    },
    brandAlign: readChoice(r.brandAlign, footerAligns, d.brandAlign),
    brandSpot: readChoice(r.brandSpot, footerBrandSpots, d.brandSpot),
  };
}