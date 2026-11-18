import type { ThemeName } from "@/config/site";

// The share image (OG image) cannot read CSS variables, so the theme colors are copied here.
// KEEP IN SYNC with src/styles/themes/*.css.
export const ogPalette: Record<ThemeName, { bg: string; ink: string; soft: string; accent: string }> = {
  paper: { bg: "#ece4d3", ink: "#1c1a16", soft: "#5e574a", accent: "#f4d35e" },
  midnight: { bg: "#14120f", ink: "#f1e9d8", soft: "#a39a87", accent: "#e9c46a" },
  sage: { bg: "#dfe5d3", ink: "#1b231a", soft: "#51604d", accent: "#e9d66b" },
  cobalt: { bg: "#e4e8f2", ink: "#0f1630", soft: "#4a536e", accent: "#ffd84d" },
};
