"use client";

import { useEffect, useState } from "react";
import { Img } from "@/components/ui/Img";

type Props = { images: string[]; seconds?: number };

// One full width frame. The photos change with a fade, not a slide.
export function FadeGallery({ images, seconds = 6 }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % images.length), seconds * 1000);
    return () => window.clearInterval(id);
  }, [images.length, seconds]);

  if (images.length === 0) return null;

  return (
    <section id="gallery" aria-label="Gallery" className="relative h-[80svh] w-full scroll-mt-[3.75rem] overflow-hidden bg-ink">
      {images.map((src, i) => (
        <Img
          key={`${src}-${i}`}
          src={src}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-[1400ms] ease-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {images.length > 1 && (
        <div aria-hidden className="absolute bottom-6 right-6 z-10 flex gap-1.5">
          {images.map((src, i) => (
            <span key={`${src}-${i}`} data-active={i === active ? "" : undefined} className="site-dot" />
          ))}
        </div>
      )}
    </section>
  );
}