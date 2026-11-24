import { Img } from "@/components/ui/Img";
import { routes } from "@/config/site";
import { readWritingItem } from "@/lib/item-data";
import type { Block } from "@/types/block";
import { Reveal } from "./Reveal";

// All writing as a blog style list: image, title, short text, source. Newest first (the caller sorts).
export function WritingList({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) return null;
  return (
    <ul className="mx-auto flex max-w-5xl flex-col px-5 pb-24 pt-4 sm:px-8">
      {blocks.map((block, index) => {
        const item = readWritingItem(block);
        const row = (
          <span className={`grid gap-6 py-8 ${item.image ? "sm:grid-cols-[13rem_minmax(0,1fr)]" : ""}`}>
            {item.image && <Img src={item.image} className="aspect-[16/10] w-full object-cover" />}
            <span className="flex min-w-0 flex-col justify-center">
              {item.source && (
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{item.source}</span>
              )}
              <span className="mt-1 block font-display text-2xl leading-tight sm:text-3xl">{item.title}</span>
              {item.body && <span className="mt-2 block max-w-xl text-sm text-ink-soft">{item.body}</span>}
            </span>
          </span>
        );
        return (
          <li key={block.id} className="border-t border-line first:border-t-0">
            <Reveal delay={Math.min(index, 6) * 60}>
              {item.url ? (
                <a href={routes.go(block.id)} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80">
                  {row}
                </a>
              ) : (
                row
              )}
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}