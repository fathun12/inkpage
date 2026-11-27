// Look and motion settings of the public website (Customize studio). Plain data.
// Stored in profiles.site_style. readSiteStyle reads them and never throws.

import type { CSSProperties } from "react";
import { hexColor, luminance } from "@/config/background";
import { heroMotionDefaults, readHeroMotion, type HeroMotion } from "@/config/intro";
import {
  countdownViews,
  densityModes,
  designIntroSizes,
  designModes,
  designSizes,
  designTextFonts,
  designTitleAligns,
  designTitleSizes,
  designViews,
  designWideViews,
  showcaseSizes,
  showcaseViews,
  showcaseWideViews,
  stackRatios,
  layoutDefaults,
  projectSizes,
  projectViews,
  readChoice,
  readOrder,
  readSections,
  sectionDefaults,
  sectionIds,
  type CountdownView,
  type DensityMode,
  type DesignFont,
  type DesignIntroSize,
  type DesignMode,
  type DesignSize,
  type DesignTitleAlign,
  type DesignTitleSize,
  type DesignView,
  type DesignWideView,
  type ShowcaseSize,
  type ShowcaseView,
  type ShowcaseWideView,
  type StackRatio,
  type ProjectSize,
  type ProjectView,
  type SectionId,
  type SectionSettings,
} from "@/config/layout";
import {
  aboutDefaults,
  aboutLayouts,
  aboutPhotoShapes,
  aboutSectionDefaults,
  aboutSectionIds,
  readAboutOrder,
  readAboutSections,
  steamLayouts,
  type AboutLayout,
  type AboutPhotoShape,
  type AboutSectionId,
  type AboutSections,
  type SteamLayout,
} from "@/config/about-style";

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
  heroZoom: { min: 100, max: 250, step: 5 },
  indexZoom: { min: 100, max: 250, step: 5 },
  seconds: { min: 3, max: 15, step: 1 },
  projectMedia: { min: 0, max: 40, step: 2 },
  designMedia: { min: 0, max: 60, step: 2 },
  designCount: { min: 3, max: 6, step: 1 },
  showcaseMedia: { min: 0, max: 60, step: 2 },
  stackCrop: { min: 0, max: 100, step: 5 },
} as const satisfies Record<string, Range>;

export type SiteStyle = {
  motion: MotionMode;
  heroSeconds: number;
  gallerySeconds: number;
  heroOverlay: number;
  heroZoom: number;
  indexZoom: number;
  indexVeil: number;
  heroGray: boolean;
  heroMotion: HeroMotion;
  density: DensityMode;
  projectSize: ProjectSize;
  projectView: ProjectView;
  projectMedia: number;
  countdownView: CountdownView;
  designSize: DesignSize;
  designView: DesignView;
  designMode: DesignMode;
  designWideView: DesignWideView;
  designMedia: number;
  designCount: number;
  designTitleAlign: DesignTitleAlign;
  designTitleFont: DesignFont;
  designTitleSize: DesignTitleSize;
  designIntroFont: DesignFont;
  designIntroSize: DesignIntroSize;
  showcaseSize: ShowcaseSize;
  showcaseView: ShowcaseView;
  showcaseMode: DesignMode;
  showcaseWideView: ShowcaseWideView;
  showcaseMedia: number;
  showcaseTitleAlign: DesignTitleAlign;
  showcaseTitleFont: DesignFont;
  showcaseTitleSize: DesignTitleSize;
  showcaseIntroFont: DesignFont;
  showcaseIntroSize: DesignIntroSize;
  showcaseStackRatio: StackRatio;
  showcaseStackCrop: number;
  designStackRatio: StackRatio;
  designStackCrop: number;
  sections: SectionSettings;
  order: SectionId[];
  aboutLayout: AboutLayout;
  aboutPhoto: AboutPhotoShape;
  steamLayout: SteamLayout;
  aboutSections: AboutSections;
  aboutOrder: AboutSectionId[];
  colorBg: string;
  colorInk: string;
  colorAccent: string;
  // Secondary: the full-width bands (news bar, GitHub, bottom of the footer).
  colorBand: string;
  // Tertiary: reserved. Saved and available as bg-tertiary / text-tertiary-ink, not used yet.
  colorTertiary: string;
};

// Primary white, secondary black, one accent, and a spare tertiary.
export const siteStyleDefaults: SiteStyle = {
  motion: "full",
  heroSeconds: 7,
  gallerySeconds: 6,
  heroOverlay: 25,
  heroZoom: 140,
  indexZoom: 140,
  indexVeil: 62,
  heroGray: false,
  heroMotion: heroMotionDefaults,
  density: layoutDefaults.density,
  projectSize: layoutDefaults.projectSize,
  projectView: layoutDefaults.projectView,
  projectMedia: layoutDefaults.projectMedia,
  countdownView: layoutDefaults.countdownView,
  designSize: layoutDefaults.designSize,
  designView: layoutDefaults.designView,
  designMode: layoutDefaults.designMode,
  designWideView: layoutDefaults.designWideView,
  designMedia: layoutDefaults.designMedia,
  designCount: layoutDefaults.designCount,
  designTitleAlign: layoutDefaults.designTitleAlign,
  designTitleFont: layoutDefaults.designTitleFont,
  designTitleSize: layoutDefaults.designTitleSize,
  designIntroFont: layoutDefaults.designIntroFont,
  designIntroSize: layoutDefaults.designIntroSize,
  showcaseSize: layoutDefaults.showcaseSize,
  showcaseView: layoutDefaults.showcaseView,
  showcaseMode: layoutDefaults.showcaseMode,
  showcaseWideView: layoutDefaults.showcaseWideView,
  showcaseMedia: layoutDefaults.showcaseMedia,
  showcaseTitleAlign: layoutDefaults.showcaseTitleAlign,
  showcaseTitleFont: layoutDefaults.showcaseTitleFont,
  showcaseTitleSize: layoutDefaults.showcaseTitleSize,
  showcaseIntroFont: layoutDefaults.showcaseIntroFont,
  showcaseIntroSize: layoutDefaults.showcaseIntroSize,
  showcaseStackRatio: layoutDefaults.showcaseStackRatio,
  showcaseStackCrop: layoutDefaults.showcaseStackCrop,
  designStackRatio: layoutDefaults.designStackRatio,
  designStackCrop: layoutDefaults.designStackCrop,
  sections: sectionDefaults,
  order: [...sectionIds],
  aboutLayout: aboutDefaults.aboutLayout,
  aboutPhoto: aboutDefaults.aboutPhoto,
  steamLayout: aboutDefaults.steamLayout,
  aboutSections: aboutSectionDefaults,
  aboutOrder: [...aboutSectionIds],
  colorBg: "#ffffff",
  colorInk: "#000000",
  colorAccent: "#b5532f",
  colorBand: "#000000",
  colorTertiary: "#f2f2f2",
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
    heroZoom: num(r.heroZoom, styleRanges.heroZoom, d.heroZoom),
    indexZoom: num(r.indexZoom, styleRanges.indexZoom, d.indexZoom),
    indexVeil: num(r.indexVeil, styleRanges.indexVeil, d.indexVeil),
    heroGray: typeof r.heroGray === "boolean" ? r.heroGray : d.heroGray,
    heroMotion: readHeroMotion(r.heroMotion),
    density: readChoice(r.density, densityModes, d.density),
    projectSize: readChoice(r.projectSize, projectSizes, d.projectSize),
    projectView: readChoice(r.projectView, projectViews, d.projectView),
    projectMedia: num(r.projectMedia, styleRanges.projectMedia, d.projectMedia),
    countdownView: readChoice(r.countdownView, countdownViews, d.countdownView),
    designSize: readChoice(r.designSize, designSizes, d.designSize),
    designView: readChoice(r.designView, designViews, d.designView),
    designMode: readChoice(r.designMode, designModes, d.designMode),
    designWideView: readChoice(r.designWideView, designWideViews, d.designWideView),
    designTitleAlign: readChoice(r.designTitleAlign, designTitleAligns, d.designTitleAlign),
    designTitleFont: readChoice(r.designTitleFont, designTextFonts, d.designTitleFont),
    designTitleSize: readChoice(r.designTitleSize, designTitleSizes, d.designTitleSize),
    designIntroFont: readChoice(r.designIntroFont, designTextFonts, d.designIntroFont),
    designIntroSize: readChoice(r.designIntroSize, designIntroSizes, d.designIntroSize),
    showcaseSize: readChoice(r.showcaseSize, showcaseSizes, d.showcaseSize),
    showcaseView: readChoice(r.showcaseView, showcaseViews, d.showcaseView),
    showcaseMode: readChoice(r.showcaseMode, designModes, d.showcaseMode),
    showcaseWideView: readChoice(r.showcaseWideView, showcaseWideViews, d.showcaseWideView),
    showcaseMedia: num(r.showcaseMedia, styleRanges.showcaseMedia, d.showcaseMedia),
    showcaseTitleAlign: readChoice(r.showcaseTitleAlign, designTitleAligns, d.showcaseTitleAlign),
    showcaseTitleFont: readChoice(r.showcaseTitleFont, designTextFonts, d.showcaseTitleFont),
    showcaseTitleSize: readChoice(r.showcaseTitleSize, designTitleSizes, d.showcaseTitleSize),
    showcaseIntroFont: readChoice(r.showcaseIntroFont, designTextFonts, d.showcaseIntroFont),
    showcaseIntroSize: readChoice(r.showcaseIntroSize, designIntroSizes, d.showcaseIntroSize),
    showcaseStackRatio: readChoice(r.showcaseStackRatio, stackRatios, d.showcaseStackRatio),
    showcaseStackCrop: num(r.showcaseStackCrop, styleRanges.stackCrop, d.showcaseStackCrop),
    designStackRatio: readChoice(r.designStackRatio, stackRatios, d.designStackRatio),
    designStackCrop: num(r.designStackCrop, styleRanges.stackCrop, d.designStackCrop),
    designMedia: num(r.designMedia, styleRanges.designMedia, d.designMedia),
    designCount: num(r.designCount, styleRanges.designCount, d.designCount),
    sections: readSections(r.sections),
    order: readOrder(r.order),
    aboutLayout: readChoice(r.aboutLayout, aboutLayouts, d.aboutLayout),
    aboutPhoto: readChoice(r.aboutPhoto, aboutPhotoShapes, d.aboutPhoto),
    steamLayout: readChoice(r.steamLayout, steamLayouts, d.steamLayout),
    aboutSections: readAboutSections(r.aboutSections),
    aboutOrder: readAboutOrder(r.aboutOrder),
    colorBg: color(r.colorBg, d.colorBg),
    colorInk: color(r.colorInk, d.colorInk),
    colorAccent: color(r.colorAccent, d.colorAccent),
    colorBand: color(r.colorBand, d.colorBand),
    colorTertiary: color(r.colorTertiary, d.colorTertiary),
  };
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// "pct" percent of a, the rest of b. Returns a hex color.
function mix(a: string, b: string, pct: number): string {
  const x = channels(a);
  const y = channels(b);
  const out = x.map((v, i) => Math.round((v * pct) / 100 + y[i] * (1 - pct / 100)));
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// White text on a dark color, black text on a light one.
function onColor(hex: string): string {
  return luminance(hex) < 0.179 ? "#ffffff" : "#000000";
}

type PaletteInput = Pick<SiteStyle, "colorBg" | "colorInk" | "colorAccent"> &
  Partial<Pick<SiteStyle, "colorBand" | "colorTertiary">>;

// Light mode: the theme variables of the website, made from its colors.
export function sitePalette(style: PaletteInput): CSSProperties {
  const { colorBg: bg, colorInk: ink, colorAccent: accent } = style;
  const band = style.colorBand ?? siteStyleDefaults.colorBand;
  const tertiary = style.colorTertiary ?? siteStyleDefaults.colorTertiary;
  const bandInk = onColor(band);
  return {
    "--c-bg": bg,
    "--c-surface": bg,
    "--c-ink": ink,
    "--c-ink-soft": mix(ink, bg, 62),
    "--c-line": mix(ink, bg, 18),
    "--c-highlight": mix(ink, bg, 8),
    "--c-accent": accent,
    "--c-accent-ink": onColor(accent),
    "--c-band": band,
    "--c-band-ink": bandInk,
    "--c-band-line": mix(bandInk, band, 22),
    "--c-tertiary": tertiary,
    "--c-tertiary-ink": onColor(tertiary),
  } as CSSProperties;
}

// Dark mode, made from the same colors. The page turns near-black, the text takes the page color, and the
// bands become a slightly lighter gray so they stay visible (styles/site-mode.css picks these).
export function siteDarkPalette(style: PaletteInput): CSSProperties {
  const { colorBg: bg, colorInk: ink, colorAccent: accent } = style;
  const tertiary = style.colorTertiary ?? siteStyleDefaults.colorTertiary;
  const dBg = luminance(ink) < 0.25 ? ink : "#0b0b0b";
  const dInk = luminance(bg) > 0.5 ? bg : "#f5f5f5";
  const dBand = mix("#ffffff", dBg, 9);
  const dTertiary = mix(tertiary, dBg, 22);
  return {
    "--d-bg": dBg,
    "--d-surface": dBg,
    "--d-ink": dInk,
    "--d-ink-soft": mix(dInk, dBg, 62),
    "--d-line": mix(dInk, dBg, 18),
    "--d-highlight": mix(dInk, dBg, 8),
    "--d-accent": accent,
    "--d-accent-ink": onColor(accent),
    "--d-band": dBand,
    "--d-band-ink": dInk,
    "--d-band-line": mix(dInk, dBand, 20),
    "--d-tertiary": dTertiary,
    "--d-tertiary-ink": onColor(dTertiary),
  } as CSSProperties;
}