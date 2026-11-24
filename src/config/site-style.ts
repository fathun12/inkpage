// Look and motion settings of the public website (Customize studio). Plain data.
// Stored in profiles.site_style. readSiteStyle reads them and never throws.

import type { CSSProperties } from "react";
import { hexColor, luminance } from "@/config/background";

export const motionModes = ["full", "subtle", "off"] as const;
export type MotionMode = (typeof motionModes)[number];

export const motionLabels: Record<MotionMode, string> = {
  full: "Full",
  subtle: "Subtle",
  off: "Off",
};

export const motionHints: Record<MotionMode, string> = {
  full: "Rows rise, lines draw, photos open, the hero drifts.",
  subtle: "Only soft fades. No drifting and no opening photos.",
  off: "Nothing moves. Slides and the gallery stay on the first item.",
};

type Range = { min: number; max: number; step: number };

export const styleRanges = {
  heroOverlay: { min: 0, max: 80, step: 5 },
  indexVeil: { min: 0, max: 90, step: 5 },
  seconds: { min: 3, max: 15, step: 1 },
} as const satisfies Record<string, Range>;

export type SiteStyle = {
  motion: MotionMode;
  heroSeconds: number;
  gallerySeconds: number;
  heroOverlay: number;
  indexVeil: number;
  heroGray: boolean;
  colorBg: string;
  colorInk: string;
  colorAccent: string;
};

// The three colors of the website: pure white page, pure black text, one accent.
export const siteStyleDefaults: SiteStyle = {
  motion: "full",
  heroSeconds: 7,
  gallerySeconds: 6,
  heroOverlay: 25,
  indexVeil: 62,
  heroGray: false,
  colorBg: "#ffffff",
  colorInk: "#000000",
  colorAccent: "#b5532f",
};

function num(v: unknown, range: Range, fallback: number): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return fallback;
  const n = Math.min(range.max, Math.max(range.min, v));
  return Math.round(n / range.step) * range.step;
}

function color(v: unknown, fallback: string): string {
  return typeof v === "string" && hexColor.test(v) ? v.toLowerCase() : fallback;
}

export function readSiteStyle(raw: unknown): SiteStyle {
  const r = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const d = siteStyleDefaults;
  return {
    motion: (motionModes as readonly string[]).includes(r.motion as string) ? (r.motion as MotionMode) : d.motion,
    heroSeconds: num(r.heroSeconds, styleRanges.seconds, d.heroSeconds),
    gallerySeconds: num(r.gallerySeconds, styleRanges.seconds, d.gallerySeconds),
    heroOverlay: num(r.heroOverlay, styleRanges.heroOverlay, d.heroOverlay),
    indexVeil: num(r.indexVeil, styleRanges.indexVeil, d.indexVeil),
    heroGray: typeof r.heroGray === "boolean" ? r.heroGray : d.heroGray,
    colorBg: color(r.colorBg, d.colorBg),
    colorInk: color(r.colorInk, d.colorInk),
    colorAccent: color(r.colorAccent, d.colorAccent),
  };
}

// The theme variables of the website, made from its three colors. Soft text, lines and highlights are
// mixes of the text color and the page color. Nothing is warm or tinted unless you pick it.
export function sitePalette(style: Pick<SiteStyle, "colorBg" | "colorInk" | "colorAccent">): CSSProperties {
  const { colorBg: bg, colorInk: ink, colorAccent: accent } = style;
  return {
    "--c-bg": bg,
    "--c-surface": bg,
    "--c-ink": ink,
    "--c-ink-soft": `color-mix(in srgb, ${ink} 62%, ${bg})`,
    "--c-line": `color-mix(in srgb, ${ink} 18%, ${bg})`,
    "--c-highlight": `color-mix(in srgb, ${ink} 8%, ${bg})`,
    "--c-accent": accent,
    "--c-accent-ink": luminance(accent) < 0.179 ? "#ffffff" : "#000000",
  } as CSSProperties;
}