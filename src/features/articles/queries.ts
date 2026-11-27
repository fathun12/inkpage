import { articleState, isUuid, readDoc } from "@/lib/article-doc";
import { createClient } from "@/lib/supabase/server";
import type { Article, ArticleSummary, OwnArticle, OwnArticleSummary } from "@/types/article";

const summaryColumns =
  "id, slug, title, subtitle, excerpt, reading_minutes, cover_url, tags, series_id, series_position, status, published_at, updated_at";

type DbError = { code?: string; message: string };

function describe(error: DbError): string {
  if (error.code === "42P01" || error.code === "PGRST205") {
    return "The database does not know articles yet. Run the migration 20261125020000_articles.sql in Supabase, then reload.";
  }
  return `Could not read the articles: ${error.message}`;
}

// Admin: every article of the owner. Throws (the admin error page shows the reason).
export async function getOwnArticles(userId: string): Promise<OwnArticleSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(summaryColumns)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(describe(error));
  const now = new Date();
  return ((data ?? []) as unknown as ArticleSummary[]).map((a) => ({
    ...a,
    state: articleState(a.status, a.published_at, now),
  }));
}

export async function getOwnArticle(userId: string, id: string): Promise<OwnArticle | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("articles").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  if (error) throw new Error(describe(error));
  if (!data) return null;
  const row = data as unknown as Article;
  return { ...row, content: readDoc(row.content), state: articleState(row.status, row.published_at, new Date()) };
}

// Public: published articles whose time has come. A failure gives an empty list, so Writing never breaks.
export async function getPublicArticles(userId: string): Promise<ArticleSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(summaryColumns)
    .eq("user_id", userId)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  if (error) {
    console.error("getPublicArticles failed", error.message);
    return [];
  }
  return ((data ?? []) as unknown as ArticleSummary[]).filter((a) => a.slug);
}

export async function getPublicArticle(userId: string, slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("user_id", userId)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) {
    console.error("getPublicArticle failed", error.message);
    return null;
  }
  if (!data) return null;
  const row = data as unknown as Article;
  return { ...row, content: readDoc(row.content) };
}