"use client";

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import type { Block } from "@/types/block";
import { Reveal } from "./Reveal";
import { WritingCard } from "./WritingCard";

type Props = { items: Block[]; title: string | null; seconds: number; autoplay: boolean; spacing?: string; id?: string };

const GLIDE_MS = 700;
const DRAG_START_PX = 6;
// How far a flick carries after release: speed (px per ms) times this many ms.
const CARRY_MS = 220;
const REDUCED = "(prefers-reduced-motion: reduce)";

// Fast at first, slowing down at the end.
const glide = (p: number) => 1 - Math.pow(1 - p, 3);

// Scroll positions where a card sits at the left edge.
function snapPoints(el: HTMLElement) {
  const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
  const max = el.scrollWidth - el.clientWidth;
  const base = el.getBoundingClientRect().left;
  const points: number[] = [];
  for (const child of Array.from(el.children)) {
    const at = child.getBoundingClientRect().left - base + el.scrollLeft - pad;
    const v = Math.min(Math.max(at, 0), max);
    if (points.length === 0 || v - points[points.length - 1] > 1) points.push(v);
  }
  return points;
}

function nearest(points: number[], v: number) {
  return points.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), points[0] ?? 0);
}

// The sliding row of cards on Home. It slides by itself, stops while the pointer is over it, and is moved by
// dragging (mouse, finger or pen: press, move, release, then it glides on and stops exactly on a card) and by the
// arrows. The wheel and the touchpad do NOT move it, so the page always scrolls freely over it (the row is
// overflow hidden, not a scroll box). Same model as MediaSlider.
export function CardSlider({ items, title, seconds, autoplay, spacing = "site-py", id = "selected" }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const paused = useRef(false);
  const raf = useRef(0);
  const goal = useRef<number | null>(null);
  const dragging = useRef(false);
  const dragged = useRef(false);
  const lastActive = useRef(0);
  const count = items.length;

  const stop = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
    goal.current = null;
  }, []);

  const glideTo = useCallback(
    (target: number) => {
      const el = track.current;
      if (!el) return;
      stop();
      const from = el.scrollLeft;
      const dist = target - from;
      if (Math.abs(dist) < 1) return;
      if (window.matchMedia(REDUCED).matches) {
        el.scrollLeft = target;
        return;
      }
      goal.current = target;
      const t0 = performance.now();
      const frame = (now: number) => {
        const p = Math.min(1, (now - t0) / GLIDE_MS);
        el.scrollLeft = p < 1 ? from + dist * glide(p) : target;
        if (p < 1) {
          raf.current = requestAnimationFrame(frame);
        } else {
          raf.current = 0;
          goal.current = null;
        }
      };
      raf.current = requestAnimationFrame(frame);
    },
    [stop],
  );

  // One card forward or back. Forward from the end goes to the start, back from the start goes to the end.
  const step = useCallback(
    (dir: 1 | -1) => {
      const el = track.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 1) return;
      const points = snapPoints(el);
      const cur = goal.current ?? el.scrollLeft;
      let target: number;
      if (dir === 1) {
        target = cur >= max - 1 ? 0 : (points.find((p) => p > cur + 1) ?? max);
      } else {
        target = cur <= 1 ? max : ([...points].reverse().find((p) => p < cur - 1) ?? 0);
      }
      glideTo(target);
    },
    [glideTo],
  );

  // Slides by itself after "seconds" of stillness. Paused while the pointer is over it, while dragging,
  // while it glides, in a hidden tab, and with reduced motion.
  useEffect(() => {
    if (!autoplay || count < 2) return;
    if (window.matchMedia(REDUCED).matches) return;
    lastActive.current = Date.now();
    const id = window.setInterval(() => {
      if (document.hidden || paused.current || dragging.current || raf.current) return;
      if (Date.now() - lastActive.current < seconds * 1000) return;
      lastActive.current = Date.now();
      step(1);
    }, 200);
    return () => window.clearInterval(id);
  }, [autoplay, count, seconds, step]);

  useEffect(() => () => stop(), [stop]);

  // Put the row back exactly on a card when the width changes.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (raf.current || dragging.current) return;
      const points = snapPoints(el);
      if (points.length === 0) return;
      const at = nearest(points, el.scrollLeft);
      if (Math.abs(at - el.scrollLeft) > 1) el.scrollLeft = at;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [count]);

  // Drag with the mouse, a finger or a pen: the row follows the pointer; on release it glides on to the nearest
  // card, fast at first and slowing down, at most one width away. A vertical move is left to the page
  // (touch-action: pan-y), so the page still scrolls with a finger.
  function onPointerDown(e: ReactPointerEvent<HTMLUListElement>) {
    const el = track.current;
    if (!el || !e.isPrimary) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    stop();
    const id = e.pointerId;
    const startX = e.clientX;
    const startY = e.clientY;
    const startScroll = el.scrollLeft;
    let active = false;
    let velocity = 0;
    let lastX = startX;
    let lastT = performance.now();

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      const dx = ev.clientX - startX;
      if (!active) {
        if (Math.abs(dx) < DRAG_START_PX || Math.abs(dx) < Math.abs(ev.clientY - startY)) return;
        active = true;
        dragging.current = true;
      }
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) {
        velocity = velocity * 0.6 + ((ev.clientX - lastX) / dt) * 0.4;
        lastX = ev.clientX;
        lastT = now;
      }
      el.scrollLeft = startScroll - dx;
    };

    const end = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      dragging.current = false;
      lastActive.current = Date.now();
      if (!active) return;
      // The click that follows a drag must not open a link.
      dragged.current = true;
      window.setTimeout(() => {
        dragged.current = false;
      }, 0);
      const max = el.scrollWidth - el.clientWidth;
      const w = el.clientWidth;
      const held = performance.now() - lastT > 100;
      const carry = ev.type === "pointercancel" || held ? 0 : velocity * CARRY_MS;
      const projected = el.scrollLeft - carry;
      const lo = Math.max(0, startScroll - w);
      const hi = Math.min(max, startScroll + w);
      glideTo(nearest(snapPoints(el), Math.min(hi, Math.max(lo, projected))));
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  const pause = () => {
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
    lastActive.current = Date.now();
  };
  const arrow =
    "border border-line px-3 py-1 font-mono text-sm transition-colors duration-(--dur-base) hover:border-ink";

  return (
    <section
      id={id}
      aria-label={title ?? "Selected"}
      className={spacing}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <div className="mx-auto flex max-w-6xl items-end justify-between px-5 pb-8 sm:px-8">
        <Reveal>
          {title ? <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2> : <span />}
        </Reveal>
        {count > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => {
                lastActive.current = Date.now();
                step(-1);
              }}
              className={arrow}
            >
              {"\u2190"}
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => {
                lastActive.current = Date.now();
                step(1);
              }}
              className={arrow}
            >
              {"\u2192"}
            </button>
          </div>
        )}
      </div>
      <ul
        ref={track}
        onPointerDown={onPointerDown}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          if (dragged.current) {
            e.preventDefault();
            e.stopPropagation();
            dragged.current = false;
          }
        }}
        className="site-cards-track -mb-4 mx-auto flex max-w-6xl cursor-grab touch-pan-y select-none gap-6 overflow-hidden px-5 pb-6 active:cursor-grabbing sm:px-8"
      >
        {items.map((block, index) => (
          <li key={block.id} className="shrink-0 basis-[78%] sm:basis-[24rem]">
            <Reveal delay={Math.min(index, 4) * 80}>
              <WritingCard block={block} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}