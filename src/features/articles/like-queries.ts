import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hashVisitor, readVisitorId } from "./visitor";

// The likes of one article and whether this visitor already liked it. A failure gives 0 and false, so the page never breaks.
export async function getLikeInfo(articleId: string): Promise<{ count: number; liked: boolean }> {
  const supabase = await createClient();
  const visitor = await readVisitorId();

  const [countRes, likedRes] = await Promise.all([
    supabase.from("articles").select("like_count").eq("id", articleId).maybeSingle(),
    visitor
      ? createAdminClient()
          .from("article_likes")
          .select("article_id")
          .eq("article_id", articleId)
          .eq("visitor_hash", hashVisitor(visitor))
          .maybeSingle()
      : Promise.resolve(null),
  ]);

  if (countRes.error) console.error("getLikeInfo count failed", countRes.error.message);
  if (likedRes?.error) console.error("getLikeInfo liked failed", likedRes.error.message);
  return {
    count: (countRes.data as { like_count: number } | null)?.like_count ?? 0,
    liked: !!likedRes?.data,
  };
}

// The live article with the most likes (at least one), besides the one being read. null when there is none.
export async function getPopularArticleId(userId: string, excludeId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .gt("like_count", 0)
    .neq("id", excludeId)
    .order("like_count", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("getPopularArticleId failed", error.message);
    return null;
  }
  return (data as { id: string } | null)?.id ?? null;
}