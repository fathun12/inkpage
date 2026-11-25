"use client";

import { useEffect, useRef, useState } from "react";
import { dayPartFor, introScroll, type DayPart } from "@/config/intro";

type Props = {
  greetings: Record<DayPart, string>;
  note: string | null;
  headlines: string[];
  seconds: number;
  autoplay: boolean;
};

const dateFormat = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });

// Greeting and date follow the visitor's clock. The big sentences swap by fading (not sliding).
// All sentences sit in the same grid cell, so the block keeps one height and the page never jumps.
// While you scroll, each of the three lines fades and slides left over its own range of the scroll.
// The wheel only sets a target; the screen follows it a little each frame, so a notched wheel still looks smooth.
export function Intro({ greetings, note, headlines, seconds, autoplay }: Props) {
  const [now, setNow] = useState<Date | null>(null);
  const [still, setStill] = useState(false);
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const count = headlines.length;
  const shown = count > 0;

  useEffect(() => {
    const first = window.setTimeout(() => {
      setNow(new Date());
      setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }, 0);
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  const rotate = autoplay && !still && count > 1;
  useEffect(() => {
    if (!rotate) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), seconds * 1000);
    return () => window.clearInterval(id);
  }, [rotate, count, seconds]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const full = root.closest("[data-motion]")?.getAttribute("data-motion") === "full";
    if (!full || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lines = lineRefs.current;
    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
    let target = 0;
    let current = 0;
    let last = 0;
    let raf = 0;

    const apply = () => {
      introScroll.ranges.forEach(([from, to], i) => {
        const el = lines[i];
        if (!el) return;
        const t = clamp01((current - from) / (to - from));
        const p = t * t * (3 - 2 * t);
        el.style.opacity = String(1 - p);
        el.style.transform = p === 0 ? "" : `translate3d(${-p * introScroll.distanceVw}vw, 0, 0)`;
      });
    };

    const frame = (time: number) => {
      const dt = last ? Math.min(time - last, 64) : 16;
      last = time;
      current += (target - current) * (1 - Math.exp(-dt / introScroll.smoothMs));
      if (Math.abs(target - current) < 0.0005) current = target;
      apply();
      if (current === target) {
        raf = 0;
        last = 0;
      } else {
        raf = requestAnimationFrame(frame);
      }
    };

    const onScroll = () => {
      target = clamp01(window.scrollY / (window.innerHeight * introScroll.spanScreens));
      if (!raf) raf = requestAnimationFrame(frame);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      lines.forEach((el) => {
        if (el) {
          el.style.opacity = "";
          el.style.transform = "";
        }
      });
    };
  }, [shown]);

  if (count === 0) return null;
  const at = rotate ? index % count : 0;

  return (
    <section
      ref={rootRef}
      aria-label="Introduction"
      className="site-intro pointer-events-none absolute inset-0 z-10 flex flex-col justify-center px-5 pb-28 pt-32 sm:px-8"
    >
      <div
        ref={(el) => {
          lineRefs.current[0] = el;
        }}
        className="will-change-[opacity,transform]"
      >
        <p
          data-n="1"
          className="site-intro-line min-h-[1.5em] font-display text-2xl font-bold tracking-tight text-accent md:text-4xl"
        >
          {now ? greetings[dayPartFor(now.getHours())] : "\u00a0"}
        </p>
      </div>
      <div
        ref={(el) => {
          lineRefs.current[1] = el;
        }}
        className="will-change-[opacity,transform]"
      >
        <p data-n="2" className="site-intro-line mt-1 min-h-[1.5em] text-base text-white/80 md:text-lg">
          {now ? `Today is ${dateFormat.format(now)}.${note ? ` ${note}` : ""}` : "\u00a0"}
        </p>
      </div>
      <div
        ref={(el) => {
          lineRefs.current[2] = el;
        }}
        className="will-change-[opacity,transform]"
      >
        <h2
          data-n="3"
          className="site-intro-line mt-6 grid max-w-xl text-5xl font-bold leading-none tracking-tight md:max-w-3xl md:text-7xl lg:max-w-4xl lg:text-8xl xl:text-9xl"
        >
          {headlines.map((text, i) => (
            <span
              key={`${text}-${i}`}
              aria-hidden={i !== at}
              className={`col-start-1 row-start-1 transition-opacity duration-700 ease-out ${
                i === at ? "opacity-100" : "pointer-events-none select-none opacity-0"
              }`}
            >
              {text}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}