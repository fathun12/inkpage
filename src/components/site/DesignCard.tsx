import { Img } from "@/components/ui/Img";
import type { DesignProject } from "@/types/designs";

const kindLabel = { house: "House", furniture: "Furniture" } as const;

// One project: the cover, up to 3 documentation photos under it, then the title. It opens the project
// on House Showcase in a new tab.
export function DesignCard({ project }: { project: DesignProject }) {
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
      {project.photos.length > 0 && (
        <span
          className="mt-1 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${project.photos.length}, minmax(0, 1fr))` }}
        >
          {project.photos.map((src) => (
            <Img
              key={src}
              src={src}
              alt={`Documentation of ${project.title}`}
              className="aspect-[4/3] w-full object-cover"
            />
          ))}
        </span>
      )}
      <span className="mt-3 block font-display text-lg leading-tight underline-offset-4 group-hover:underline">
        {project.title}
      </span>
      {project.tagline && <span className="mt-1 block line-clamp-2 text-sm text-ink-soft">{project.tagline}</span>}
    </a>
  );
}