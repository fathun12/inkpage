import { routes } from "@/config/site";
import { socialLabel } from "@/lib/social";
import { socialGlyph } from "@/lib/social-icons";
import type { Block } from "@/types/block";

export function SocialsBlock({ block }: { block: Block }) {
  const items = block.data.items ?? [];
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">{block.title}</p>
      <ul className="flex flex-wrap justify-center gap-3">
        {items.map((item, index) => {
          const glyph = socialGlyph(item.url);
          const label = socialLabel(item.url);
          return (
            <li key={item.url}>
              <a
                href={`${routes.go(block.id)}?i=${index}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className={
                  glyph
                    ? "ink-border press flex size-11 items-center justify-center rounded-full bg-surface text-ink"
                    : "ink-border press block rounded-md bg-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest"
                }
              >
                {glyph ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-5 fill-current">
                    <path d={glyph.path} fillRule={glyph.evenodd ? "evenodd" : "nonzero"} />
                  </svg>
                ) : (
                  label
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}