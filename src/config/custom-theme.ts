import type { CSSProperties } from "react";
import { customPalette, hexColor, luminance } from "@/config/background";

// The "Custom" theme: your own background and accent color. Text, cards and lines are derived
// from the background (light text on a dark background, dark text on a light one).
export type CustomTheme = { bg: string; accent: string };

export const customThemeDefaults: CustomTheme = { bg: "#f3eee3", accent: "#d9541e" };

// Safe reader: works even if the database columns are missing or empty.
export function readCustomTheme(p: {
  theme_bg?: string | null;
  theme_accent?: string | null;
}): CustomTheme {
  const pick = (value: string | null | undefined, fallback: string) =>
    value && hexColor.test(value) ? value.toLowerCase() : fallback;
  return {
    bg: pick(p.theme_bg, customThemeDefaults.bg),
    accent: pick(p.theme_accent, customThemeDefaults.accent),
  };
}

export function customThemePalette(theme: CustomTheme): CSSProperties {
  return {
    ...customPalette([theme.bg]),
    "--c-accent": theme.accent,
    "--c-accent-ink": luminance(theme.accent) < 0.179 ? "#ffffff" : "#111111",
  } as CSSProperties;
}