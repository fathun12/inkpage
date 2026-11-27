"use server";

import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { isUuid, slugify } from "@/lib/article-doc";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { createClient } from "@/lib/supabase/server";
import { firstError } from "@/lib/validation";
import { seriesSchema } from "./schema";

type DbError = { code?: string; message: string };

function dbMessage(error: DbError): string {
  if (error.code === "42P01" || error.code === "PGRST205") {
    return "The database does not know series yet. Run the migration 20261127010000_articles_tags_series.sql in Supabase, then try again.";
  }
  return `Database error: ${error.message}`;
}

function readText(formData: FormData) {
  return seriesSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
}

export async function createSeriesAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = routes.series;
  const parsed = readText(formData);
  if (!parsed.success) return redirectWithError(back, firstError(parsed.error));

  const slug = slugify(parsed.data.title) || `series-${crypto.randomUUID().slice(0, 8)}`;
  const supabase = await createClient();
  const { error } = await supabase.from("series").insert({
    user_id: user.id,
    slug,
    title: parsed.data.title,
    description: parsed.data.description || null,
  });
  if (error) {
    return redirectWithError(
      back,
      error.code === "23505"
        ? `The address "${slug}" is already used by another series. Give this one another title.`
        : dbMessage(error),
    );
  }
  return redirectWithSaved(back, "Series created.");
}

export async function updateSeriesAction(id: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = routes.series;
  if (!isUuid(id)) return redirectWithError(back, "This series address is not valid.");
  const parsed = readText(formData);
  if (!parsed.success) return redirectWithError(back, firstError(parsed.error));
  const slug = slugify(String(formData.get("slug") ?? ""));
  if (!slug) return redirectWithError(back, "The address needs at least one letter or number.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("series")
    .update({
      title: parsed.data.title,
      slug,
      description: parsed.data.description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");
  if (error) {
    return redirectWithError(
      back,
      error.code === "23505" ? `The address "${slug}" is already used by another series.` : dbMessage(error),
    );
  }
  if (!data || data.length === 0) return redirectWithError(back, "This series no longer exists.");
  return redirectWithSaved(back, "Saved.");
}

// The articles stay. They only leave the series.
export async function deleteSeriesAction(id: string): Promise<void> {
  const user = await requireUser();
  const back = routes.series;
  if (!isUuid(id)) return redirectWithError(back, "This series address is not valid.");
  const supabase = await createClient();
  const { data, error } = await supabase.from("series").delete().eq("id", id).eq("user_id", user.id).select("id");
  if (error) return redirectWithError(back, dbMessage(error));
  if (!data || data.length === 0) return redirectWithError(back, "This series no longer exists.");
  return redirectWithSaved(back, "Series deleted. Its articles are kept.");
}