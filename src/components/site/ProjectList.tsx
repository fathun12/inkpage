import type { ProjectView } from "@/config/layout";
import type { Block } from "@/types/block";
import { MediaSlider } from "./MediaSlider";
import { ProjectCard } from "./ProjectCard";

type Props = {
  blocks: Block[];
  mode: "home" | "page";
  slide?: { seconds: number; autoplay: boolean };
  // Home only (chosen in Customize): list, grid or slider. The Projects page is always a list.
  view?: ProjectView;
  // Home only: height of each photo in rem. 0 = the shape of each photo.
  mediaHeight?: number;
};

// The list of projects on Home and on the Projects page. Same card in both places.
// data-project-mode lets the "Projects size" setting (site.css) apply on Home only.
export function ProjectList({ blocks, mode, slide, view = "list", mediaHeight = 0 }: Props) {
  const items = blocks.filter((b) => b.type !== "header");
  if (items.length === 0) return null;
  const shape = mode === "home" ? view : "list";
  const height = mode === "home" ? mediaHeight : 0;

  if (shape === "grid") {
    return (
      <ul
        data-project-mode={mode}
        className="mx-auto grid max-w-5xl gap-x-8 gap-y-14 px-5 pt-4 sm:grid-cols-2 sm:px-8 site-pb"
      >
        {items.map((block, index) => (
          <li key={block.id}>
            <ProjectCard
              block={block}
              mode={mode}
              stacked
              first={index === 0}
              index={index}
              total={items.length}
              mediaHeight={height}
            />
          </li>
        ))}
      </ul>
    );
  }

  if (shape === "slider") {
    const run = slide ?? { seconds: 5, autoplay: true };
    return (
      <div data-project-mode={mode} className="mx-auto max-w-5xl px-5 pt-4 sm:px-8 site-pb">
        <MediaSlider count={items.length} seconds={run.seconds} autoplay={run.autoplay}>
          {items.map((block, index) => (
            <li key={block.id} className="w-full shrink-0 snap-start">
              <ProjectCard
                block={block}
                mode={mode}
                first={index === 0}
                index={index}
                total={items.length}
                mediaHeight={height}
              />
            </li>
          ))}
        </MediaSlider>
      </div>
    );
  }

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
          <ProjectCard
            block={block}
            mode={mode}
            first={index === 0}
            index={index}
            total={items.length}
            slide={slide}
            mediaHeight={height}
          />
        </li>
      ))}
    </ul>
  );
}