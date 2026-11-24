"use client";

import { useEffect, useState } from "react";
import { Img } from "@/components/ui/Img";

const visible = 3;
const gap = 4; // px, the same as gap-1

// The documentation photos of one project: 3 at a time, moving one photo at every tick, back to the start at the end.
// It stops while the mouse is over it, and does not move with reduced motion or when motion is off.
export function DesignStrip({
  photos,
  alt,
  seconds,
  autoplay,
  offset,
}: {
  photos: string[];
  alt: string;
  seconds: number;
  autoplay: boolean;
  // The card's number: cards start a little apart, so they do not all move together.
  offset: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const shown = Math.min(visible, photos.length);
  const last = photos.length - shown;

  useEffect(() => {
    if (!autoplay || last <= 0 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setIndex((i) => (i >= last ? 0 : i + 1)), seconds * 1000 + offset * 600);
    return () => window.clearTimeout(timer);
  }, [autoplay, last, paused, index, seconds, offset]);

  if (photos.length === 0) return null;
  return (
    <span
      className="mt-1 block overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span
        className="flex gap-1 transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(calc(${index} * -1 * (100% + ${gap}px) / ${shown}))` }}
      >
        {photos.map((src) => (
          <span
            key={src}
            className="block shrink-0"
            style={{ flexBasis: `calc((100% - ${gap * (shown - 1)}px) / ${shown})` }}
          >
            <Img src={src} alt={alt} className="aspect-[4/3] w-full object-cover" />
          </span>
        ))}
      </span>
    </span>
  );
}