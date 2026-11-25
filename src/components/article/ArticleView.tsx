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
};

// One clean page: a single reading column. The reader can change font, size, alignment and width.
export function ArticleView({ title, subtitle, publishedAt, minutes, cover, doc, back, backLabel }: Props) {
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
      meta={<p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{meta}</p>}
    >
      {cover && <Img src={cover} className="mt-8 aspect-2/1 w-full bg-surface object-cover" />}
      <div className="mt-10">
        <ArticleBody doc={doc} />
      </div>
    </ReaderShell>
  );
}