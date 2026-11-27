import { createClient } from "@/lib/supabase/server";
import type { OwnSeries, Series } from "@/types/series";

const columns = "id, slug, title, description, cover_url, created_at, updated_at";

type DbError = { code?: string; message: string };

function describe(error: DbError): string {
  if (error.code === "42P01" || error.code === "PGRST205") {
    return "The database does not know series yet. Run the migration 20261127010000_articles_tags_series.sql in Supabase, then reload.";
  }
  return `Could not read the series: ${error.message}`;
}

// Admin: every series of the owner, oldest first, with the number of articles in each. Throws (the admin error page shows the reason).
export async function getOwnSeries(userId: string): Promise<OwnSeries[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("series")
    .select(columns)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(describe(error));

  const { data: rows, error: countError } = await supabase
    .from("articles")
    .select("series_id")
    .eq("user_id", userId)
    .not("series_id", "is", null);
  if (countError) throw new Error(describe(countError));

  const counts = new Map<string, number>();
  for (const row of (rows ?? []) as unknown as { series_id: string }[]) {
    counts.set(row.series_id, (counts.get(row.series_id) ?? 0) + 1);
  }
  return ((data ?? []) as unknown as Series[]).map((s) => ({ ...s, articleCount: counts.get(s.id) ?? 0 }));
}