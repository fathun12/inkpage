import type { DesignMode, DesignSize, DesignView, DesignWideView } from "@/config/layout";
import type { DesignsData } from "@/types/designs";
import { DesignCard } from "./DesignCard";
import { DesignWide } from "./DesignWide";
import { MediaSlider } from "./MediaSlider";
import { Reveal } from "./Reveal";

// Cards per row in the Grid layout. Large is the original look.
const gridColumns: Record<DesignSize, string> = {
  large: "sm:grid-cols-2 lg:grid-cols-3",
  medium: "sm:grid-cols-2 lg:grid-cols-4",
  small: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
};

type Props = {
  data: DesignsData;
  title: string;
  href: string | null;
  seconds: number;
  autoplay: boolean;
  // Chosen in Customize (Sections, Design projects). Left out = the original centered grid.
  mode?: DesignMode;
  view?: DesignView;
  wideView?: DesignWideView;
  size?: DesignSize;
  // Height of each cover in rem. 0 = the shape that suits the layout.
  mediaHeight?: number;
  // The slider layouts slide by themselves with these.
  slide?: { seconds: number; autoplay: boolean };
};

// The design projects section of Home: random projects from House Showcase. It only appears when that site answered.
// Centered = inside the page margins (Grid, List, Slider). Full width = edge to edge (DesignWide).
export function HomeDesigns({
  data,
  title,
  href,
  seconds,
  autoplay,
  mode = "centered",
  view = "grid",
  wideView = "stack",
  size = "large",
  mediaHeight = 0,
  slide,
}: Props) {
  if (data.projects.length === 0) return null;
  const run = slide ?? { seconds: 5, autoplay: true };
  const last = data.projects.length - 1;
  const wide = mode === "full";
  return (
    <section id="designs" aria-label={title} className="site-pt">
      <div
        className={`flex items-end justify-between gap-4 px-5 pb-8 sm:px-8 ${wide ? "" : "mx-auto max-w-5xl"}`}
      >
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
        </Reveal>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest underline decoration-accent decoration-1 underline-offset-4 transition-colors duration-(--dur-base) hover:text-accent"
          >
            Visit website ↗
          </a>
        )}
      </div>

      {wide && (
        <div className="site-pb">
          <DesignWide view={wideView} projects={data.projects} height={mediaHeight} slide={run} />
        </div>
      )}

      {!wide && view === "grid" && (
        <ul className={`mx-auto grid max-w-5xl gap-x-5 gap-y-12 px-5 sm:px-8 site-pb ${gridColumns[size]}`}>
          {data.projects.map((project, i) => (
            <li key={project.slug}>
              <Reveal variant="still">
                <DesignCard
                  project={project}
                  seconds={seconds}
                  autoplay={autoplay}
                  offset={i}
                  coverHeight={mediaHeight}
                />
              </Reveal>
            </li>
          ))}
        </ul>
      )}

      {!wide && view === "list" && (
        <ul className="mx-auto flex max-w-5xl flex-col px-5 sm:px-8 site-pb">
          {data.projects.map((project, i) => (
            <li
              key={project.slug}
              className={i < last ? "mb-14 border-b border-tertiary pb-14 sm:mb-22 sm:pb-22" : undefined}
            >
              <Reveal variant="still">
                <DesignCard
                  project={project}
                  seconds={seconds}
                  autoplay={autoplay}
                  offset={i}
                  layout="row"
                  size={size}
                  coverHeight={mediaHeight}
                />
              </Reveal>
            </li>
          ))}
        </ul>
      )}

      {!wide && view === "slider" && (
        <div className="mx-auto max-w-5xl px-5 sm:px-8 site-pb">
          <MediaSlider count={data.projects.length} seconds={run.seconds} autoplay={run.autoplay}>
            {data.projects.map((project, i) => (
              <li key={project.slug} className="w-full shrink-0 snap-start">
                <Reveal variant="still">
                  <DesignCard
                    project={project}
                    seconds={seconds}
                    autoplay={autoplay}
                    offset={i}
                    layout="row"
                    size={size}
                    coverHeight={mediaHeight}
                  />
                </Reveal>
              </li>
            ))}
          </MediaSlider>
        </div>
      )}
    </section>
  );
}