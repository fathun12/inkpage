import { z } from "zod";
import {
  backgroundFades,
  backgroundModes,
  gradientDirections,
  hexColor,
  tintRange,
} from "@/config/background";
import { themeNames } from "@/config/site";

export const reservedUsernames = [
  "admin", "api", "go", "login", "logout", "_next", "static", "favicon.ico",
];

const username = z
  .string({ error: "Choose a username." })
  .trim()
  .toLowerCase()
  .min(3, "Username needs at least 3 characters.")
  .max(30, "Username can be at most 30 characters.")
  .regex(/^[a-z0-9][a-z0-9_-]*$/, "Use only letters, numbers, - and _.")
  .refine((v) => !reservedUsernames.includes(v), "That username is reserved.");

const displayName = z
  .string({ error: "Name is required." })
  .trim()
  .min(1, "Name is required.")
  .max(60, "Name can be at most 60 characters.");

const angles: number[] = gradientDirections.map((d) => d.value);

const color = z
  .string({ error: "Pick a color." })
  .trim()
  .regex(hexColor, "Pick a valid color.")
  .transform((v) => v.toLowerCase());

export const setupSchema = z.object({ username, display_name: displayName });

export const profileSchema = z.object({
  display_name: displayName,
  bio: z.string().trim().max(240, "Bio can be at most 240 characters.").optional(),
  theme: z.enum(themeNames, { error: "Pick a theme." }),
  bg_mode: z.enum(backgroundModes, { error: "Pick a background style." }),
  bg_fade: z.enum(backgroundFades, { error: "Pick where the photo fades." }),
  bg_color: color,
  bg_color2: color,
  bg_angle: z.coerce
    .number({ error: "Pick a gradient direction." })
    .refine((v) => angles.includes(v), "Pick a gradient direction."),
  bg_tint: z.coerce
    .number({ error: "Photo overlay must be a number." })
    .int()
    .min(tintRange.min, "Photo overlay is out of range.")
    .max(tintRange.max, "Photo overlay is out of range."),
  bg_gray: z.boolean(),
});