import { z } from "zod";
import { articleLimits } from "@/config/article";
import { siteConfig } from "@/config/site";

const title = z.string().trim().max(articleLimits.title, `The title can be at most ${articleLimits.title} characters.`);
const subtitle = z
  .string()
  .trim()
  .max(articleLimits.subtitle, `The subtitle can be at most ${articleLimits.subtitle} characters.`);

// Autosave: an empty title is fine for a draft.
export const draftSchema = z.object({ title, subtitle });

export const publishSchema = z.object({
  title: title.min(1, "Give the article a title before publishing."),
  subtitle,
  slug: z
    .string()
    .min(1, "The address cannot be empty.")
    .max(articleLimits.slug, `The address can be at most ${articleLimits.slug} characters.`),
});

// "2026-11-30T09:00" typed by the owner is WIB (UTC+7). Returns the real moment, or null.
export function parseWhen(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  const time = Date.UTC(y, mo - 1, d, h, mi) - siteConfig.utcOffsetMinutes * 60_000;
  const date = new Date(time);
  return Number.isNaN(date.getTime()) ? null : date;
}