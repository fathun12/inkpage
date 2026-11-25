"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Block } from "@/types/block";
import { Reveal } from "./Reveal";
import { WritingCard } from "./WritingCard";

type Props = { items: Block[]; title: string | null; seconds: number; autoplay: boolean; spacing?: string };

// The sliding row of cards on Home. It slides by itself, stops while the pointer is over it,
// and can be dragged, swiped or moved with the arrows.
export function CardSlider({ items, title, seconds, autoplay, spacing = "py-16 sm:py-24" }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const paused = useRef(false);
  const count = items.length;

  const step = useCallback((dir: 1 | -1) => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const width = first.getBoundingClientRect().width + gap;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;
    if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir === -1 && atStart) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: dir * width, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!autoplay || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!paused.current) step(1);
    }, seconds * 1000);
    return () => window.clearInterval(id);
  }, [autoplay, count, seconds, step]);

  const pause = () => {
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
  };
  const arrow =
    "border border-line px-3 py-1 font-mono text-sm transition-colors duration-(--dur-base) hover:border-ink";

  return (
    <section
      id="selected"
      aria-label={title ?? "Selected"}
      className={spacing}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <div className="mx-auto flex max-w-6xl items-end justify-between px-5 pb-8 sm:px-8">
        <Reveal>
          {title ? <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2> : <span />}
        </Reveal>
        {count > 1 && (
          <div className="flex gap-2">
            <button type="button" aria-label="Previous" onClick={() => step(-1)} className={arrow}>
              ←
            </button>
            <button type="button" aria-label="Next" onClick={() => step(1)} className={arrow}>
              →
            </button>
          </div>
        )}
      </div>
      <ul
        ref={track}
        className="site-cards-track mx-auto flex max-w-6xl snap-x snap-mandatory scroll-px-5 gap-6 overflow-x-auto px-5 pb-2 sm:scroll-px-8 sm:px-8"
      >
        {items.map((block) => (
          <li key={block.id} className="shrink-0 basis-[78%] snap-start sm:basis-[24rem]">
            <WritingCard block={block} />
          </li>
        ))}
      </ul>
    </section>
  );
}