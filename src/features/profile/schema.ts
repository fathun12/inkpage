import { z } from "zod";
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

export const setupSchema = z.object({ username, display_name: displayName });

export const profileSchema = z.object({
  display_name: displayName,
  bio: z.string().trim().max(240, "Bio can be at most 240 characters.").optional(),
  theme: z.enum(themeNames, { error: "Pick a theme." }),
});