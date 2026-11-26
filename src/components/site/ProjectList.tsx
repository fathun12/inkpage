import type { Block } from "@/types/block";
import { ProjectCard } from "./ProjectCard";

// The list of projects on Home and on the Projects page. Same card in both places.
// data-project-mode lets the "Projects size" setting (site.css) apply on Home only.
export function ProjectList({
  blocks,
  mode,
  slide,
}: {
  blocks: Block[];
  mode: "home" | "page";
  slide?: { seconds: number; autoplay: boolean };
}) {
  const items = blocks.filter((b) => b.type !== "header");
  if (items.length === 0) return null;
  return (
    <ul data-project-mode={mode} className="mx-auto flex max-w-5xl flex-col px-5 pt-4 sm:px-8 site-pb">
      {items.map((block, index) => (
        <li
          key={block.id}
          className={
            index < items.length - 1
              ? "site-proj-item mb-14 border-b border-tertiary pb-14 sm:mb-22 sm:pb-22"
              : undefined
          }
        >
          <ProjectCard block={block} mode={mode} first={index === 0} index={index} total={items.length} slide={slide} />
        </li>
      ))}
    </ul>
  );
}