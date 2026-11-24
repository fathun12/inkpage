import type { VisitItem } from "@/config/site-content";
import { Reveal } from "./Reveal";

const button =
  "inline-flex items-center gap-2 border border-ink px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors duration-(--dur-base) hover:bg-ink hover:text-bg";

// The "Visit website" section of Home: cards that point to your other websites (itch.io, Patreon, pixiv).
// Nothing is sold here. Each card is a name, a short text and a Visit button that opens a new tab.
export function VisitCards({ items, title }: { items: VisitItem[]; title: string }) {
  if (items.length === 0) return null;
  return (
    <section id="visit" aria-label={title} className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-5xl px-5 pb-8 sm:px-8">
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
        </Reveal>
      </div>
      <ul className="mx-auto grid max-w-5xl gap-x-8 gap-y-10 px-5 pb-16 sm:grid-cols-2 sm:px-8 sm:pb-24 lg:grid-cols-3">
        {items.map((item, i) => (
          <li key={`${item.url}-${i}`} className="border-t border-line pt-6">
            <Reveal variant="still" className="flex h-full flex-col items-start">
              <h3 className="font-display text-2xl leading-tight">{item.name}</h3>
              {item.body && <p className="mt-3 max-w-md whitespace-pre-line text-sm text-ink-soft">{item.body}</p>}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${item.name}`}
                className={`${button} mt-6`}
              >
                <span>Visit</span>
                <span aria-hidden>↗</span>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}