import { z } from "zod";
import {
  backgroundFades,
  backgroundModes,
  hexColor,
  tintRange,
} from "@/config/background";
import { themeNames } from "@/config/site";

const color = z
  .string({ error: "Pick a color." })
  .trim()
  .regex(hexColor, "Pick a valid color.")
  .transform((v) => v.toLowerCase());

export const appearanceSchema = z.object({
  theme: z.enum(themeNames, { error: "Pick a theme." }),
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
});