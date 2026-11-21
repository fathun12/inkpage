import { cardRanges, mediaDefaults } from "@/config/card";
import {
  mediaFits,
  mediaHeights,
  mediaPlacements,
  mediaPositions,
  type CardMedia,
} from "@/types/block";
import { clampTo } from "./card-style";

function pick<T extends string>(value: unknown, list: readonly T[], fallback: T): T {
  return typeof value === "string" && (list as readonly string[]).includes(value) ? (value as T) : fallback;
}

// Safe reader for blocks.data.media: never throws. Old or broken data becomes null (no media)
// or falls back to the defaults for single settings.
export function readMedia(raw: unknown): CardMedia | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.url !== "string" || !/^https?:\/\//.test(r.url)) return null;
  return {
    url: r.url,
    kind: r.kind === "gif" ? "gif" : "image",
    opacity:
      typeof r.opacity === "number" && Number.isFinite(r.opacity)
        ? clampTo(cardRanges.opacity, r.opacity)
        : mediaDefaults.opacity,
    fit: pick(r.fit, mediaFits, mediaDefaults.fit),
    position: pick(r.position, mediaPositions, mediaDefaults.position),
    placement: pick(r.placement, mediaPlacements, mediaDefaults.placement),
    height: pick(r.height, mediaHeights, mediaDefaults.height),
  };
}