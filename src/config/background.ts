import type { CSSProperties } from "react";

// Page background settings. Change labels and defaults here, not in components.
export const backgroundModes = ["color", "solid", "gradient", "full", "banner", "frame", "video"] as const;
export type BackgroundMode = (typeof backgroundModes)[number];

export const backgroundLabels: Record<BackgroundMode, string> = {
  color: "Theme color",
  solid: "Solid color",
  gradient: "Gradient",
  full: "Full page photo",
  banner: "Banner photo",
  frame: "Framed photo",
  video: "Video or GIF",
};

// Styles that need the background photo.
export const photoModes: readonly BackgroundMode[] = ["full", "banner", "frame"];

// Which end of the Full page photo or video melts into the theme color.
export const backgroundFades = ["bottom", "top"] as const;
export type BackgroundFade = (typeof backgroundFades)[number];

export const fadeLabels: Record<BackgroundFade, string> = {
  bottom: "Fade at the bottom",
  top: "Fade at the top",
};

// Gradient directions are CSS angles: 180 = top to bottom, 90 = left to right.
export const gradientDirections = [
  { value: 180, label: "Top to bottom" },
  { value: 0, label: "Bottom to top" },
  { value: 90, label: "Left to right" },
  { value: 270, label: "Right to left" },
  { value: 135, label: "Diagonal down" },
  { value: 45, label: "Diagonal up" },
] as const;

export const hexColor = /^#[0-9a-fA-F]{6}$/;
export const tintRange = { min: 0, max: 90, step: 5 } as const;
// How much of the page the Full page fade covers (percent), counted from the faded end.
export const fadeReachRange = { min: 20, max: 100, step: 5 } as const;

export const backgroundDefaults = {
  mode: "color" as BackgroundMode,
  fade: "bottom" as BackgroundFade,
  tint: 55,
  gray: true,
  color: "#1e1e1c",
  color2: "#d9541e",
  angle: 180,
  fadeCustom: false,
  fadeColor: "#1e1e1c",
  fadeReach: 100,
};

export type BackgroundView = {
  mode: BackgroundMode;
  fade: BackgroundFade;
  imageUrl: string | null;
  videoUrl: string | null;
  tint: number;
  gray: boolean;
  color: string;
  color2: string;
  angle: number;
  fadeColor: string | null;
  fadeReach: number;
};

export const plainBackground: BackgroundView = {
  mode: "color",
  fade: backgroundDefaults.fade,
  imageUrl: null,
  videoUrl: null,
  tint: backgroundDefaults.tint,
  gray: backgroundDefaults.gray,
  color: backgroundDefaults.color,
  color2: backgroundDefaults.color2,
  angle: backgroundDefaults.angle,
  fadeColor: null,
  fadeReach: backgroundDefaults.fadeReach,
};

// Safe reader: works even if the database columns are missing or empty.
export function readBackground(p: {
  bg_mode?: string | null;
  bg_fade?: string | null;
  bg_image_url?: string | null;
  bg_video_url?: string | null;
  bg_tint?: number | null;
  bg_gray?: boolean | null;
  bg_color?: string | null;
  bg_color2?: string | null;
  bg_angle?: number | null;
  bg_fade_color?: string | null;
  bg_fade_reach?: number | null;
}): BackgroundView {
  const mode = (backgroundModes as readonly string[]).includes(p.bg_mode ?? "")
    ? (p.bg_mode as BackgroundMode)
    : backgroundDefaults.mode;
  const fade = (backgroundFades as readonly string[]).includes(p.bg_fade ?? "")
    ? (p.bg_fade as BackgroundFade)
    : backgroundDefaults.fade;
  const pick = (value: string | null | undefined, fallback: string) =>
    value && hexColor.test(value) ? value.toLowerCase() : fallback;
  return {
    mode,
    fade,
    imageUrl: p.bg_image_url ?? null,
    videoUrl: p.bg_video_url ?? null,
    tint: p.bg_tint ?? backgroundDefaults.tint,
    gray: p.bg_gray ?? backgroundDefaults.gray,
    color: pick(p.bg_color, backgroundDefaults.color),
    color2: pick(p.bg_color2, backgroundDefaults.color2),
    fadeColor: p.bg_fade_color && hexColor.test(p.bg_fade_color) ? p.bg_fade_color.toLowerCase() : null,
    fadeReach:
      typeof p.bg_fade_reach === "number" &&
      p.bg_fade_reach >= fadeReachRange.min &&
      p.bg_fade_reach <= fadeReachRange.max
        ? p.bg_fade_reach
        : backgroundDefaults.fadeReach,
    angle:
      typeof p.bg_angle === "number" &&
      Number.isInteger(p.bg_angle) &&
      p.bg_angle >= 0 &&
      p.bg_angle <= 359
        ? p.bg_angle
        : backgroundDefaults.angle,
  };
}

export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const s = ((n >> shift) & 255) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
}

// Theme colors for a page that uses your own color(s): the text turns light on a dark
// background and dark on a light one, and cards and lines are derived from the color.
export function customPalette(colors: string[]): CSSProperties {
  const base = colors[0];
  const average = colors.reduce((sum, c) => sum + luminance(c), 0) / colors.length;
  const dark = average < 0.179;
  return {
    "--c-bg": base,
    "--c-ink": dark ? "#f3eee3" : "#111111",
    "--c-ink-soft": dark ? "#b9b2a2" : "#4f4a40",
    "--c-surface": `color-mix(in srgb, ${dark ? "white 9%" : "white 55%"}, ${base})`,
    "--c-line": `color-mix(in srgb, ${dark ? "white 18%" : "black 14%"}, ${base})`,
    "--c-highlight": `color-mix(in srgb, ${dark ? "white 16%" : "black 8%"}, ${base})`,
  } as CSSProperties;
}