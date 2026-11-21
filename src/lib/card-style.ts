import type { CSSProperties } from "react";
import { hexColor } from "@/config/background";
import {
  cardDefaults,
  cardKinds,
  cardPresetIds,
  cardRanges,
  cardTextColors,
  glassFillColor,
  glassFillOpacity,
  glassPresets,
  lensTuning,
  newDrop,
  newInner,
  ringWidth,
  textModes,
  type CardKind,
  type CardStyle,
  type GlassPreset,
  type Range,
  type Shadow,
} from "@/config/card";

const round = (n: number, digits = 2) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

// Keeps a number inside a range and on its step.
export function clampTo(range: Range, value: number): number {
  const n = Math.min(range.max, Math.max(range.min, value));
  return round(Math.round((n - range.min) / range.step) * range.step + range.min);
}

function pickNum(v: unknown, range: Range, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? clampTo(range, v) : fallback;
}

function pickEnum<T extends string>(v: unknown, list: readonly T[], fallback: T): T {
  return typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback;
}

function pickColor(v: unknown): string | null {
  return typeof v === "string" && hexColor.test(v) ? v.toLowerCase() : null;
}

function asObject(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function readShadows(v: unknown, max: number, start: Shadow): Shadow[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, max).map((item) => {
    const s = asObject(item);
    return {
      x: pickNum(s.x, cardRanges.shadowOffset, start.x),
      y: pickNum(s.y, cardRanges.shadowOffset, start.y),
      blur: pickNum(s.blur, cardRanges.shadowBlur, start.blur),
      spread: pickNum(s.spread, cardRanges.shadowSpread, start.spread),
      color: pickColor(s.color) ?? start.color,
      opacity: pickNum(s.opacity, cardRanges.opacity, start.opacity),
    };
  });
}

// Safe reader: never throws. Null, {}, wrong types or out-of-range numbers fall back to the defaults.
export function readCard(raw: unknown): CardStyle {
  const d = cardDefaults;
  const r = asObject(raw);
  const fill = asObject(r.fill);
  const stroke = asObject(r.stroke);
  const glass = asObject(r.glass);
  const light = asObject(glass.light);
  const kind = pickEnum(r.kind, cardKinds, d.kind);
  return {
    v: 1,
    kind,
    preset: pickEnum(r.preset, cardPresetIds, d.preset),
    radius: pickNum(r.radius, cardRanges.radius, d.radius),
    fill: {
      color: pickColor(fill.color),
      opacity: pickNum(fill.opacity, cardRanges.opacity, kind === "glass" ? glassFillOpacity : d.fill.opacity),
    },
    stroke: {
      color: pickColor(stroke.color),
      opacity: pickNum(stroke.opacity, cardRanges.opacity, d.stroke.opacity),
      width: pickNum(stroke.width, cardRanges.strokeWidth, d.stroke.width),
    },
    text: pickEnum(r.text, textModes, d.text),
    glass: {
      frost: pickNum(glass.frost, cardRanges.frost, d.glass.frost),
      vibrancy: pickNum(glass.vibrancy, cardRanges.vibrancy, d.glass.vibrancy),
      refraction: pickNum(glass.refraction, cardRanges.effect, d.glass.refraction),
      depth: pickNum(glass.depth, cardRanges.effect, d.glass.depth),
      dispersion: pickNum(glass.dispersion, cardRanges.effect, d.glass.dispersion),
      splay: pickNum(glass.splay, cardRanges.effect, d.glass.splay),
      specular: pickNum(glass.specular, cardRanges.effect, d.glass.specular),
      light: {
        angle: pickNum(light.angle, cardRanges.angle, d.glass.light.angle),
        intensity: pickNum(light.intensity, cardRanges.effect, d.glass.light.intensity),
      },
    },
    inner: readShadows(r.inner, cardRanges.maxInner, newInner),
    drop: readShadows(r.drop, cardRanges.maxDrop, newDrop),
  };
}

// Clicking a preset sets the glass numbers (not the colors). It adds one soft drop shadow if there is none.
export function applyPreset(card: CardStyle, preset: GlassPreset): CardStyle {
  const p = glassPresets[preset];
  return {
    ...card,
    kind: "glass",
    preset,
    fill: { ...card.fill, opacity: p.fillOpacity },
    glass: {
      ...card.glass,
      frost: p.frost,
      vibrancy: p.vibrancy,
      refraction: p.refraction,
      depth: p.depth,
      dispersion: p.dispersion,
      splay: p.splay,
      specular: p.specular,
    },
    drop: card.drop.length > 0 ? card.drop : [{ ...newDrop }],
  };
}

export function switchKind(card: CardStyle, kind: CardKind): CardStyle {
  if (kind === "solid") {
    return { ...card, kind, fill: { ...card.fill, opacity: cardDefaults.fill.opacity } };
  }
  if (card.preset === "custom") {
    return { ...card, kind, fill: { ...card.fill, opacity: glassFillOpacity } };
  }
  return applyPreset(card, card.preset);
}

function shadowCss(s: Shadow, inset: boolean): string {
  const mix = `color-mix(in srgb, ${s.color} ${s.opacity}%, transparent)`;
  return `${inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${mix}`;
}

type Vars = CSSProperties & { [name: `--${string}`]: string };

// CSS variables for the page wrapper (PublicFrame). Only values that differ from the default
// are set, so a default card has no variables and looks exactly like the old card.
export function cardVars(card: CardStyle): CSSProperties {
  const d = cardDefaults;
  const glass = card.kind === "glass";
  const v: Vars = {};

  if (card.radius !== d.radius) v["--card-r"] = `${card.radius}px`;

  const customFill = glass || card.fill.color !== null || card.fill.opacity !== d.fill.opacity;
  if (customFill) {
    v["--card-fill-c"] = card.fill.color ?? (glass ? glassFillColor : "var(--c-surface)");
    v["--card-fill-o"] = `${card.fill.opacity}%`;
    v["--card-pin-ow"] = "2px";
  }

  if (card.text !== "auto") v["--card-ink"] = cardTextColors[card.text];
  else if (customFill) v["--card-ink"] = "var(--c-ink)";

  if (card.stroke.width !== d.stroke.width) v["--card-sw"] = `${card.stroke.width}px`;
  if (card.stroke.color !== null) v["--card-stroke-c"] = card.stroke.color;
  if (card.stroke.opacity !== d.stroke.opacity) v["--card-stroke-o"] = `${card.stroke.opacity}%`;

  if (card.drop.length > 0) v["--card-drop"] = card.drop.map((s) => shadowCss(s, false)).join(", ");
  if (card.inner.length > 0) v["--card-inner"] = card.inner.map((s) => shadowCss(s, true)).join(", ");

  if (glass) {
    const g = card.glass;
    const spec = round(g.specular * (g.light.intensity / 100), 1);
    if (spec > 0) {
      v["--card-spec"] = `${spec}%`;
      v["--card-ring"] = `${ringWidth}px`;
      v["--card-light"] = `${g.light.angle}deg`;
    }
  }
  return v;
}

// Displacement map for the lens: neutral gray in the middle, a bevel at the four edges.
// Red moves pixels sideways, green up and down. Edges sample from the inside of the card.
function lensMapUri(depth: number): string {
  const w = round(depth * lensTuning.edgeX, 2);
  const h = round(depth * lensTuning.edgeY, 2);
  const stop = (offset: number, color: string, opacity: number) =>
    `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`;
  const grad = (id: string, x1: number, y1: number, x2: number, y2: number, color: string) =>
    `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stop(0, color, 1)}${stop(1, color, 0)}</linearGradient>`;

  let body = "";
  if (w > 0) {
    body += `<rect x="0" y="0" width="${w}" height="100" fill="url(#l)"/>`;
    body += `<rect x="${round(100 - w)}" y="0" width="${w}" height="100" fill="url(#r)"/>`;
  }
  if (h > 0) {
    body += `<rect x="0" y="0" width="100" height="${h}" fill="url(#t)"/>`;
    body += `<rect x="0" y="${round(100 - h)}" width="100" height="${h}" fill="url(#b)"/>`;
  }
  const defs =
    grad("l", 0, 0, 1, 0, "rgb(255,128,128)") +
    grad("r", 1, 0, 0, 0, "rgb(0,128,128)") +
    grad("t", 0, 0, 0, 1, "rgb(128,255,128)") +
    grad("b", 0, 1, 0, 0, "rgb(128,0,128)");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none">` +
    `<defs>${defs}</defs><rect width="100" height="100" fill="rgb(128,128,128)"/>${body}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Numbers for the SVG filter #ink-lens. Null = no lens (solid card, or Refraction 0 = the kill switch).
export function lensParams(card: CardStyle) {
  const g = card.glass;
  if (card.kind !== "glass" || g.refraction <= 0) return null;
  const base = g.refraction * lensTuning.scalePerPoint;
  const spread = (g.dispersion / 100) * lensTuning.maxSpread;
  return {
    map: lensMapUri(g.depth),
    blur: round(g.splay * lensTuning.blurPerPoint, 2),
    dispersed: g.dispersion > 0,
    red: round(base * (1 + spread)),
    green: round(base),
    blue: round(base * (1 - spread)),
  };
}

// The backdrop-filter rules of glass cards, with plain numbers (no var()), written as CSS text.
// No quotes and no ">" in here: this text goes inside a <style> element.
// The lens only runs where an SVG filter works inside backdrop-filter (Chrome and Edge).
// Safari and Firefox are excluded by the @supports test, so they keep blur + saturate.
export function glassCss(card: CardStyle): string | null {
  if (card.kind !== "glass") return null;
  const { frost, vibrancy, refraction } = card.glass;
  const base = `blur(${frost}px) saturate(${vibrancy}%)`;
  const scope = "[data-card=glass] .card";
  let css = `${scope}{-webkit-backdrop-filter:${base};backdrop-filter:${base};}`;
  if (refraction > 0) {
    css += `@supports (not (-webkit-hyphens:none)) and (not (-moz-appearance:none)){${scope}{backdrop-filter:${base} url(#ink-lens);}}`;
  }
  css += `@media (prefers-reduced-transparency:reduce){${scope}{-webkit-backdrop-filter:none;backdrop-filter:none;background-color:color-mix(in srgb,var(--card-fill-c,#fff) 75%,var(--c-bg));}}`;
  return css;
}