"use client";

import { useRef, useState } from "react";
import { Img } from "@/components/ui/Img";
import type { MediaKind } from "@/lib/site-view";
import { Credit } from "./Credit";

type Item = { src: string; kind: MediaKind; credit: string | null };

const shadow = { textShadow: "0 0 4px rgb(0 0 0 / 0.65)" };

// All media of one highlight in a row. Swipe it or use the arrows. Each media has its own credit.
export function HighlightMedia({ items }: { items: Item[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState(0);
  const count = items.length;

  function go(dir: 1 | -1) {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }
  function onScroll() {
    const el = track.current;
    if (el && el.clientWidth > 0) setAt(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="relative size-full">
      <ul
        ref={track}
        onScroll={onScroll}
        className="site-cards-track flex size-full snap-x snap-mandatory overflow-x-auto"
      >
        {items.map((item) => (
          <li key={item.src} className="relative h-full w-full shrink-0 snap-center">
            {item.kind === "video" ? (
              <video
                src={item.src}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden
                className="site-media-reveal size-full object-cover"
              />
            ) : (
              <Img src={item.src} className="site-media-reveal size-full object-cover" />
            )}
            <Credit text={item.credit} />
          </li>
        ))}
      </ul>
      {count > 1 && (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 text-white" style={shadow}>
          <button type="button" aria-label="Previous media" onClick={() => go(-1)} className="px-2 py-1 font-mono text-sm hover:opacity-70">
            ←
          </button>
          <span className="font-mono text-[11px]">
            {Math.min(at + 1, count)} / {count}
          </span>
          <button type="button" aria-label="Next media" onClick={() => go(1)} className="px-2 py-1 font-mono text-sm hover:opacity-70">
            →
          </button>
        </div>
      )}
    </div>
  );
}