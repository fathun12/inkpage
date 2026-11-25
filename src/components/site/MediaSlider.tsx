"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";

type Props = { count: number; seconds: number; autoplay: boolean; children: ReactNode };

// The row of extra media under a project on the Projects page. It slides by itself, stops while the pointer
// is over it, and can be swiped or moved with the arrows. Same behavior as the Writing cards on Home.
// The tiles come in as children (made on the server), so this file stays small.
export function MediaSlider({ count, seconds, autoplay, children }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const paused = useRef(false);

  const step = useCallback((dir: 1 | -1) => {
    const el = track.current;
    if (!el || el.children.length === 0) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;
    if (dir === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (dir === -1 && atStart) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      return;
    }
    const tiles = Array.from(el.children) as HTMLElement[];
    const lefts = tiles.map((tile) => tile.offsetLeft - tiles[0].offsetLeft);
    const here = el.scrollLeft;
    const target =
      dir === 1 ? lefts.find((x) => x > here + 4) : [...lefts].reverse().find((x) => x < here - 4);
    el.scrollTo({ left: target ?? 0, behavior: "smooth" });
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
    <div onPointerEnter={pause} onPointerLeave={resume} onFocus={pause} onBlur={resume}>
      {count > 1 && (
        <div className="mb-3 flex justify-end gap-2">
          <button type="button" aria-label="Previous" onClick={() => step(-1)} className={arrow}>
            ←
          </button>
          <button type="button" aria-label="Next" onClick={() => step(1)} className={arrow}>
            →
          </button>
        </div>
      )}
      <ul
        ref={track}
        className="site-cards-track relative flex snap-x snap-mandatory gap-3 overflow-x-auto [--slide-h:13rem] sm:[--slide-h:16rem]"
      >
        {children}
      </ul>
    </div>
  );
}