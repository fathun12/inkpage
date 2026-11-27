import Link from "next/link";
import { Img } from "@/components/ui/Img";
import { routes } from "@/config/site";
import { storageImage } from "@/lib/image-srcset";
import type { SeriesCardData } from "@/lib/series-view";
import { Reveal } from "./Reveal";

type Props = { cards: SeriesCardData[]; username: string };

const SIZES = "(min-width: 1024px) 20rem, (min-width: 640px) 45vw, calc(100vw - 3.5rem)";

// Motion of the stack. Three layers: front (.ss-front), middle (.ss-mid) and back (.ss-back).
// The hover areas (.ss-hit-*) never move, so a card that lifts does not lose the pointer and flicker.
// Tune here: --lift-* is how far each layer rises, --push is how far the other layers are nudged.
// Written without the characters that React escapes in style text.
const css = `
.ss { --lift-f: 0.9rem; --lift-m: 1.6rem; --lift-b: 2.2rem; --push: 0.2rem; }
.ss-sheet { position: absolute; top: 0; right: 1rem; bottom: 1rem; left: 0; overflow: hidden; }
.ss-front { position: relative; display: block; }
.ss-front, .ss-mid, .ss-back { will-change: transform; transition: transform var(--dur-base) var(--ease-out); }
.ss-front { transform: translate(0px, var(--fy, 0px)); }
.ss-mid { transform: translate(var(--mx, 0.375rem), var(--my, 0.375rem)); }
.ss-back { transform: translate(var(--bx, 0.75rem), var(--by, 0.75rem)); }
.ss-hit { position: absolute; z-index: 20; }
.ss-hit-f { top: 0; left: 0; right: 1rem; bottom: 1rem; }
.ss-hit-m-r { top: 0.375rem; right: 0.625rem; width: 0.375rem; bottom: 0.625rem; }
.ss-hit-m-b { left: 0.375rem; right: 0.625rem; bottom: 0.625rem; height: 0.375rem; }
.ss-hit-b-r { top: 0.75rem; right: 0; width: 0.625rem; bottom: 0; }
.ss-hit-b-b { left: 0.75rem; right: 0; bottom: 0; height: 0.625rem; }
.ss:focus-visible { --fy: calc(var(--lift-f) * -1); --mx: calc(0.375rem + var(--push)); --my: calc(0.375rem + var(--push)); --bx: calc(0.75rem + var(--push)); --by: calc(0.75rem + var(--push)); }
@media (hover: hover) {
  .ss:has(.ss-hit-f:hover) { --fy: calc(var(--lift-f) * -1); --mx: calc(0.375rem + var(--push)); --my: calc(0.375rem + var(--push)); --bx: calc(0.75rem + var(--push)); --by: calc(0.75rem + var(--push)); }
  .ss:has(.ss-hit-m-r:hover), .ss:has(.ss-hit-m-b:hover) { --fy: var(--push); --my: calc(0.375rem - var(--lift-m)); --bx: calc(0.75rem + var(--push)); --by: calc(0.75rem + var(--push)); }
  .ss:has(.ss-hit-b-r:hover), .ss:has(.ss-hit-b-b:hover) { --fy: var(--push); --mx: calc(0.375rem + var(--push)); --my: calc(0.375rem + var(--push)); --by: calc(0.75rem - var(--lift-b)); }
}
@media (prefers-reduced-motion: reduce) { .ss-front, .ss-mid, .ss-back { transition: none; } }
[data-motion=off] .ss-front, [data-motion=off] .ss-mid, [data-motion=off] .ss-back { transition: none; }
`;

function SheetImage({ src }: { src: string | undefined }) {
  if (!src) return null;
  return <Img src={src} {...storageImage(src, SIZES)} className="block aspect-2/1 w-full bg-surface object-cover" />;
}

// Series cards drawn as a small stack of paper. The two sheets behind the front card carry the covers of other
// parts of the series (at most three pictures in all). On hover the card under the pointer is lifted out of the stack
// and the other two shift a little.
export function SeriesStack({ cards, username }: Props) {
  if (cards.length === 0) return null;
  return (
    <section aria-label="Series" className="mx-auto max-w-5xl px-5 pt-4 pb-6 sm:px-8">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <h2 className="font-mono text-[11px] font-normal uppercase tracking-widest text-ink-soft">Series</h2>
      <ul className="mt-5 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ series, parts, covers }, index) => (
          <li key={series.id}>
            <Reveal delay={Math.min(index, 6) * 60}>
              <Link href={routes.seriesPage(username, series.slug)} className="ss relative block pr-4 pb-4">
                <span aria-hidden className="ss-sheet ss-back border border-line bg-bg">
                  <SheetImage src={covers[2]} />
                </span>
                <span aria-hidden className="ss-sheet ss-mid border border-line bg-bg">
                  <SheetImage src={covers[1]} />
                </span>
                <span className="ss-front border border-line bg-bg">
                  {covers[0] && (
                    <Img
                      src={covers[0]}
                      {...storageImage(covers[0], SIZES)}
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
                <span aria-hidden className="ss-hit ss-hit-f" />
                <span aria-hidden className="ss-hit ss-hit-m-r" />
                <span aria-hidden className="ss-hit ss-hit-m-b" />
                <span aria-hidden className="ss-hit ss-hit-b-r" />
                <span aria-hidden className="ss-hit ss-hit-b-b" />
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}