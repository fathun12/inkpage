import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { routes } from "@/config/site";
import { formatArticleDate } from "@/lib/article-doc";
import type { ArticleState, OwnArticleSummary } from "@/types/article";
import type { FormAction } from "@/types/form";

type Props = { articles: OwnArticleSummary[]; username: string; create: FormAction };

const stateLabels: Record<ArticleState, string> = { draft: "Draft", scheduled: "Scheduled", live: "Live" };

export function ArticlesAdmin({ articles, username, create }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <form action={create}>
          <SubmitButton variant="accent" pendingLabel="Creating...">
            Write a new article
          </SubmitButton>
        </form>
        <Link href={routes.series} className="text-sm underline underline-offset-4">
          Manage series
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="font-mono text-sm text-ink-soft">No articles yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {articles.map((article) => (
            <li key={article.id} className="ink-border flex flex-wrap items-center gap-3 rounded-md bg-surface px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-medium">{article.title || "Untitled"}</p>
                <p className="font-mono text-xs text-ink-soft">
                  {stateLabels[article.state]} · {article.reading_minutes} min read · edited{" "}
                  {formatArticleDate(article.updated_at)}
                </p>
              </div>
              {article.state === "live" && article.slug && (
                <a
                  href={routes.article(username, article.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm underline underline-offset-4"
                >
                  View
                </a>
              )}
              <ButtonLink href={routes.writeEdit(article.id)} size="sm">
                Edit
              </ButtonLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}