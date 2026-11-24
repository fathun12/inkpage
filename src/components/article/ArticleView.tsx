import Link from "next/link";
import { formatArticleDate } from "@/lib/article-doc";
import type { DocNode } from "@/types/article";
import { ArticleBody } from "./ArticleBody";

type Props = {
  title: string;
  subtitle: string | null;
  publishedAt: string | null;
  minutes: number;
  doc: DocNode;
  back: string;
  backLabel: string;
};

// One clean page: a single reading column, nothing else.
export function ArticleView({ title, subtitle, publishedAt, minutes, doc, back, backLabel }: Props) {
  const meta = [formatArticleDate(publishedAt), `${minutes} min read`].filter(Boolean).join(" · ");
  return (
    <article className="mx-auto w-full max-w-[42rem] px-5 pb-24 pt-10 sm:px-8">
      <Link href={back} className="font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink">
        &larr; {backLabel}
      </Link>
      <h1 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-3 text-xl text-ink-soft">{subtitle}</p>}
      <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-ink-soft">{meta}</p>
      <div className="mt-10">
        <ArticleBody doc={doc} />
      </div>
    </article>
  );
}