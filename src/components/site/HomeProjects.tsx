import Link from "next/link";
import type {
  DesignFont,
  DesignIntroSize,
  DesignMode,
  DesignTitleAlign,
  DesignTitleSize,
  ProjectView,
  ProjectWideView,
  StackRatio,
} from "@/config/layout";
import type { Block } from "@/types/block";
import { DesignHeading } from "./DesignHeading";
import { ProjectList } from "./ProjectList";
import { ProjectsWide } from "./ProjectsWide";
import { Reveal } from "./Reveal";

type Props = {
  items: Block[];
  title: string;
  // Address of the Projects page. Left out = no "See all" link.
  seeAll?: string;
  // Chosen in Customize (Sections, Projects). Left out = the original: Centered, List.
  view?: ProjectView;
  // Height of each photo in rem. 0 = the shape of each photo, as before.
  mediaHeight?: number;
  // The slider layouts slide by themselves with these.
  slide?: { seconds: number; autoplay: boolean };
  mode?: DesignMode;
  wideView?: ProjectWideView;
  // The photo of the Stack layouts: its ratio and the crop position (0 top to 100 bottom).
  stackRatio?: StackRatio;
  stackCrop?: number;
  // The text under the title (written in Pages) and the look of the title and of that text (Customize).
  intro?: string | null;
  titleAlign?: DesignTitleAlign;
  titleFont?: DesignFont;
  titleSize?: DesignTitleSize;
  introFont?: DesignFont;
  introSize?: DesignIntroSize;
};

// The projects you picked for Home ("Also show on Home").
// Centered = inside the page margins (List, Grid, Slider). Full width = edge to edge (ProjectsWide).
// Centered + the original title = exactly the look from before.
export function HomeProjects({
  items,
  title,
  seeAll,
  view = "list",
  mediaHeight = 0,
  slide,
  mode = "centered",
  wideView = "stack",
  stackRatio = "default",
  stackCrop = 50,
  intro = null,
  titleAlign = "center",
  titleFont = "default",
  titleSize = "auto",
  introFont = "default",
  introSize = "auto",
}: Props) {
  if (items.length === 0) return null;
  const wide = mode === "full";
  const custom = titleAlign !== "center" || titleFont !== "default" || titleSize !== "auto" || Boolean(intro);
  const seeAllClass =
    "font-mono text-xs uppercase tracking-widest underline decoration-accent decoration-1 underline-offset-4 transition-colors duration-(--dur-base) hover:text-accent";

  if (!wide && !custom) {
    return (
      <section id="projects" aria-label={title} className="site-pt">
        <div className="mx-auto flex max-w-5xl items-end justify-between gap-4 px-5 pb-8 sm:px-8">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
          </Reveal>
          {seeAll && (
            <Link href={seeAll} className={seeAllClass}>
              See all →
            </Link>
          )}
        </div>
        <ProjectList blocks={items} mode="home" view={view} mediaHeight={mediaHeight} slide={slide} />
      </section>
    );
  }

  const run = slide ?? { seconds: 5, autoplay: true };
  return (
    <section id="projects" aria-label={title} className="site-pt">
      <DesignHeading
        title={title}
        href={null}
        intro={intro}
        align={titleAlign}
        font={titleFont}
        size={titleSize}
        introFont={introFont}
        introSize={introSize}
      />
      {seeAll && (
        <div className={`-mt-4 px-5 pb-6 text-right sm:px-8 ${wide ? "" : "mx-auto max-w-5xl"}`}>
          <Link href={seeAll} className={seeAllClass}>
            See all →
          </Link>
        </div>
      )}
      {wide ? (
        <div className="site-pb">
          <ProjectsWide
            view={wideView}
            blocks={items}
            height={mediaHeight}
            slide={run}
            ratio={stackRatio}
            crop={stackCrop}
          />
        </div>
      ) : (
        <ProjectList blocks={items} mode="home" view={view} mediaHeight={mediaHeight} slide={slide} />
      )}
    </section>
  );
}