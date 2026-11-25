"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Props = {
  // "rise" fades and lifts the box in. "still" only marks it, so a child (a line, a photo) can animate itself.
  variant?: "rise" | "still";
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

// How long to wait for the photos inside before showing anyway (ms).
const IMAGE_WAIT_MS = 4000;
// Start downloading photos this far before the box reaches the screen (px).
const PRELOAD_DISTANCE = 1200;

// A browser does not download a lazy photo while it is hidden by clip-path, so the hidden photos
// are switched to eager here, before the box is shown. Otherwise they would only start after the motion.
function startPhotos(el: Element) {
  for (const img of el.querySelectorAll("img")) {
    if (img.loading === "lazy") img.loading = "eager";
  }
}

// Resolves when every photo inside the box has loaded (or failed), or after IMAGE_WAIT_MS.
function photosReady(el: Element): Promise<void> {
  const waiting = Array.from(el.querySelectorAll("img"))
    .filter((img) => !img.complete)
    .map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    );
  if (waiting.length === 0) return Promise.resolve();
  return Promise.race([
    Promise.all(waiting).then(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, IMAGE_WAIT_MS)),
  ]);
}

export function Reveal({ variant = "rise", delay = 0, className, style, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      startPhotos(el);
      el.setAttribute("data-in", "");
      return;
    }
    let alive = true;

    // 1. Near the screen: start the photos.
    const near = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          startPhotos(entry.target);
          near.unobserve(entry.target);
        }
      },
      { rootMargin: `0px 0px ${PRELOAD_DISTANCE}px 0px` },
    );

    // 2. On the screen: wait for the photos, then two frames, so the hidden state is painted and the motion always plays.
    const show = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target;
          show.unobserve(target);
          startPhotos(target);
          photosReady(target).then(() => {
            if (!alive) return;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (alive) target.setAttribute("data-in", "");
              });
            });
          });
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    near.observe(el);
    show.observe(el);
    return () => {
      alive = false;
      near.disconnect();
      show.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={variant}
      className={className}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}