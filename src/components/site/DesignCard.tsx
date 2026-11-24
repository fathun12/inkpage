import { Img } from "@/components/ui/Img";
import type { DesignProject } from "@/types/designs";
import { DesignStrip } from "./DesignStrip";

const kindLabel = { house: "House", furniture: "Furniture" } as const;

// One project: the cover, up to 3 documentation photos under it, then the title. It opens the project
// on House Showcase in a new tab.
export function DesignCard({
  project,
  seconds,
  autoplay,
  offset,
}: {
  project: DesignProject;
  seconds: number;
  autoplay: boolean;
  offset: number;
}) {
  return (
    <a href={project.href} target="_blank" rel="noopener noreferrer" className="group block">
      <span className="relative block overflow-hidden transition-transform duration-(--dur-base) group-hover:-translate-y-1">
        {project.cover ? (
          <Img
            src={project.cover}
            alt={`Cover of ${project.title}`}
            className="site-media-reveal aspect-[4/3] w-full object-cover"
          />
        ) : (
          <span className="flex aspect-[4/3] w-full items-end bg-surface p-3 font-display text-xl leading-tight">
            {project.title}
          </span>
        )}
        <span className="absolute left-2 top-2 bg-bg px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink">
          {kindLabel[project.kind]}
        </span>
      </span>
      <DesignStrip
        photos={project.photos}
        alt={`Documentation of ${project.title}`}
        seconds={seconds}
        autoplay={autoplay}
        offset={offset}
      />
      <span className="mt-3 block font-display text-lg leading-tight underline-offset-4 group-hover:underline">
        {project.title}
      </span>
      {project.tagline && <span className="mt-1 block line-clamp-2 text-sm text-ink-soft">{project.tagline}</span>}
    </a>
  );
}