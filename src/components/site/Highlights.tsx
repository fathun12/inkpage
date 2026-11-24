import { Img } from "@/components/ui/Img";
import type { Highlight } from "@/config/site-content";
import { creditOf, mediaKind } from "@/lib/site-view";
import { Credit } from "./Credit";
import { Reveal } from "./Reveal";

type Props = { items: Highlight[]; title: string | null; credits: Record<string, string> };

// Up to 5 projects: media on one side, text on the other (they swap sides). Background is the page color.
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
          return (
            <li key={`${item.media ?? item.title ?? "item"}-${index}`} className="grid md:grid-cols-2">
              {item.media && (
                <div
                  className={`relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-[34rem] ${flip ? "md:order-2" : ""}`}
                >
                  <Reveal variant="still" className="absolute inset-0">
                    {mediaKind(item.media) === "video" ? (
                      <video
                        src={item.media}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-hidden
                        className="site-media-reveal size-full object-cover"
                      />
                    ) : (
                      <Img src={item.media} className="site-media-reveal size-full object-cover" />
                    )}
                  </Reveal>
                  <Credit text={creditOf(credits, item.media)} />
                </div>
              )}
              {(item.title || item.body) && (
                <div
                  className={`flex items-center px-5 py-14 sm:px-12 md:py-20 ${item.media ? "" : "md:col-span-2"}`}
                >
                  <Reveal>
                    {item.title && <h3 className="font-display text-4xl leading-[1.05] sm:text-6xl">{item.title}</h3>}
                    {item.body && <p className="mt-6 max-w-md whitespace-pre-line text-ink-soft">{item.body}</p>}
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