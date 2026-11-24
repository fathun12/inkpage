import type { Block } from "@/types/block";
import { ProjectList } from "./ProjectList";
import { Reveal } from "./Reveal";

// The projects you picked for Home ("Also show on Home"). They do not slide.
export function HomeProjects({ items, title }: { items: Block[]; title: string }) {
  if (items.length === 0) return null;
  return (
    <section id="projects" aria-label={title} className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-5xl px-5 pb-8 sm:px-8">
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
        </Reveal>
      </div>
      <ProjectList blocks={items} mode="home" />
    </section>
  );
}