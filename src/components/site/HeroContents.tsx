"use client";

import { useEffect, useRef, useState } from "react";

export type ContentsItem = { id: string; label: string };

// Table of contents over the hero. A thin line waits at the right edge. When the mouse reaches that edge
// (or the line is tapped on a phone), a transparent list of the sections of Home fades in, and its ends fade out.
export function HeroContents({ items }: { items: ContentsItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  if (items.length === 0) return null;

  function go(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
    setOpen(false);
  }

  return (
    <nav
      ref={ref}
      aria-label="Contents"
      data-open={open ? "" : undefined}
      className="site-contents absolute bottom-[18%] right-0 top-[18%] z-20 w-64"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setOpen(false);
      }}
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) setOpen(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label="Contents"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="site-contents-handle"
      >
        <span aria-hidden className="site-contents-tick" />
      </button>
      <ul className="site-contents-list">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                go(item.id);
              }}
              className="site-contents-link block py-2 pr-4 text-right font-mono text-xs uppercase tracking-widest text-white/80 transition-colors duration-(--dur-base) hover:text-white hover:underline hover:decoration-accent hover:decoration-1 hover:underline-offset-4"
            >
              {item.label}
              <span aria-hidden className="ml-3 font-voice text-base normal-case italic tracking-normal opacity-60">
                {i + 1}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}