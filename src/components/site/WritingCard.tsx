import { Img } from "@/components/ui/Img";
import { routes } from "@/config/site";
import { readWritingItem } from "@/lib/item-data";
import type { Block } from "@/types/block";

// One tulisan as a card (the sliders). The click goes through /go (counted) and opens a new tab.
export function WritingCard({ block }: { block: Block }) {
  const item = readWritingItem(block);
  const content = (
    <>
      {item.image && <Img src={item.image} className="mb-4 aspect-[16/10] w-full object-cover" />}
      {item.source && <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{item.source}</span>}
      <span className="mt-1 block font-display text-2xl leading-tight">{item.title}</span>
      {item.body && <span className="mt-2 line-clamp-3 block text-sm text-ink-soft">{item.body}</span>}
    </>
  );
  return item.url ? (
    <a href={routes.go(block.id)} target="_blank" rel="noopener noreferrer" className="group block hover:opacity-80">
      {content}
    </a>
  ) : (
    <div className="block">{content}</div>
  );
}