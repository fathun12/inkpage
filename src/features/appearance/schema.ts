import { z } from "zod";
import { hexColor } from "@/config/background";
import { fontIds } from "@/config/font-choices";
import {
  countdownViews,
  densityModes,
  projectSizes,
  projectViews,
  sectionSpace,
  sectionSurfaces,
} from "@/config/layout";
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

const sectionSpaceNumber = z
  .number({ error: "Section space must be a number." })
  .min(sectionSpace.min, "Section space is out of range.")
  .max(sectionSpace.max, "Section space is out of range.")
  .multipleOf(sectionSpace.step, "Section space must move in steps of 0.5.");

// The studio sends all section settings as one JSON text.
const sectionsJson = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "The section settings are not valid." });
      return z.NEVER;
    }
  })
  .pipe(
    z.record(
      z.string(),
      z.object({
        hidden: z.boolean(),
        top: sectionSpaceNumber,
        bottom: sectionSpaceNumber,
        surface: z.enum(sectionSurfaces, { error: "Pick a section background." }),
        line: z.boolean(),
      }),
    ),
  );

// The studio sends the order of the sections as one JSON text, a list of ids.
const orderJson = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "The section order is not valid." });
      return z.NEVER;
    }
  })
  .pipe(z.array(z.string()).max(30, "The section order is not valid."));

export const appearanceSchema = z.object({
  font_heading: z.enum(fontIds, { error: "Pick a heading font." }),
  font_body: z.enum(fontIds, { error: "Pick a body font." }),
  site_color_bg: color,
  site_color_ink: color,
  site_color_accent: color,
  site_color_band: color,
  site_color_tertiary: color,
  site_motion: z.enum(motionModes, { error: "Pick a motion style." }),
  site_hero_seconds: whole("Hero slide time", styleRanges.seconds),
  site_gallery_seconds: whole("Gallery fade time", styleRanges.seconds),
  site_hero_overlay: whole("Hero overlay", styleRanges.heroOverlay),
  site_index_veil: whole("List overlay", styleRanges.indexVeil),
  site_hero_zoom: whole("Scroll zoom", styleRanges.heroZoom),
  site_index_zoom: whole("Link list zoom", styleRanges.indexZoom),
  site_hero_gray: z.boolean(),
  site_density: z.enum(densityModes, { error: "Pick a spacing." }),
  site_project_size: z.enum(projectSizes, { error: "Pick a project size." }),
  site_project_view: z.enum(projectViews, { error: "Pick a projects layout." }),
  site_project_media: whole("Projects photo height", styleRanges.projectMedia),
  site_countdown_view: z.enum(countdownViews, { error: "Pick a countdown style." }),
  site_sections: sectionsJson,
  site_order: orderJson,
});