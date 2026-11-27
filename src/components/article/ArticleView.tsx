import Link from "next/link";
import type { ReactNode } from "react";
import { Img } from "@/components/ui/Img";
import { formatArticleDate } from "@/lib/article-doc";
import type { DocNode } from "@/types/article";
import { ArticleBody } from "./ArticleBody";
import { ReaderShell } from "./ReaderShell";
import { ShareButtons } from "./ShareButtons";

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
  // The clean address of the article on the main domain. null = the share buttons use the address in the browser.
  shareUrl?: string | null;
  // Shown under the reading column: the series card and More from.
  after?: ReactNode;
};

// One clean page: a single reading column. The reader can change font, size, alignment and width.
export function ArticleView({
  title,
  subtitle,
  publishedAt,
  minutes,
  cover,
  doc,
  back,
  backLabel,
  author,
  tags,
  shareUrl,
  after,
}: Props) {
  const meta = [formatArticleDate(publishedAt), `${minutes} min read`].filter(Boolean).join(" · ");
  return (
    <>
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
        <div className="mt-10 border-t border-line pt-6">
          <ShareButtons url={shareUrl ?? null} title={title} />
        </div>
      </ReaderShell>
      {after}
    </>
  );
}