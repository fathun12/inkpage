// card.ts: the ONE source for the card style (types, ranges, defaults, presets).
// The Customize studio (sliders), the server (Zod) and readCard() all read this file.

import type { MediaFit, MediaHeight, MediaPlacement, MediaPosition } from "@/types/block";

export type Range = { min: number; max: number; step: number };

export const cardKinds = ["solid", "glass"] as const;
export type CardKind = (typeof cardKinds)[number];
export const cardKindLabels: Record<CardKind, string> = { solid: "Solid", glass: "Glass" };

// Presets you can click. "custom" is set automatically when a glass slider is moved.
export const cardPresets = ["clear", "regular", "tinted", "frosted"] as const;
export type GlassPreset = (typeof cardPresets)[number];
export const cardPresetIds = [...cardPresets, "custom"] as const;
export type CardPreset = (typeof cardPresetIds)[number];
export const cardPresetLabels: Record<GlassPreset, string> = {
  clear: "Clear",
  regular: "Regular",
  tinted: "Tinted",
  frosted: "Frosted",
};

export const textModes = ["auto", "light", "dark"] as const;
export type TextMode = (typeof textModes)[number];
export const textModeLabels: Record<TextMode, string> = {
  auto: "Auto (theme)",
  light: "Light",
  dark: "Dark",
};
export const cardTextColors = { light: "#f6f3ec", dark: "#111111" } as const;

export const cardRanges = {
  radius: { min: 0, max: 40, step: 1 },
  opacity: { min: 0, max: 100, step: 1 },
  strokeWidth: { min: 0, max: 4, step: 0.5 },
  frost: { min: 0, max: 40, step: 1 },
  vibrancy: { min: 100, max: 200, step: 5 },
  // refraction, depth, dispersion, splay, specular and light intensity
  effect: { min: 0, max: 100, step: 1 },
  angle: { min: 0, max: 359, step: 1 },
  shadowOffset: { min: -40, max: 40, step: 1 },
  shadowBlur: { min: 0, max: 80, step: 1 },
  shadowSpread: { min: -20, max: 40, step: 1 },
  maxInner: 2,
  maxDrop: 2,
} as const;

export type Shadow = {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
};

export type GlassSettings = {
  frost: number;
  vibrancy: number;
  refraction: number;
  depth: number;
  dispersion: number;
  splay: number;
  specular: number;
  light: { angle: number; intensity: number };
};

export type CardStyle = {
  v: 1;
  kind: CardKind;
  preset: CardPreset;
  radius: number;
  fill: { color: string | null; opacity: number };
  stroke: { color: string | null; opacity: number; width: number };
  text: TextMode;
  glass: GlassSettings;
  inner: Shadow[];
  drop: Shadow[];
};

// color: null = follow the theme. An empty card (profiles.card = {}) becomes exactly this,
// and this looks the same as the cards before Phase 10c.
export const cardDefaults: CardStyle = {
  v: 1,
  kind: "solid",
  preset: "regular",
  radius: 12,
  fill: { color: null, opacity: 100 },
  stroke: { color: null, opacity: 100, width: 1 },
  text: "auto",
  glass: {
    frost: 14,
    vibrancy: 150,
    refraction: 30,
    depth: 35,
    dispersion: 10,
    splay: 30,
    specular: 60,
    light: { angle: 135, intensity: 70 },
  },
  inner: [],
  drop: [],
};

export const glassFillColor = "#ffffff";
export const glassFillOpacity = 14;

// Starting colors when you switch off "match the theme".
export const colorStarts = { fill: "#ffffff", stroke: "#ffffff" } as const;

// Width (px) of the thin bright edge (specular highlight) of glass.
export const ringWidth = 1.5;

// Starting values for a new shadow layer.
export const newDrop: Shadow = { x: 0, y: 8, blur: 24, spread: 0, color: "#000000", opacity: 18 };
export const newInner: Shadow = { x: 0, y: 1, blur: 0, spread: 0, color: "#ffffff", opacity: 40 };

type GlassPresetValues = {
  frost: number;
  fillOpacity: number;
  vibrancy: number;
  refraction: number;
  depth: number;
  dispersion: number;
  splay: number;
  specular: number;
};

// First guesses: tune them in the browser, not from theory.
export const glassPresets: Record<GlassPreset, GlassPresetValues> = {
  clear: { frost: 6, fillOpacity: 6, vibrancy: 150, refraction: 50, depth: 40, dispersion: 20, splay: 30, specular: 70 },
  regular: { frost: 14, fillOpacity: 14, vibrancy: 160, refraction: 30, depth: 35, dispersion: 10, splay: 30, specular: 60 },
  tinted: { frost: 12, fillOpacity: 32, vibrancy: 150, refraction: 25, depth: 30, dispersion: 5, splay: 30, specular: 50 },
  frosted: { frost: 28, fillOpacity: 45, vibrancy: 120, refraction: 0, depth: 0, dispersion: 0, splay: 0, specular: 25 },
};

// How the slider numbers become the SVG lens (lib/card-style.ts). Tune here.
export const lensTuning = {
  scalePerPoint: 0.5, // refraction 100 = 50 px of displacement
  maxSpread: 0.5, // dispersion 100 = red and blue differ 50% from green
  blurPerPoint: 0.05, // splay 100 = blur of 5 on the lens map
  edgeX: 0.08, // depth 100 = left and right bevel is 8% of the card width
  edgeY: 0.3, // depth 100 = top and bottom bevel is 30% of the card height
} as const;

// Image or GIF inside a card (Phase 10d). The ids are in types/block.ts.
export const mediaDefaults = {
  opacity: 100,
  fit: "cover" as MediaFit,
  position: "center" as MediaPosition,
  placement: "behind" as MediaPlacement,
  height: "md" as MediaHeight,
};

// Height (px) of the strip when the media is below the text.
export const mediaHeightPx: Record<MediaHeight, number> = { sm: 80, md: 120, lg: 180 };

export const mediaLabels: {
  fit: Record<MediaFit, string>;
  position: Record<MediaPosition, string>;
  placement: Record<MediaPlacement, string>;
  height: Record<MediaHeight, string>;
} = {
  fit: { cover: "Fill (may cut the edges)", contain: "Fit (show everything)" },
  position: { center: "Center", top: "Top", bottom: "Bottom" },
  placement: { behind: "Behind the text", below: "Below the text" },
  height: { sm: "Small", md: "Medium", lg: "Large" },
};