"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/config/site-content";

type Props = { items: NewsItem[]; seconds: number; autoplay: boolean };

// The thin bar at the very top. The lines slide sideways.
export function NewsBar({ items, seconds, autoplay }: Props) {
  const [index, setIndex] = useState(0);
  const count = items.length;

  useEffect(() => {
    if (!autoplay || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), seconds * 1000);
    return () => window.clearInterval(id);
  }, [autoplay, count, seconds]);

  if (count === 0) return null;
  const at = index % count;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  return (
    <div role="region" aria-label="News" className="bg-ink text-xs text-bg">
      <div className="mx-auto flex h-9 max-w-6xl items-center gap-3 px-3">
        {count > 1 ? (
          <button type="button" onClick={() => go(-1)} aria-label="Previous news" className="w-5 text-base leading-none opacity-70 hover:opacity-100">
            ‹
          </button>
        ) : (
          <span className="w-5" />
        )}
        <div className="h-full min-w-0 flex-1 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${at * 100}%)` }}
          >
            {items.map((item, i) => (
              <div key={`${item.text}-${i}`} className="flex h-full w-full flex-none items-center justify-center px-2" aria-hidden={i !== at}>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="truncate underline-offset-4 hover:underline">
                    {item.text}
                  </a>
                ) : (
                  <span className="truncate">{item.text}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        {count > 1 ? (
          <span className="flex items-center gap-3">
            <span className="font-mono opacity-60">
              {at + 1}/{count}
            </span>
            <button type="button" onClick={() => go(1)} aria-label="Next news" className="w-5 text-base leading-none opacity-70 hover:opacity-100">
              ›
            </button>
          </span>
        ) : (
          <span className="w-5" />
        )}
      </div>
    </div>
  );
}