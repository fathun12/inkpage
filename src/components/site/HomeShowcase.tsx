import type { Block } from "@/types/block";
import { Reveal } from "./Reveal";
import { ShowcaseCard } from "./ShowcaseCard";

// The detailed section of Home: projects ticked "Show as Showcase". It only appears when there is one.
export function HomeShowcase({ items, title }: { items: Block[]; title: string }) {
  if (items.length === 0) return null;
  return (
    <section id="showcase" aria-label={title} className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-5xl px-5 pb-8 sm:px-8">
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
        </Reveal>
      </div>
      <ul className="mx-auto flex max-w-5xl flex-col gap-24 px-5 pb-16 pt-4 sm:gap-32 sm:px-8 sm:pb-24">
        {items.map((block, index) => (
          <li key={block.id}>
            <ShowcaseCard block={block} first={index === 0} />
          </li>
        ))}
      </ul>
    </section>
  );
}