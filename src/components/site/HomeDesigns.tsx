import type { DesignsData } from "@/types/designs";
import { DesignCard } from "./DesignCard";
import { Reveal } from "./Reveal";

// The design projects section of Home: random projects from House Showcase. It only appears when that site answered.
export function HomeDesigns({
  data,
  title,
  seconds,
  autoplay,
}: {
  data: DesignsData;
  title: string;
  seconds: number;
  autoplay: boolean;
}) {
  if (data.projects.length === 0) return null;
  return (
    <section id="designs" aria-label={title} className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-5xl px-5 pb-8 sm:px-8">
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
        </Reveal>
      </div>
      <ul className="mx-auto grid max-w-5xl gap-x-5 gap-y-12 px-5 pb-16 sm:grid-cols-2 sm:px-8 sm:pb-24 lg:grid-cols-3">
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