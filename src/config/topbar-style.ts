// Settings of the thin bar at the very top (news, clock, countdown). Plain data. Stored in profiles.site_style.
import { readChoice } from "@/config/layout";

export const topBarModes = ["centered", "full"] as const;
export type TopBarMode = (typeof topBarModes)[number];

export const topBarModeLabels: Record<TopBarMode, string> = { centered: "Centered", full: "Full width" };

export const topBarModeHints: Record<TopBarMode, string> = {
  centered: "Inside the page margins (the original).",
  full: "Edge to edge: the bar uses the whole width of the screen.",
};

export const topBarItems = ["clock", "news", "countdown"] as const;
export type TopBarItem = (typeof topBarItems)[number];

export const topBarItemLabels: Record<TopBarItem, string> = {
  clock: "Clock",
  news: "News",
  countdown: "Countdown",
};

export const topBarMotions = ["slide", "fade", "rise"] as const;
export type TopBarMotion = (typeof topBarMotions)[number];

export const topBarMotionLabels: Record<TopBarMotion, string> = {
  slide: "Slide",
  fade: "Fade",
  rise: "Up and down",
};

export const topBarMotionHints: Record<TopBarMotion, string> = {
  slide: "The lines slide sideways (the original).",
  fade: "One line fades into the next.",
  rise: "The lines move up, one after another.",
};

// ms = how long one change takes. seconds = how long a line stays (0 = the same as the Hero time).
export const topBarRanges = {
  ms: { min: 200, max: 1500, step: 100 },
  seconds: { min: 0, max: 15, step: 1 },
} as const;

export type TopBarStyle = {
  mode: TopBarMode;
  order: TopBarItem[];
  show: Record<TopBarItem, boolean>;
  motion: TopBarMotion;
  ms: number;
  seconds: number;
};

export const topBarDefaults: TopBarStyle = {
  mode: "centered",
  order: [...topBarItems],
  show: { clock: true, news: true, countdown: true },
  motion: "slide",
  ms: 700,
  seconds: 0,
};

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function num(v: unknown, r: { min: number; max: number; step: number }, fallback: number): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return fallback;
  return Math.round(Math.min(r.max, Math.max(r.min, v)) / r.step) * r.step;
}

// Safe reader: dirty data gives the default. Unknown names and repeats in the order are dropped,
// and a missing item is added at the end.
export function readTopBar(raw: unknown): TopBarStyle {
  const r = obj(raw);
  const s = obj(r.show);
  const seen = new Set<TopBarItem>();
  for (const v of Array.isArray(r.order) ? r.order : []) {
    if ((topBarItems as readonly string[]).includes(v as string)) seen.add(v as TopBarItem);
  }
  for (const i of topBarItems) seen.add(i);
  const d = topBarDefaults;
  return {
    mode: readChoice(r.mode, topBarModes, d.mode),
    order: [...seen],
    show: {
      clock: typeof s.clock === "boolean" ? s.clock : d.show.clock,
      news: typeof s.news === "boolean" ? s.news : d.show.news,
      countdown: typeof s.countdown === "boolean" ? s.countdown : d.show.countdown,
    },
    motion: readChoice(r.motion, topBarMotions, d.motion),
    ms: num(r.ms, topBarRanges.ms, d.ms),
    seconds: num(r.seconds, topBarRanges.seconds, d.seconds),
  };
}