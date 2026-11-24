"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Img } from "@/components/ui/Img";
import { creditOf, mediaKind } from "@/lib/site-view";
import { Credit } from "./Credit";

type Props = {
  slides: string[];
  name: string;
  caption: string | null;
  seconds: number;
  autoplay: boolean;
  gray: boolean;
  credits?: Record<string, string>;
  // Drawn over the media (the Home intro).
  children?: ReactNode;
};

// Full width media (video, GIF or photo) that can slide, with one small caption.
export function Hero({ slides, name, caption, seconds, autoplay, gray, credits = {}, children }: Props) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (!autoplay || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), seconds * 1000);
    return () => window.clearInterval(id);
  }, [autoplay, count, seconds]);

  const at = count > 0 ? index % count : 0;
  const media = `site-hero-media absolute inset-0 size-full object-cover ${gray ? "grayscale" : ""}`;

  return (
    <section
      id="top"
      className="site-hero relative h-[var(--site-vh,100svh)] min-h-[28rem] w-full overflow-hidden site-black"
    >
      {count > 0 && (
        <div className="site-hero-track" style={{ transform: `translateX(-${at * 100}%)` }}>
          {slides.map((src, i) => (
            <div key={src} className="site-hero-slide">
              {mediaKind(src) === "video" ? (
                <video
                  src={src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={i === 0 ? "auto" : "metadata"}
                  aria-hidden
                  className={media}
                />
              ) : (
                <Img src={src} loading={i === 0 ? "eager" : "lazy"} className={media} />
              )}
              <Credit text={creditOf(credits, src)} />
            </div>
          ))}
        </div>
      )}
      <div aria-hidden className="site-hero-shade" />
      {children}
      <div className="site-hero-caption absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 px-5 pb-8 text-center">
        <h1 className="font-display text-base font-medium">{name}</h1>
        {caption && <p className="max-w-md whitespace-pre-line text-sm opacity-80">{caption}</p>}
      </div>
      {count > 1 && (
        <div className="absolute bottom-9 right-5 z-10 flex">
          {slides.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="px-1 py-3"
            >
              <span data-active={i === at ? "" : undefined} className="site-dot" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}