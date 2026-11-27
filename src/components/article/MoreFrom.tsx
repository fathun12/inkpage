import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { Img } from "@/components/ui/Img";
import { routes } from "@/config/site";
import { formatArticleDate } from "@/lib/article-doc";
import { storageImage } from "@/lib/image-srcset";
import type { MoreItem } from "@/lib/more-from";

type Props = { items: MoreItem[]; username: string; name: string };

// The end of an article page: up to three more articles (related, popular, latest).
export function MoreFrom({ items, username, name }: Props) {
  if (items.length === 0) return null;
  return (
    <section aria-label={`More from ${name}`} className="mx-auto max-w-5xl px-5 pt-6 sm:px-8 site-pb-m">
      <h2 className="border-t border-line pt-6 font-mono text-[11px] font-normal uppercase tracking-widest text-ink-soft">
        More from {name}
      </h2>
      <ul className="mt-6 grid items-start gap-x-8 gap-y-10 sm:grid-cols-3">
        {items.map(({ label, article }, index) => (
          <li key={article.id}>
            <Reveal delay={index * 60}>
              <Link href={routes.article(username, article.slug ?? "")} className="block hover:opacity-80">
                {article.cover_url && (
                  <Img
                    src={article.cover_url}
                    {...storageImage(article.cover_url, "(min-width: 640px) 20rem, calc(100vw - 2.5rem)")}
                    className="mb-4 aspect-2/1 w-full bg-surface object-cover"
                  />
                )}
                <span className="block font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                  {label} · {formatArticleDate(article.published_at)}
                </span>
                <span className="mt-1 block font-display text-xl leading-tight">{article.title}</span>
                <span className="mt-1 block font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                  {article.reading_minutes} min read
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}