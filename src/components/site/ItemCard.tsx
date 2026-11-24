import { Img } from "@/components/ui/Img";
import { routes } from "@/config/site";
import type { Block } from "@/types/block";
import { readProjectItem } from "@/lib/item-data";
import { Downloads, TextLinks } from "./Downloads";

// One item of Projects or Writing. Its look follows data.shape: card, button or text link.
// The main part goes through /go (the click is counted). Download links go straight out.
export function ItemCard({ block }: { block: Block }) {
  const item = readProjectItem(block);
  const shape = block.data.shape ?? "card";
  const arrow = (
    <span
      aria-hidden
      className="font-display text-xl transition-transform duration-(--dur-base) group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
    >
      ↗
    </span>
  );

  const main =
    shape === "button" ? (
      <span className="flex items-center justify-between gap-4 border border-ink px-4 py-3 transition-colors duration-(--dur-base) group-hover:bg-ink group-hover:text-bg">
        <span className="font-mono text-xs uppercase tracking-widest">{block.title}</span>
        {arrow}
      </span>
    ) : shape === "text" ? (
      <>
        <span className="font-display text-3xl leading-tight underline decoration-accent decoration-1 underline-offset-4 sm:text-4xl">
          {block.title}
        </span>
        {block.body && <span className="mt-2 block text-sm text-ink-soft">{block.body}</span>}
      </>
    ) : (
      <>
        {block.image_url && <Img src={block.image_url} className="mb-4 aspect-[16/10] w-full object-cover" />}
        <span className="flex items-start justify-between gap-4">
          <span className="font-display text-2xl leading-tight">{block.title}</span>
          {arrow}
        </span>
        {block.body && <span className="mt-2 line-clamp-3 text-sm text-ink-soft">{block.body}</span>}
      </>
    );

  return (
    <div className="flex h-full flex-col">
      {block.url ? (
        <a href={routes.go(block.id)} className="group block">
          {main}
        </a>
      ) : (
        <div className="block">{main}</div>
      )}
      <Downloads links={item.downloads} className="mt-4" />
      <TextLinks links={item.links} className="mt-3" />
    </div>
  );
}