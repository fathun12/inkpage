"use client";

import { useEffect, useState } from "react";
import { dayPartFor, type DayPart } from "@/config/intro";

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
export function Intro({ greetings, note, headlines, seconds, autoplay }: Props) {
  const [now, setNow] = useState<Date | null>(null);
  const [still, setStill] = useState(false);
  const [index, setIndex] = useState(0);
  const count = headlines.length;

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

  if (count === 0) return null;
  const at = rotate ? index % count : 0;

  return (
    <section aria-label="Introduction" className="w-full px-5 py-14 sm:px-8 md:py-20">
      <p className="min-h-[1.5em] font-display text-2xl font-bold tracking-tight text-accent md:text-3xl">
        {now ? greetings[dayPartFor(now.getHours())] : "\u00a0"}
      </p>
      <p className="mt-1 min-h-[1.5em] text-ink-soft">
        {now ? `Today is ${dateFormat.format(now)}.${note ? ` ${note}` : ""}` : "\u00a0"}
      </p>
      <h2 className="mt-8 grid max-w-5xl text-5xl leading-none tracking-tight md:text-7xl lg:text-8xl">
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
    </section>
  );
}