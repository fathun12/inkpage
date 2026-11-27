import type { ArticleSummary } from "@/types/article";

// One article in "More from", with the reason it is there.
export type MoreItem = { label: "Related" | "Popular" | "Latest" | "More"; article: ArticleSummary };

function time(article: ArticleSummary): number {
  return article.published_at ? Date.parse(article.published_at) : 0;
}

// Up to three articles besides the current one: the most related (most shared tags), the popular one
// (popularId, from the likes), and the newest. An article is never listed twice. If a slot has no
// candidate, the newest unused articles fill it up to three.
export function pickMoreFrom(
  current: { id: string; tags: string[] },
  all: ArticleSummary[],
  popularId: string | null = null,
): MoreItem[] {
  const pool = all.filter((a) => a.id !== current.id && a.slug);
  const newest = [...pool].sort((a, b) => time(b) - time(a));
  const used = new Set<string>();
  const out: MoreItem[] = [];

  const take = (label: MoreItem["label"], article: ArticleSummary | undefined) => {
    if (!article || used.has(article.id)) return;
    used.add(article.id);
    out.push({ label, article });
  };

  // Related: newest first, so a tie goes to the newer article (only a strictly higher score replaces).
  const mine = new Set(current.tags);
  let best: ArticleSummary | undefined;
  let bestScore = 0;
  for (const a of newest) {
    const score = a.tags.filter((t) => mine.has(t)).length;
    if (score > bestScore) {
      best = a;
      bestScore = score;
    }
  }
  take("Related", best);
  take("Popular", popularId ? pool.find((a) => a.id === popularId) : undefined);
  take("Latest", newest.find((a) => !used.has(a.id)));
  for (const a of newest) {
    if (out.length >= 3) break;
    take("More", a);
  }
  return out;
}