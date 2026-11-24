import Link from "next/link";
import type { BibliaData } from "@/types/biblia";
import { BibliaGrid } from "./BibliaGrid";
import { Reveal } from "./Reveal";

// The Biblia section of Home: the newest book covers. It only appears when the library answered.
export function HomeBiblia({ data, title, seeAll }: { data: BibliaData; title: string; seeAll: string }) {
  if (data.books.length === 0) return null;
  return (
    <section id="biblia" aria-label={title} className="pt-16 sm:pt-24">
      <div className="mx-auto flex max-w-5xl items-end justify-between gap-4 px-5 pb-8 sm:px-8">
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
        </Reveal>
        <Link
          href={seeAll}
          className="font-mono text-xs uppercase tracking-widest underline decoration-accent decoration-1 underline-offset-4 transition-colors duration-(--dur-base) hover:text-accent"
        >
          See all {data.titles} →
        </Link>
      </div>
      <BibliaGrid books={data.books} bottom="pb-16 sm:pb-24" />
    </section>
  );
}