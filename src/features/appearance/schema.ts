import { z } from "zod";
import { hexColor } from "@/config/background";
import { fontIds } from "@/config/font-choices";
import { motionModes, styleRanges } from "@/config/site-style";

const color = z
  .string({ error: "Pick a color." })
  .trim()
  .regex(hexColor, "Pick a valid color.")
  .transform((v) => v.toLowerCase());

function whole(label: string, range: { min: number; max: number }) {
  return z.coerce
    .number({ error: `${label} must be a number.` })
    .int(`${label} must be a whole number.`)
    .min(range.min, `${label} is out of range.`)
    .max(range.max, `${label} is out of range.`);
}

export const appearanceSchema = z.object({
  font_heading: z.enum(fontIds, { error: "Pick a heading font." }),
  font_body: z.enum(fontIds, { error: "Pick a body font." }),
  site_color_bg: color,
  site_color_ink: color,
  site_color_accent: color,
  site_motion: z.enum(motionModes, { error: "Pick a motion style." }),
  site_hero_seconds: whole("Hero slide time", styleRanges.seconds),
  site_gallery_seconds: whole("Gallery fade time", styleRanges.seconds),
  site_hero_overlay: whole("Hero overlay", styleRanges.heroOverlay),
  site_index_veil: whole("List overlay", styleRanges.indexVeil),
  site_hero_zoom: whole("Scroll zoom", styleRanges.heroZoom),
  site_hero_gray: z.boolean(),
});