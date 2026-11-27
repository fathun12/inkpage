import Link from "next/link";
import { Img } from "@/components/ui/Img";
import { routes } from "@/config/site";
import { storageImage } from "@/lib/image-srcset";
import type { SeriesCardData } from "@/lib/series-view";
import { Reveal } from "./Reveal";

type Props = { cards: SeriesCardData[]; username: string };

// Series cards drawn as a small stack of paper: two thin sheets sit behind the front card and open a little on hover.
export function SeriesStack({ cards, username }: Props) {
  if (cards.length === 0) return null;
  return (
    <section aria-label="Series" className="mx-auto max-w-5xl px-5 pt-4 pb-6 sm:px-8">
      <h2 className="font-mono text-[11px] font-normal uppercase tracking-widest text-ink-soft">Series</h2>
      <ul className="mt-5 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ series, parts, cover }, index) => (
          <li key={series.id}>
            <Reveal delay={Math.min(index, 6) * 60}>
              <Link href={routes.seriesPage(username, series.slug)} className="group relative block pr-4 pb-4">
                <span
                  aria-hidden
                  className="absolute top-0 right-4 bottom-4 left-0 translate-x-3 translate-y-3 border border-line bg-bg transition-transform duration-(--dur-base) group-hover:translate-x-4 group-hover:translate-y-4 motion-reduce:transition-none"
                />
                <span
                  aria-hidden
                  className="absolute top-0 right-4 bottom-4 left-0 translate-x-1.5 translate-y-1.5 border border-line bg-bg transition-transform duration-(--dur-base) group-hover:translate-x-2 group-hover:translate-y-2 motion-reduce:transition-none"
                />
                <span className="relative block border border-line bg-bg">
                  {cover && (
                    <Img
                      src={cover}
                      {...storageImage(cover, "(min-width: 1024px) 20rem, (min-width: 640px) 45vw, calc(100vw - 3.5rem)")}
                      className="aspect-2/1 w-full bg-surface object-cover"
                    />
                  )}
                  <span className="block p-4">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                      Series · {parts.length} {parts.length === 1 ? "part" : "parts"}
                    </span>
                    <span className="mt-1 block font-display text-2xl leading-tight">{series.title}</span>
                    {series.description && (
                      <span className="mt-2 line-clamp-2 block text-sm text-ink-soft">{series.description}</span>
                    )}
                  </span>
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}