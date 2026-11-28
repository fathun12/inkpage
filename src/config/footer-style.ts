// Layout of the footer (Customize studio, page "Bars & footer"). Plain data. Stored inside profiles.site_style.
import { readChoice } from "@/config/layout";
import {
  topBarItems,
  topBarMotions,
  topBarRanges,
  type TopBarItem,
  type TopBarMotion,
} from "@/config/topbar-style";

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

// The thin black band at the very bottom (copyright, news, color mode, back to top).
// Width: like the footer above (the original), or its own Centered or Full width.
export const footerBandModes = ["follow", "centered", "full"] as const;
export type FooterBandMode = (typeof footerBandModes)[number];

export const footerBandModeLabels: Record<FooterBandMode, string> = {
  follow: "Like the footer",
  centered: "Centered",
  full: "Full width",
};

export const footerBandModeHints: Record<FooterBandMode, string> = {
  follow: "The same width as the footer above (the original).",
  centered: "Inside the page margins.",
  full: "Edge to edge.",
};

export const footerBandSizes = ["small", "normal", "large", "huge"] as const;
export type FooterBandSize = (typeof footerBandSizes)[number];

export const footerBandSizeLabels: Record<FooterBandSize, string> = {
  small: "Small",
  normal: "Normal",
  large: "Large",
  huge: "Huge",
};

// Extra space above and below the text, in rem. 0 = the original. Minus makes the band thinner.
export const footerBandSpace = { min: -0.5, max: 3, step: 0.25 } as const;

// The parts (clock, countdown, news) change one after another in the same place, in the order of the list.
export type FooterBand = {
  mode: FooterBandMode;
  size: FooterBandSize;
  space: number;
  order: TopBarItem[];
  show: Record<TopBarItem, boolean>;
  motion: TopBarMotion;
  ms: number;
  seconds: number;
};

// The original order in the band: clock, countdown, then the news.
const bandOrder: TopBarItem[] = ["clock", "countdown", "news"];

export const footerBandDefaults: FooterBand = {
  mode: "follow",
  size: "normal",
  space: 0,
  order: [...bandOrder],
  show: { clock: true, news: true, countdown: true },
  motion: "slide",
  ms: 700,
  seconds: 0,
};

export type FooterStyle = {
  mode: FooterMode;
  order: FooterBlock[];
  align: Record<FooterBlock, FooterAlign>;
  slot: Record<FooterBlock, FooterSlot>;
  shift: Record<FooterBlock, number>;
  brandAlign: FooterAlign;
  brandSpot: FooterBrandSpot;
  band: FooterBand;
};

export const footerDefaults: FooterStyle = {
  mode: "centered",
  order: [...footerBlocks],
  align: { note: "left", explore: "left", connect: "left" },
  slot: { note: "left", explore: "middle", connect: "right" },
  shift: { note: 0, explore: 0, connect: 0 },
  brandAlign: "left",
  brandSpot: "below",
  band: footerBandDefaults,
};

function shiftValue(v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return 0;
  const n = Math.min(footerShift.max, Math.max(footerShift.min, v));
  return Math.round(n / footerShift.step) * footerShift.step;
}

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function clamp(v: unknown, r: { min: number; max: number; step: number }, fallback: number): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return fallback;
  return Math.round(Math.min(r.max, Math.max(r.min, v)) / r.step) * r.step;
}

// Safe reader of the bottom band: dirty data gives the default.
function readBand(raw: unknown): FooterBand {
  const r = obj(raw);
  const s = obj(r.show);
  const d = footerBandDefaults;
  const seen = new Set<TopBarItem>();
  for (const v of Array.isArray(r.order) ? r.order : []) {
    if ((topBarItems as readonly string[]).includes(v as string)) seen.add(v as TopBarItem);
  }
  for (const i of bandOrder) seen.add(i);
  return {
    mode: readChoice(r.mode, footerBandModes, d.mode),
    size: readChoice(r.size, footerBandSizes, d.size),
    space: clamp(r.space, footerBandSpace, d.space),
    order: [...seen],
    show: {
      clock: typeof s.clock === "boolean" ? s.clock : d.show.clock,
      news: typeof s.news === "boolean" ? s.news : d.show.news,
      countdown: typeof s.countdown === "boolean" ? s.countdown : d.show.countdown,
    },
    motion: readChoice(r.motion, topBarMotions, d.motion),
    ms: clamp(r.ms, topBarRanges.ms, d.ms),
    seconds: clamp(r.seconds, topBarRanges.seconds, d.seconds),
  };
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
    band: readBand(r.band),
  };
}