import type { CSSProperties } from "react";
import { Img } from "@/components/ui/Img";
import type { DesignSize } from "@/config/layout";
import type { DesignProject } from "@/types/designs";
import { DesignStrip } from "./DesignStrip";

const kindLabel = { house: "House", furniture: "Furniture" } as const;

// Row layout (List and Slider): photos on the left, text on the right. Size sets the columns and the title.
const rowGrid: Record<DesignSize, string> = {
  large: "md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
  medium: "md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]",
  small: "md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)]",
};
const rowTitle: Record<DesignSize, string> = {
  large: "text-3xl sm:text-5xl",
  medium: "text-2xl sm:text-4xl",
  small: "text-xl sm:text-3xl",
};

// One project: the cover, up to 3 documentation photos under it, then the title. It opens the project
// on House Showcase in a new tab. "stacked" = everything in one column (the Grid, the original).
// "row" = photos on the left, text on the right. coverHeight in rem (0 = the 4:3 shape).
export function DesignCard({
  project,
  seconds,
  autoplay,
  offset,
  layout = "stacked",
  size = "large",
  coverHeight = 0,
}: {
  project: DesignProject;
  seconds: number;
  autoplay: boolean;
  offset: number;
  layout?: "stacked" | "row";
  size?: DesignSize;
  coverHeight?: number;
}) {
  const row = layout === "row";
  const tall = coverHeight > 0;
  const frame: CSSProperties | undefined = tall ? { height: `${coverHeight}rem` } : undefined;

  const cover = (
    <span className="site-media-pop block">
      <span
        className="relative block overflow-hidden transition-transform duration-(--dur-base) group-hover:-translate-y-1"
        style={frame}
      >
        {project.cover ? (
          <Img
            src={project.cover}
            alt={`Cover of ${project.title}`}
            className={tall ? "size-full object-cover" : "aspect-[4/3] w-full object-cover"}
          />
        ) : (
          <span
            className={`flex items-end bg-surface p-3 font-display text-xl leading-tight ${
              tall ? "h-full w-full" : "aspect-[4/3] w-full"
            }`}
          >
            {project.title}
          </span>
        )}
        <span className="absolute left-2 top-2 bg-bg px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink">
          {kindLabel[project.kind]}
        </span>
      </span>
    </span>
  );

  const strip = (
    <span className="site-media-pop block" style={{ "--pop-delay": "120ms" } as CSSProperties}>
      <DesignStrip
        photos={project.photos}
        alt={`Documentation of ${project.title}`}
        seconds={seconds}
        autoplay={autoplay}
        offset={offset}
      />
    </span>
  );

  const text = (
    <>
      <span
        className={
          row
            ? `block font-display leading-tight underline-offset-4 group-hover:underline ${rowTitle[size]}`
            : "mt-3 block font-display text-lg leading-tight underline-offset-4 group-hover:underline"
        }
      >
        {project.title}
      </span>
      {project.tagline && (
        <span
          className={
            row ? "mt-4 block max-w-xl text-ink-soft" : "mt-1 block line-clamp-2 text-sm text-ink-soft"
          }
        >
          {project.tagline}
        </span>
      )}
    </>
  );

  if (!row) {
    return (
      <a href={project.href} target="_blank" rel="noopener noreferrer" className="group block">
        {cover}
        {strip}
        {text}
      </a>
    );
  }

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group grid gap-6 md:gap-10 ${rowGrid[size]}`}
    >
      <span className="block">
        {cover}
        {strip}
      </span>
      <span className="block">{text}</span>
    </a>
  );
}