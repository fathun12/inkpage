import { luminance } from "@/config/background";
import type { CustomTheme } from "@/config/custom-theme";
import type { ThemeName } from "@/config/site";

type OgColors = { bg: string; ink: string; soft: string; accent: string };

// The share image (OG image) cannot read CSS variables, so the theme colors are copied here.
// KEEP IN SYNC with src/styles/themes/*.css.
export const ogPalette: Record<Exclude<ThemeName, "custom">, OgColors> = {
  cream: { bg: "#f3eee3", ink: "#111111", soft: "#5c574d", accent: "#d9541e" },
  charcoal: { bg: "#1e1e1c", ink: "#d8cbb3", soft: "#a39b89", accent: "#d9541e" },
  sand: { bg: "#d8cbb3", ink: "#1e1e1c", soft: "#5e5645", accent: "#d9541e" },
  ember: { bg: "#d9541e", ink: "#111111", soft: "#3b1e10", accent: "#f3eee3" },
};

// Colors of the share image. The "Custom" theme uses your own colors, and the text turns light
// or dark by itself (same rule as the page, see customPalette in config/background.ts).
export function ogColors(theme: ThemeName, custom: CustomTheme): OgColors {
  if (theme !== "custom") return ogPalette[theme];
  const dark = luminance(custom.bg) < 0.179;
  return {
    bg: custom.bg,
    ink: dark ? "#f3eee3" : "#111111",
    soft: dark ? "#b9b2a2" : "#4f4a40",
    accent: custom.accent,
  };
}