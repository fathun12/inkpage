import Link from "next/link";
import { routes } from "@/config/site";
import { formatArticleDate } from "@/lib/article-doc";
import type { ArticleSummary } from "@/types/article";
import { Reveal } from "./Reveal";

// Articles written inside inkpage, same list style as the linked writing below them. Newest first (the query sorts).
export function ArticleList({ articles, username }: { articles: ArticleSummary[]; username: string }) {
  return (
    <ul className="mx-auto flex max-w-5xl flex-col px-5 pb-12 pt-4 sm:px-8">
      {articles.map((article, index) => {
        if (!article.slug) return null;
        const meta = [formatArticleDate(article.published_at), `${article.reading_minutes} min read`]
          .filter(Boolean)
          .join(" · ");
        return (
          <li key={article.id} className="border-t border-tertiary first:border-t-0">
            <Reveal delay={Math.min(index, 6) * 60}>
              <Link href={routes.article(username, article.slug)} className="block py-8 hover:opacity-80">
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{meta}</span>
                <span className="mt-1 block font-display text-2xl leading-tight sm:text-3xl">{article.title}</span>
                {(article.subtitle || article.excerpt) && (
                  <span className="mt-2 block max-w-xl text-sm text-ink-soft">{article.subtitle ?? article.excerpt}</span>
                )}
              </Link>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}