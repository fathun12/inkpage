import type { Highlight } from "@/config/site-content";
import { creditOf, mediaKind } from "@/lib/site-view";
import { Downloads, downloadLinks } from "./Downloads";
import { HighlightMedia } from "./HighlightMedia";
import { Reveal } from "./Reveal";

type Props = { items: Highlight[]; title: string | null; credits: Record<string, string> };

// Up to 5 projects: several media on one side, text and download links on the other (they swap sides).
// Background is the page color.
export function Highlights({ items, title, credits }: Props) {
  if (items.length === 0) return null;

  return (
    <section id="highlights" aria-label={title ?? "Highlights"}>
      {title && (
        <div className="mx-auto max-w-6xl px-5 pb-8 pt-16 sm:px-8 sm:pt-24">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
          </Reveal>
        </div>
      )}
      <ul>
        {items.map((item, index) => {
          const flip = index % 2 === 1;
          const hasMedia = item.media.length > 0;
          const links = downloadLinks(item.nexus, item.github);
          return (
            <li key={`${item.media[0] ?? item.title ?? "item"}-${index}`} className="grid md:grid-cols-2">
              {hasMedia && (
                <div
                  className={`relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-[34rem] ${flip ? "md:order-2" : ""}`}
                >
                  <Reveal variant="still" className="absolute inset-0">
                    <HighlightMedia
                      items={item.media.map((src) => ({
                        src,
                        kind: mediaKind(src),
                        credit: creditOf(credits, src),
                      }))}
                    />
                  </Reveal>
                </div>
              )}
              {(item.title || item.body || links.length > 0) && (
                <div
                  className={`flex items-center px-5 py-14 sm:px-12 md:py-20 ${hasMedia ? "" : "md:col-span-2"}`}
                >
                  <Reveal>
                    {item.title && <h3 className="font-display text-4xl leading-[1.05] sm:text-6xl">{item.title}</h3>}
                    {item.body && <p className="mt-6 max-w-md whitespace-pre-line text-ink-soft">{item.body}</p>}
                    <Downloads links={links} className="mt-8" />
                  </Reveal>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}