import Link from "next/link";
import { Img } from "@/components/ui/Img";
import { routes } from "@/config/site";
import { formatArticleDate } from "@/lib/article-doc";
import type { ArticleSummary } from "@/types/article";
import { Reveal } from "./Reveal";

type Props = {
  articles: ArticleSummary[];
  username: string;
  // The Articles page: cover plus an extra line of the excerpt.
  previews?: boolean;
  // Home: only the cover is added (at the right, when the article has one).
  covers?: boolean;
};

// Articles written inside inkpage. Newest first (the query sorts).
export function ArticleList({ articles, username, previews = false, covers = false }: Props) {
  return (
    <ul className="mx-auto flex max-w-5xl flex-col px-5 pb-12 pt-4 sm:px-8">
      {articles.map((article, index) => {
        if (!article.slug) return null;
        const meta = [formatArticleDate(article.published_at), `${article.reading_minutes} min read`]
          .filter(Boolean)
          .join(" · ");
        const lead = article.subtitle ?? article.excerpt;
        const cover = previews || covers ? article.cover_url : null;
        return (
          <li key={article.id} className="border-t border-tertiary first:border-t-0">
            <Reveal delay={Math.min(index, 6) * 60}>
              <Link
                href={routes.article(username, article.slug)}
                className={
                  cover
                    ? "flex flex-col gap-5 py-8 hover:opacity-80 sm:flex-row sm:items-start sm:gap-8"
                    : "block py-8 hover:opacity-80"
                }
              >
                {cover && (
                  <Img src={cover} className="aspect-2/1 w-full shrink-0 bg-surface object-cover sm:order-last sm:w-64" />
                )}
                <span className="block min-w-0 flex-1">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{meta}</span>
                  <span className="mt-1 block font-display text-2xl leading-tight sm:text-3xl">{article.title}</span>
                  {lead && <span className="mt-2 block max-w-xl text-sm text-ink-soft">{lead}</span>}
                  {previews && article.subtitle && article.excerpt && (
                    <span className="mt-2 block max-w-xl text-sm text-ink-soft opacity-80">{article.excerpt}</span>
                  )}
                </span>
              </Link>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}