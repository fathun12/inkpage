import type { DesignsData } from "@/types/designs";
import { DesignCard } from "./DesignCard";
import { Reveal } from "./Reveal";

// The design projects section of Home: random projects from House Showcase. It only appears when that site answered.
export function HomeDesigns({
  data,
  title,
  href,
  seconds,
  autoplay,
}: {
  data: DesignsData;
  title: string;
  href: string | null;
  seconds: number;
  autoplay: boolean;
}) {
  if (data.projects.length === 0) return null;
  return (
    <section id="designs" aria-label={title} className="site-pt">
      <div className="mx-auto flex max-w-5xl items-end justify-between gap-4 px-5 pb-8 sm:px-8">
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
      <ul className="mx-auto grid max-w-5xl gap-x-5 gap-y-12 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 site-pb">
        {data.projects.map((project, i) => (
          <li key={project.slug}>
            <Reveal variant="still">
              <DesignCard project={project} seconds={seconds} autoplay={autoplay} offset={i} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}