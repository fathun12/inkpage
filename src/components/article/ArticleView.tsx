import Link from "next/link";
import { Img } from "@/components/ui/Img";
import { formatArticleDate } from "@/lib/article-doc";
import type { DocNode } from "@/types/article";
import { ArticleBody } from "./ArticleBody";
import { ReaderShell } from "./ReaderShell";

type Props = {
  title: string;
  subtitle: string | null;
  publishedAt: string | null;
  minutes: number;
  cover?: string | null;
  doc: DocNode;
  back: string;
  backLabel: string;
  // Who wrote it. href = the About page, or null when there is none.
  author?: { name: string; href: string | null };
  // The article's tags. href = the Articles page filtered by that tag.
  tags?: { label: string; href: string }[];
  // The series the article belongs to, with every live part in order.
  series?: {
    title: string;
    href: string;
    parts: { title: string; href: string; number: number; current: boolean }[];
  };
};

// One clean page: a single reading column. The reader can change font, size, alignment and width.
export function ArticleView({ title, subtitle, publishedAt, minutes, cover, doc, back, backLabel, author, tags, series }: Props) {
  const meta = [formatArticleDate(publishedAt), `${minutes} min read`].filter(Boolean).join(" · ");
  return (
    <ReaderShell
      head={
        <>
          <Link href={back} className="font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink">
            &larr; {backLabel}
          </Link>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-3 text-xl text-ink-soft">{subtitle}</p>}
        </>
      }
      meta={
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
          {author && (
            <>
              By{" "}
              {author.href ? (
                <Link href={author.href} rel="author" className="underline underline-offset-4 hover:text-ink">
                  {author.name}
                </Link>
              ) : (
                author.name
              )}
              {" · "}
            </>
          )}
          {meta}
        </p>
      }
    >
      {cover && <Img src={cover} className="mt-8 aspect-2/1 w-full bg-surface object-cover" />}
      <div className="mt-10">
        <ArticleBody doc={doc} />
      </div>
      {tags && tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2">
          {tags.map((tag) => (
            <Link
              key={tag.label}
              href={tag.href}
              className="font-mono text-[11px] tracking-wide text-ink-soft hover:text-ink"
            >
              #{tag.label}
            </Link>
          ))}
        </div>
      )}
      {series && (
        <nav aria-label="Series" className="mt-10 border-t border-line pt-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
            Series:{" "}
            <Link href={series.href} className="underline underline-offset-4 hover:text-ink">
              {series.title}
            </Link>
          </p>
          <ol className="mt-4 flex flex-col gap-2">
            {series.parts.map((part) => (
              <li key={part.href} className="flex gap-3 text-sm">
                <span className="w-6 shrink-0 font-mono text-ink-soft">{part.number}.</span>
                {part.current ? (
                  <span aria-current="page" className="font-semibold">
                    {part.title}
                  </span>
                ) : (
                  <Link href={part.href} className="hover:underline">
                    {part.title}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
    </ReaderShell>
  );
}