import type { ArticleSummary } from "@/types/article";
import type { Series } from "@/types/series";

// One series as the cards show it: the series, its live parts in order, and the picture for the card.
export type SeriesCardData = {
  series: Series;
  parts: ArticleSummary[];
  cover: string | null;
  latest: number;
};

function time(article: ArticleSummary): number {
  return article.published_at ? Date.parse(article.published_at) : 0;
}

// Part number first (no number = after the numbered ones), then the oldest first.
export function sortParts(parts: ArticleSummary[]): ArticleSummary[] {
  return [...parts].sort((a, b) => {
    const pa = a.series_position ?? Number.MAX_SAFE_INTEGER;
    const pb = b.series_position ?? Number.MAX_SAFE_INTEGER;
    if (pa !== pb) return pa - pb;
    return time(a) - time(b);
  });
}

export function seriesIdsOf(articles: ArticleSummary[]): string[] {
  return [...new Set(articles.flatMap((a) => (a.series_id ? [a.series_id] : [])))];
}

// Cards only for series that have at least one live article. The series with the newest article comes first.
export function buildSeriesCards(series: Series[], articles: ArticleSummary[]): SeriesCardData[] {
  const cards: SeriesCardData[] = [];
  for (const s of series) {
    const parts = sortParts(articles.filter((a) => a.series_id === s.id));
    if (parts.length === 0) continue;
    cards.push({
      series: s,
      parts,
      cover: parts.find((p) => p.cover_url)?.cover_url ?? null,
      latest: Math.max(...parts.map(time)),
    });
  }
  return cards.sort((a, b) => b.latest - a.latest);
}