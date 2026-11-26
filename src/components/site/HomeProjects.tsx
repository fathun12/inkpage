import type { ProjectView } from "@/config/layout";
import type { Block } from "@/types/block";
import { ProjectList } from "./ProjectList";
import { Reveal } from "./Reveal";

type Props = {
  items: Block[];
  title: string;
  // Chosen in Customize (Layout). Left out = the original list.
  view?: ProjectView;
  // Height of each photo in rem. 0 = the shape of each photo, as before.
  mediaHeight?: number;
  // The slider layout slides by itself with these.
  slide?: { seconds: number; autoplay: boolean };
};

// The projects you picked for Home ("Also show on Home"): a list, a grid or a slider.
export function HomeProjects({ items, title, view = "list", mediaHeight = 0, slide }: Props) {
  if (items.length === 0) return null;
  return (
    <section id="projects" aria-label={title} className="site-pt">
      <div className="mx-auto max-w-5xl px-5 pb-8 sm:px-8">
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
        </Reveal>
      </div>
      <ProjectList blocks={items} mode="home" view={view} mediaHeight={mediaHeight} slide={slide} />
    </section>
  );
}