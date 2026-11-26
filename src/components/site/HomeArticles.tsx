import Link from "next/link";
import { routes } from "@/config/site";
import type { ArticleSummary } from "@/types/article";
import { ArticleList } from "./ArticleList";
import { Reveal } from "./Reveal";

// The newest articles written inside inkpage, with a link to all of them (the Articles page).
// joined = the card slider sits right above, so this section sits close to it (one section to the eye).
export function HomeArticles({
  articles,
  username,
  title,
  joined = false,
}: {
  articles: ArticleSummary[];
  username: string;
  title: string;
  joined?: boolean;
}) {
  const shown = articles.filter((article) => article.slug).slice(0, 3);
  if (shown.length === 0) return null;
  return (
    <section id="articles" aria-label={title} className={joined ? undefined : "pt-16 sm:pt-24"}>
      <div className="mx-auto flex max-w-5xl items-baseline justify-between gap-4 px-5 pb-4 sm:px-8">
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
        </Reveal>
        <Link
          href={routes.section(username, "articles")}
          className="font-mono text-xs uppercase tracking-widest hover:opacity-70"
        >
          More articles &rarr;
        </Link>
      </div>
      <ArticleList articles={shown} username={username} covers />
    </section>
  );
}