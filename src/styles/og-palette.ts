import type { ThemeName } from "@/config/site";

// The share image (OG image) cannot read CSS variables, so the theme colors are copied here.
// KEEP IN SYNC with src/styles/themes/*.css.
export const ogPalette: Record<ThemeName, { bg: string; ink: string; soft: string; accent: string }> = {
  cream: { bg: "#f3eee3", ink: "#111111", soft: "#5c574d", accent: "#d9541e" },
  charcoal: { bg: "#1e1e1c", ink: "#d8cbb3", soft: "#a39b89", accent: "#d9541e" },
  sand: { bg: "#d8cbb3", ink: "#1e1e1c", soft: "#5e5645", accent: "#d9541e" },
  ember: { bg: "#d9541e", ink: "#111111", soft: "#3b1e10", accent: "#f3eee3" },
};