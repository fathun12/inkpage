import type { Block } from "@/types/block";
import { ItemCard } from "./ItemCard";
import { Reveal } from "./Reveal";

// The items on the Projects and Writing pages.
export function ItemGrid({ blocks }: { blocks: Block[] }) {
  const items = blocks.filter((b) => b.type !== "header");
  return (
    <ul className="mx-auto grid max-w-5xl gap-x-8 gap-y-14 px-5 pb-24 pt-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
      {items.map((block, index) => (
        <li key={block.id}>
          <Reveal delay={Math.min(index, 8) * 70}>
            <ItemCard block={block} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}