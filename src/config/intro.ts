// Greeting of the Home intro. The part of the day follows the VISITOR's clock, automatically.
// The owner can only reword a greeting (Pages > Home > Intro). Empty = the built-in text below.

export const dayParts = ["morning", "afternoon", "evening", "night"] as const;
export type DayPart = (typeof dayParts)[number];

export const dayPartLabels: Record<DayPart, string> = {
  morning: "Morning (05:00 to 11:59)",
  afternoon: "Afternoon (12:00 to 17:59)",
  evening: "Evening (18:00 to 21:59)",
  night: "Night (22:00 to 04:59)",
};

export const defaultGreetings: Record<DayPart, string> = {
  morning: "Good morning!",
  afternoon: "Good afternoon!",
  evening: "Good evening!",
  night: "Hello, night owl!",
};

// How the Home intro drifts away while you scroll down (and comes back when you scroll up).
// All numbers live here. A line fades and slides left over its own range of the scroll (0 = top, 1 = fully scrolled).
export const introScroll = {
  // The intro is gone after scrolling this many screens.
  spanScreens: 0.8,
  // How far a line slides to the left when gone, in vw.
  distanceVw: 40,
  // Smoothing time in ms. Bigger = softer and slower to catch up with the wheel.
  smoothMs: 140,
  // Greeting, date, big sentence. Each starts and ends at a different point, so they go one after another.
  ranges: [
    [0, 0.5],
    [0.1, 0.6],
    [0.25, 0.9],
  ],
} as const;

export function dayPartFor(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

export function resolveGreetings(overrides: Record<DayPart, string | null>): Record<DayPart, string> {
  return {
    morning: overrides.morning ?? defaultGreetings.morning,
    afternoon: overrides.afternoon ?? defaultGreetings.afternoon,
    evening: overrides.evening ?? defaultGreetings.evening,
    night: overrides.night ?? defaultGreetings.night,
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Entrance of the top of Home (Customize > Hero > Entrance). One setting per item, so each item can move in its
// own way and start at its own moment. "Original" (anim "default") keeps the motion the website always had.
// Only what the owner changed is written to the page (heroMotionVars); the CSS keeps the original values as the
// fallback of every variable, so a page with no changes looks exactly as before. Nothing here needs the database
// to change: it all lives in profiles.site_style.heroMotion.
// ---------------------------------------------------------------------------------------------------------------

export const heroItemIds = ["hero", "brand", "tabs", "greeting", "date", "sentence", "caption", "contents"] as const;
export type HeroItemId = (typeof heroItemIds)[number];

export const heroAnims = ["default", "fade", "rise", "drop", "left", "right", "wipe", "none"] as const;
export type HeroAnim = (typeof heroAnims)[number];
// The hero and the news bar move as ONE block, so they only get a few choices.
export const heroBlockAnims = ["default", "fade", "none"] as const;

export const heroAnimLabels: Record<HeroAnim, string> = {
  default: "Original",
  fade: "Fade",
  rise: "Rise",
  drop: "Drop",
  left: "From the left",
  right: "From the right",
  wipe: "Wipe",
  none: "None",
};

export const heroItemLabels: Record<HeroItemId, string> = {
  hero: "Hero and news bar",
  brand: "Name (top left)",
  tabs: "Menu tabs",
  greeting: "Greeting",
  date: "Date",
  sentence: "Big sentence",
  caption: "Caption (bottom)",
  contents: "Contents list (right edge)",
};

export const heroItemHints: Record<HeroItemId, string> = {
  hero: "The hero and the news bar fall together as one block. Original = they fall from above the page. The other items can start while it falls.",
  brand: "Your name in the header. Start counts only on Home; elsewhere only the wait counts.",
  tabs: "The menu tabs. Each tab starts 80 ms after the one before it.",
  greeting: "The first line of the intro, for example Good morning.",
  date: "The second line of the intro, with today's date.",
  sentence: "The big sentence of the intro.",
  caption: "Your name and the short text at the bottom of the hero.",
  contents: "The thin line and list at the right edge. Original = it is just there, with no motion.",
};

export type HeroItemMotion = {
  anim: HeroAnim;
  // 0 to 100: the item starts when the hero has fallen this far (0 = it has just begun, 100 = it has landed).
  start: number;
  // Extra wait after that moment, in ms.
  wait: number;
  // How long the motion of this item takes, in ms.
  ms: number;
  // A little spring at the end (overshoot and settle).
  bounce: boolean;
};
export type HeroMotion = Record<HeroItemId, HeroItemMotion>;

export const heroMotionRanges = {
  start: { min: 0, max: 100, step: 1 },
  wait: { min: 0, max: 3000, step: 10 },
  ms: { min: 200, max: 3000, step: 50 },
} as const;

// The fall of the hero: CSS cubic-bezier(0.3, 0.7, 0.3, 1) over 1100 ms (styles/site.css, site-fall-in).
const curve = { x1: 0.3, y1: 0.7, x2: 0.3, y2: 1 };
const heroFallMs = 1100;

function bezier(t: number, a: number, b: number): number {
  const u = 1 - t;
  return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
}

// How far (0 to 1) the hero has fallen after this share (0 to 1) of the fall time.
export function fallProgress(timeShare: number): number {
  const x = Math.min(1, Math.max(0, timeShare));
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (bezier(mid, curve.x1, curve.x2) < x) lo = mid;
    else hi = mid;
  }
  return bezier((lo + hi) / 2, curve.y1, curve.y2);
}

// The share (0 to 1) of the fall time after which the hero has fallen this far (0 to 1).
export function fallTime(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (bezier(mid, curve.y1, curve.y2) < p) lo = mid;
    else hi = mid;
  }
  return bezier((lo + hi) / 2, curve.x1, curve.x2);
}

// The original timing of each item, as it is in styles/site.css: when it starts (lag, then wait) and how long it takes.
// lag is the time the item waits for the hero (the CSS variable --lag, 700 ms on Home, and the fixed starts of the intro).
const original: Record<HeroItemId, { lag: number; wait: number; ms: number }> = {
  hero: { lag: 0, wait: 0, ms: heroFallMs },
  brand: { lag: 700, wait: 450, ms: 900 },
  tabs: { lag: 700, wait: 350, ms: 800 },
  greeting: { lag: 900, wait: 0, ms: 1200 },
  date: { lag: 1080, wait: 0, ms: 1200 },
  sentence: { lag: 1280, wait: 0, ms: 1200 },
  caption: { lag: 400, wait: 0, ms: 1200 },
  contents: { lag: 0, wait: 0, ms: 800 },
};

// The original timing written as the two sliders: a start point on the fall (percent) and a wait after it.
function originalItem(id: HeroItemId): HeroItemMotion {
  const o = original[id];
  const late = Math.max(0, o.lag - heroFallMs);
  const start = Math.round(fallProgress(Math.min(o.lag, heroFallMs) / heroFallMs) * 100);
  return { anim: "default", start, wait: o.wait + late, ms: o.ms, bounce: false };
}

export const heroMotionDefaults = Object.fromEntries(heroItemIds.map((id) => [id, originalItem(id)])) as HeroMotion;

function whole(v: unknown, range: { min: number; max: number; step: number }, fallback: number): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return fallback;
  const n = Math.min(range.max, Math.max(range.min, v));
  return Math.round(n / range.step) * range.step;
}

// Reads the saved settings. Never throws; anything wrong or missing becomes the original.
export function readHeroMotion(raw: unknown): HeroMotion {
  const all = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out = {} as HeroMotion;
  for (const id of heroItemIds) {
    const d = heroMotionDefaults[id];
    const r = typeof all[id] === "object" && all[id] !== null ? (all[id] as Record<string, unknown>) : {};
    const allowed: readonly string[] = id === "hero" ? heroBlockAnims : heroAnims;
    out[id] = {
      anim: allowed.includes(r.anim as string) ? (r.anim as HeroAnim) : d.anim,
      start: whole(r.start, heroMotionRanges.start, d.start),
      wait: whole(r.wait, heroMotionRanges.wait, d.wait),
      ms: whole(r.ms, heroMotionRanges.ms, d.ms),
      bounce: id !== "hero" && typeof r.bounce === "boolean" ? r.bounce : d.bounce,
    };
  }
  return out;
}

const keyframes: Record<Exclude<HeroAnim, "default">, string> = {
  fade: "site-m-fade",
  rise: "site-m-rise",
  drop: "site-m-drop",
  left: "site-m-left",
  right: "site-m-right",
  wipe: "site-m-wipe",
  none: "none",
};

// The CSS variables of what the owner changed. Empty when nothing changed. styles/site.css reads them.
export function heroMotionVars(m: HeroMotion): Record<string, string> {
  const out: Record<string, string> = {};
  const hero = m.hero;
  const dHero = heroMotionDefaults.hero;
  // The time the hero takes to land (the other items count their start from it). Without motion it lands at once.
  const landMs = hero.anim === "none" ? 0 : hero.ms;
  const landChanged = hero.anim === "none" || hero.ms !== dHero.ms;
  if (hero.anim !== "default") out["--m-hero-name"] = keyframes[hero.anim];
  if (hero.ms !== dHero.ms) out["--m-hero-dur"] = `${hero.ms}ms`;

  let last = landMs;
  for (const id of heroItemIds) {
    if (id === "hero") continue;
    const it = m[id];
    const d = heroMotionDefaults[id];
    const o = original[id];
    if (it.anim !== "default") out[`--m-${id}-name`] = keyframes[it.anim];
    if (it.ms !== d.ms) out[`--m-${id}-dur`] = `${it.ms}ms`;
    if (it.bounce) out[`--m-${id}-ease`] = "var(--site-spring)";
    const timed = landChanged || it.start !== d.start || it.wait !== d.wait;
    let begin = o.lag + o.wait;
    if (timed) {
      const lag = Math.round(fallTime(it.start / 100) * landMs);
      out[`--m-${id}-start`] = `${lag}ms`;
      out[`--m-${id}-wait`] = `${it.wait}ms`;
      begin = lag + it.wait;
    }
    // Each menu tab starts 80 ms after the one before it (counted for 6 tabs).
    last = Math.max(last, begin + it.ms + (id === "tabs" ? 80 * 6 : 0));
  }
  // The page marks the entrance as over after this many ms (SiteHeader). Never earlier than the original 3000.
  const entrance = last + 400;
  if (entrance > 3000) out["--m-entrance"] = String(Math.round(entrance));
  return out;
}