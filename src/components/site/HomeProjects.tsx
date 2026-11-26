import Link from "next/link";
import type { ProjectView } from "@/config/layout";
import type { Block } from "@/types/block";
import { ProjectList } from "./ProjectList";
import { Reveal } from "./Reveal";

type Props = {
  items: Block[];
  title: string;
  // Address of the Projects page. Left out = no "See all" link.
  seeAll?: string;
  // Chosen in Customize (Layout). Left out = the original list.
  view?: ProjectView;
  // Height of each photo in rem. 0 = the shape of each photo, as before.
  mediaHeight?: number;
  // The slider layout slides by itself with these.
  slide?: { seconds: number; autoplay: boolean };
};

// The projects you picked for Home ("Also show on Home"): a list, a grid or a slider,
// with a link to the Projects page on the right of the title.
export function HomeProjects({ items, title, seeAll, view = "list", mediaHeight = 0, slide }: Props) {
  if (items.length === 0) return null;
  return (
    <section id="projects" aria-label={title} className="site-pt">
      <div className="mx-auto flex max-w-5xl items-end justify-between gap-4 px-5 pb-8 sm:px-8">
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
        </Reveal>
        {seeAll && (
          <Link
            href={seeAll}
            className="font-mono text-xs uppercase tracking-widest underline decoration-accent decoration-1 underline-offset-4 transition-colors duration-(--dur-base) hover:text-accent"
          >
            See all →
          </Link>
        )}
      </div>
      <ProjectList blocks={items} mode="home" view={view} mediaHeight={mediaHeight} slide={slide} />
    </section>
  );
}