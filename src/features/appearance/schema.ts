import { z } from "zod";
import {
  backgroundFades,
  backgroundModes,
  fadeReachRange,
  hexColor,
  tintRange,
} from "@/config/background";
import { cardKinds, cardPresetIds, cardRanges, textModes, type Range } from "@/config/card";
import { fontIds } from "@/config/font-choices";
import { themeNames } from "@/config/site";

const color = z
  .string({ error: "Pick a color." })
  .trim()
  .regex(hexColor, "Pick a valid color.")
  .transform((v) => v.toLowerCase());

// A number inside a range from config/card.ts (the same range the sliders use).
function num(label: string, range: Range, whole = true) {
  const base = z.number({ error: `${label} must be a number.` });
  return (whole ? base.int(`${label} must be a whole number.`) : base)
    .min(range.min, `${label} is out of range.`)
    .max(range.max, `${label} is out of range.`);
}

const shadow = z.object({
  x: num("Shadow X", cardRanges.shadowOffset),
  y: num("Shadow Y", cardRanges.shadowOffset),
  blur: num("Shadow blur", cardRanges.shadowBlur),
  spread: num("Shadow spread", cardRanges.shadowSpread),
  color,
  opacity: num("Shadow opacity", cardRanges.opacity),
});

export const cardSchema = z.object(
  {
    v: z.literal(1),
    kind: z.enum(cardKinds, { error: "Pick a card style." }),
    preset: z.enum(cardPresetIds, { error: "Pick a glass preset." }),
    radius: num("Corner radius", cardRanges.radius),
    fill: z.object({
      color: color.nullable(),
      opacity: num("Fill opacity", cardRanges.opacity),
    }),
    stroke: z.object({
      color: color.nullable(),
      opacity: num("Stroke opacity", cardRanges.opacity),
      width: num("Stroke width", cardRanges.strokeWidth, false),
    }),
    text: z.enum(textModes, { error: "Pick a text color." }),
    glass: z.object({
      frost: num("Frost", cardRanges.frost),
      vibrancy: num("Vibrancy", cardRanges.vibrancy),
      refraction: num("Refraction", cardRanges.effect),
      depth: num("Depth", cardRanges.effect),
      dispersion: num("Dispersion", cardRanges.effect),
      splay: num("Splay", cardRanges.effect),
      specular: num("Specular highlight", cardRanges.effect),
      light: z.object({
        angle: num("Light angle", cardRanges.angle),
        intensity: num("Light intensity", cardRanges.effect),
      }),
    }),
    inner: z.array(shadow).max(cardRanges.maxInner, "Too many inner shadows."),
    drop: z.array(shadow).max(cardRanges.maxDrop, "Too many drop shadows."),
  },
  { error: "Card style is invalid." },
);

export const appearanceSchema = z.object({
  theme: z.enum(themeNames, { error: "Pick a theme." }),
  font_heading: z.enum(fontIds, { error: "Pick a heading font." }),
  font_body: z.enum(fontIds, { error: "Pick a body font." }),
  card: cardSchema,
  bg_mode: z.enum(backgroundModes, { error: "Pick a background style." }),
  bg_fade: z.enum(backgroundFades, { error: "Pick where the photo fades." }),
  bg_color: color,
  bg_color2: color,
  bg_angle: z.coerce
    .number({ error: "Pick a gradient direction." })
    .int("Pick a gradient direction.")
    .min(0, "Pick a gradient direction.")
    .max(359, "Pick a gradient direction."),
  bg_tint: z.coerce
    .number({ error: "Photo overlay must be a number." })
    .int()
    .min(tintRange.min, "Photo overlay is out of range.")
    .max(tintRange.max, "Photo overlay is out of range."),
  bg_gray: z.boolean(),
  bg_fade_color: color,
  bg_fade_custom: z.boolean(),
  bg_fade_reach: z.coerce
    .number({ error: "Fade reach must be a number." })
    .int("Fade reach must be a whole number.")
    .min(fadeReachRange.min, "Fade reach is out of range.")
    .max(fadeReachRange.max, "Fade reach is out of range."),
  theme_bg: color,
  theme_accent: color,
});