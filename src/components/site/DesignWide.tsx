import type { CSSProperties } from "react";
import { Img } from "@/components/ui/Img";
import type { DesignWideView } from "@/config/layout";
import type { DesignProject } from "@/types/designs";
import { MediaSlider } from "./MediaSlider";
import { Reveal } from "./Reveal";

const kindLabel = { house: "House", furniture: "Furniture" } as const;
const link = { target: "_blank", rel: "noopener noreferrer" } as const;
const shade: CSSProperties = { background: "linear-gradient(to top, rgb(0 0 0 / 0.62), transparent)" };

// Height of a photo frame: a fixed height in rem, or (0 = Auto) the shape that suits the layout.
function frame(height: number, aspect: string): CSSProperties {
  return height > 0 ? { height: `${height}rem` } : { aspectRatio: aspect };
}

// The big photo of a project. It fills its frame; a project without a cover shows its title instead.
function Cover({ project }: { project: DesignProject }) {
  if (!project.cover) {
    return (
      <span className="absolute inset-0 flex items-end bg-surface p-4 font-display text-2xl leading-tight">
        {project.title}
      </span>
    );
  }
  return (
    <Img
      src={project.cover}
      alt={`Cover of ${project.title}`}
      className="absolute inset-0 size-full object-cover transition-[scale] duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  );
}

// Kind and title over the bottom of a photo. hover = only on hover on a wide screen (always on a phone).
function Overlay({ project, hover }: { project: DesignProject; hover: boolean }) {
  return (
    <span
      className={`absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 text-white transition-opacity duration-(--dur-base) sm:p-5 ${
        hover ? "md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100" : ""
      }`}
      style={shade}
    >
      <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">{kindLabel[project.kind]}</span>
      <span className="font-display text-xl leading-tight sm:text-2xl">{project.title}</span>
    </span>
  );
}

// Kind, title and tagline under a photo. inset = the side space of the page (the photos themselves touch the edges).
function Caption({ project, inset }: { project: DesignProject; inset: boolean }) {
  return (
    <span className={`block pt-3 ${inset ? "px-5 sm:px-8" : ""}`}>
      <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
        {kindLabel[project.kind]}
      </span>
      <span className="mt-1 block font-display text-xl leading-tight underline-offset-4 group-hover:underline sm:text-2xl">
        {project.title}
      </span>
      {project.tagline && (
        <span className="mt-1 block max-w-md line-clamp-2 text-sm text-ink-soft">{project.tagline}</span>
      )}
    </span>
  );
}

type Shape = { projects: DesignProject[]; height: number };

// One project per row: a photo across the whole screen, a tight row of documentation photos, then the title.
function Stack({ projects, height }: Shape) {
  return (
    <ul className="flex flex-col gap-14 sm:gap-24">
      {projects.map((p) => (
        <li key={p.slug}>
          <Reveal variant="still">
            <a href={p.href} {...link} className="group block">
              <span
                className="site-media-pop relative block overflow-hidden bg-surface"
                style={frame(height, "16 / 9")}
              >
                <Cover project={p} />
              </span>
              {p.photos.length > 0 && (
                <span className="mt-px grid grid-cols-2 gap-px sm:grid-cols-4">
                  {p.photos.slice(0, 4).map((src, i) => (
                    <span
                      key={src}
                      className={`site-media-pop relative aspect-[4/3] overflow-hidden bg-surface ${
                        i >= 2 ? "hidden sm:block" : "block"
                      }`}
                      style={{ "--pop-delay": `${(i + 1) * 100}ms` } as CSSProperties}
                    >
                      <Img
                        src={src}
                        alt={`Documentation of ${p.title}`}
                        className="absolute inset-0 size-full object-cover"
                      />
                    </span>
                  ))}
                </span>
              )}
              <span className="mt-4 flex flex-col gap-1 px-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 sm:px-8">
                <span className="block">
                  <span className="mr-3 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                    {kindLabel[p.kind]}
                  </span>
                  <span className="font-display text-2xl leading-tight underline-offset-4 group-hover:underline sm:text-4xl">
                    {p.title}
                  </span>
                </span>
                {p.tagline && (
                  <span className="block max-w-md line-clamp-2 text-sm text-ink-soft sm:text-right">{p.tagline}</span>
                )}
              </span>
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// Two columns edge to edge with tall photos. A last project that stands alone spans both columns.
function Split({ projects, height }: Shape) {
  const last = projects.length - 1;
  return (
    <ul className="grid gap-y-10 sm:grid-cols-2 sm:gap-y-14">
      {projects.map((p, i) => {
        const lone = projects.length % 2 === 1 && i === last;
        return (
          <li key={p.slug} className={lone ? "sm:col-span-2" : undefined}>
            <Reveal variant="still">
              <a href={p.href} {...link} className="group block">
                <span
                  className="site-media-pop relative block overflow-hidden bg-surface"
                  style={frame(height, lone ? "16 / 9" : "4 / 5")}
                >
                  <Cover project={p} />
                </span>
                <Caption project={p} inset />
              </a>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}

const sheetColumns: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3",
  6: "grid-cols-2 sm:grid-cols-3",
};

// Square photos that touch each other, like a contact sheet. The title shows on hover (always on a phone).
function Sheet({ projects, height }: Shape) {
  return (
    <ul className={`grid gap-px ${sheetColumns[Math.min(Math.max(projects.length, 1), 6)]}`}>
      {projects.map((p) => (
        <li key={p.slug} className="min-w-0">
          <Reveal variant="still">
            <a
              href={p.href}
              {...link}
              className="group site-media-pop relative block overflow-hidden bg-surface"
              style={frame(height, "1 / 1")}
            >
              <Cover project={p} />
              <Overlay project={p} hover />
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// How many of the 12 columns each tile takes on a wide screen. Every row adds up to 12.
const mosaicSpans: Record<number, string[]> = {
  1: ["lg:col-span-12"],
  2: ["lg:col-span-7", "lg:col-span-5"],
  3: ["lg:col-span-7", "lg:col-span-5", "lg:col-span-12"],
  4: ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"],
  5: ["lg:col-span-7", "lg:col-span-5", "lg:col-span-4", "lg:col-span-4", "lg:col-span-4"],
  6: ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7", "lg:col-span-6", "lg:col-span-6"],
};

// Photos of different sizes in one tight grid. One column on a phone.
function Mosaic({ projects, height }: Shape) {
  const spans = mosaicSpans[Math.min(Math.max(projects.length, 1), 6)];
  const tile = { "--tile-h": `${height > 0 ? height : 28}rem` } as CSSProperties;
  return (
    <ul className="grid grid-cols-1 gap-px lg:grid-cols-12" style={tile}>
      {projects.map((p, i) => (
        <li key={p.slug} className={`min-w-0 ${spans[i] ?? "lg:col-span-6"}`}>
          <Reveal variant="still">
            <a
              href={p.href}
              {...link}
              className="group site-media-pop relative block aspect-[4/3] overflow-hidden bg-surface lg:aspect-auto lg:h-[var(--tile-h)]"
            >
              <Cover project={p} />
              <Overlay project={p} hover={false} />
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// One row of tall photos that slides sideways, with arrows. It slides by itself.
function Filmstrip({
  projects,
  height,
  slide,
}: Shape & { slide: { seconds: number; autoplay: boolean } }) {
  return (
    <MediaSlider count={projects.length} seconds={slide.seconds} autoplay={slide.autoplay} inset>
      {projects.map((p) => (
        <li key={p.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
          <Reveal variant="still">
            <a href={p.href} {...link} className="group block">
              <span
                className="site-media-pop relative block overflow-hidden bg-surface"
                style={frame(height, "3 / 4")}
              >
                <Cover project={p} />
              </span>
              <Caption project={p} inset={false} />
            </a>
          </Reveal>
        </li>
      ))}
    </MediaSlider>
  );
}

// The Full width forms of the design section (edge to edge, no side space). Chosen in Customize.
export function DesignWide({
  view,
  projects,
  height,
  slide,
}: {
  view: DesignWideView;
  projects: DesignProject[];
  height: number;
  slide: { seconds: number; autoplay: boolean };
}) {
  if (projects.length === 0) return null;
  if (view === "split") return <Split projects={projects} height={height} />;
  if (view === "sheet") return <Sheet projects={projects} height={height} />;
  if (view === "mosaic") return <Mosaic projects={projects} height={height} />;
  if (view === "filmstrip") return <Filmstrip projects={projects} height={height} slide={slide} />;
  return <Stack projects={projects} height={height} />;
}