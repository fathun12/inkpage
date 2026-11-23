"use client";

import { useEffect, useState } from "react";
import { Img } from "@/components/ui/Img";

type Props = { images: string[]; seconds?: number; autoplay?: boolean };

// One full width frame above the footer. The photos change with a fade, not a slide.
export function FadeGallery({ images, seconds = 6, autoplay = true }: Props) {
  const [active, setActive] = useState(0);
  const count = images.length;

  useEffect(() => {
    if (!autoplay || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % count), seconds * 1000);
    return () => window.clearInterval(id);
  }, [autoplay, count, seconds]);

  if (count === 0) return null;
  const at = active % count;

  return (
    <section
      id="gallery"
      aria-label="Gallery"
      className="relative h-[calc(var(--site-vh,100svh)*0.8)] w-full overflow-hidden bg-ink"
    >
      {images.map((src, i) => (
        <Img
          key={`${src}-${i}`}
          src={src}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-[1400ms] ease-out ${
            i === at ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {count > 1 && (
        <div aria-hidden className="absolute bottom-6 right-6 z-10 flex gap-1.5">
          {images.map((src, i) => (
            <span key={`${src}-${i}`} data-active={i === at ? "" : undefined} className="site-dot" />
          ))}
        </div>
      )}
    </section>
  );
}