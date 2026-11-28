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

// The three places a column can take. Columns in the same place are stacked, in the order of the list.
export const footerSlots = ["left", "middle", "right"] as const;
export type FooterSlot = (typeof footerSlots)[number];

export const footerSlotLabels: Record<FooterSlot, string> = { left: "Left", middle: "Middle", right: "Right" };

// Move a column down (plus) or up (minus), in rem. 0 = the original place.
export const footerShift = { min: -4, max: 16, step: 1 } as const;

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
  slot: Record<FooterBlock, FooterSlot>;
  shift: Record<FooterBlock, number>;
  brandAlign: FooterAlign;
  brandSpot: FooterBrandSpot;
};

export const footerDefaults: FooterStyle = {
  mode: "centered",
  order: [...footerBlocks],
  align: { note: "left", explore: "left", connect: "left" },
  slot: { note: "left", explore: "middle", connect: "right" },
  shift: { note: 0, explore: 0, connect: 0 },
  brandAlign: "left",
  brandSpot: "below",
};

function shiftValue(v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return 0;
  const n = Math.min(footerShift.max, Math.max(footerShift.min, v));
  return Math.round(n / footerShift.step) * footerShift.step;
}

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

// Safe reader: missing or dirty data gives the default. Unknown names and repeats in the order are dropped,
// and a missing block is added at the end.
export function readFooter(raw: unknown): FooterStyle {
  const r = obj(raw);
  const a = obj(r.align);
  const s = obj(r.slot);
  const h = obj(r.shift);
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
    slot: {
      note: readChoice(s.note, footerSlots, d.slot.note),
      explore: readChoice(s.explore, footerSlots, d.slot.explore),
      connect: readChoice(s.connect, footerSlots, d.slot.connect),
    },
    shift: { note: shiftValue(h.note), explore: shiftValue(h.explore), connect: shiftValue(h.connect) },
    brandAlign: readChoice(r.brandAlign, footerAligns, d.brandAlign),
    brandSpot: readChoice(r.brandSpot, footerBrandSpots, d.brandSpot),
  };
}