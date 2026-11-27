import { queryWords } from "@/lib/search";
import { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// LIKE treats % and _ as wildcards. A backslash makes them plain characters.
// "*" is removed, because the database layer turns it into a wildcard.
function likePattern(text: string): string {
  return `%${text.replace(/\*/g, "").replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

// Live articles of this author whose search_text holds every given piece of text.
async function idsContaining(supabase: Supabase, userId: string, pieces: string[]): Promise<string[]> {
  let request = supabase
    .from("articles")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());
  for (const piece of pieces) request = request.ilike("search_text", likePattern(piece));
  const { data, error } = await request.limit(500);
  if (error) {
    console.error("searchArticleIds failed", error.message);
    return [];
  }
  return ((data ?? []) as unknown as { id: string }[]).map((row) => row.id);
}

// Public: the ids of the live articles that match. First the whole phrase (good for a sentence).
// If nothing holds it, every word must be present (good for a title and a tag).
export async function searchArticleIds(userId: string, query: string): Promise<Set<string>> {
  const supabase = await createClient();
  const phrase = await idsContaining(supabase, userId, [query]);
  if (phrase.length > 0) return new Set(phrase);
  const words = queryWords(query);
  if (words.length < 2) return new Set();
  return new Set(await idsContaining(supabase, userId, words));
}