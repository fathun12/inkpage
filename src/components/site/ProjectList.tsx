import type { Block } from "@/types/block";
import { ProjectCard } from "./ProjectCard";

// The list of projects on Home and on the Projects page. Same card in both places.
export function ProjectList({ blocks, mode }: { blocks: Block[]; mode: "home" | "page" }) {
  const items = blocks.filter((b) => b.type !== "header");
  if (items.length === 0) return null;
  return (
    <ul className="mx-auto flex max-w-5xl flex-col px-5 pb-16 pt-4 sm:px-8 sm:pb-24">
      {items.map((block, index) => (
        <li
          key={block.id}
          className={index < items.length - 1 ? "mb-14 border-b border-tertiary pb-14 sm:mb-22 sm:pb-22" : undefined}
        >
          <ProjectCard block={block} mode={mode} first={index === 0} index={index} total={items.length} />
        </li>
      ))}
    </ul>
  );
}