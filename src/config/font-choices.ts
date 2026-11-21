import type { CSSProperties } from "react";

// The font choices of the Customize studio. This file is plain data (it loads no fonts),
// so components may import it. The fonts themselves are loaded in config/fonts.ts:
// when you add a font here, load it there too.
export const fontIds = [
  "instrument-sans",
  "schibsted-grotesk",
  "bricolage-grotesque",
  "syne",
  "instrument-serif",
  "fraunces",
  "dm-serif-display",
  "newsreader",
  "dm-mono",
  "space-mono",
] as const;
export type FontId = (typeof fontIds)[number];

export const fontGroups = [
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Mono" },
] as const;
export type FontGroup = (typeof fontGroups)[number]["id"];

// cssVar is the CSS variable that config/fonts.ts creates for the font.
export const fontChoices: Record<FontId, { label: string; group: FontGroup; cssVar: string }> = {
  "instrument-sans": { label: "Instrument Sans", group: "sans", cssVar: "--nf-f-instrument-sans" },
  "schibsted-grotesk": { label: "Schibsted Grotesk", group: "sans", cssVar: "--nf-f-schibsted-grotesk" },
  "bricolage-grotesque": { label: "Bricolage Grotesque", group: "sans", cssVar: "--nf-f-bricolage-grotesque" },
  syne: { label: "Syne", group: "sans", cssVar: "--nf-f-syne" },
  "instrument-serif": { label: "Instrument Serif", group: "serif", cssVar: "--nf-voice" },
  fraunces: { label: "Fraunces", group: "serif", cssVar: "--nf-f-fraunces" },
  "dm-serif-display": { label: "DM Serif Display", group: "serif", cssVar: "--nf-f-dm-serif-display" },
  newsreader: { label: "Newsreader", group: "serif", cssVar: "--nf-f-newsreader" },
  "dm-mono": { label: "DM Mono", group: "mono", cssVar: "--nf-mono" },
  "space-mono": { label: "Space Mono", group: "mono", cssVar: "--nf-f-space-mono" },
};

export const defaultFont: FontId = "instrument-sans";

export type FontPair = { heading: FontId; body: FontId };
export const defaultFonts: FontPair = { heading: defaultFont, body: defaultFont };

// Safe readers: an unknown, empty or missing value falls back to the default font.
export function resolveFont(id: string | null | undefined): FontId {
  return (fontIds as readonly string[]).includes(id ?? "") ? (id as FontId) : defaultFont;
}

export function readFonts(p: { font_heading?: string | null; font_body?: string | null }): FontPair {
  return { heading: resolveFont(p.font_heading), body: resolveFont(p.font_body) };
}

// Set on the public page wrapper. We override --nf-display and --nf-body (not --font-*),
// because Tailwind bakes the --font-* values into its utilities.
export function fontStyle(fonts: FontPair): CSSProperties {
  return {
    "--nf-display": `var(${fontChoices[fonts.heading].cssVar})`,
    "--nf-body": `var(${fontChoices[fonts.body].cssVar})`,
  } as CSSProperties;
}