"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  items: ReactNode[];
  rows: number;
  step: "page" | "one";
  motion: "slide" | "fade";
  seconds: number;
};

const GLIDE_MS = 700;
const REDUCED = "(prefers-reduced-motion: reduce)";

const inClass = { slide: "lead-in-slide", fade: "lead-in-fade" } as const;
const outClass = { slide: "lead-out-slide", fade: "lead-out-fade" } as const;

const css = `
.lead-layer{grid-area:1/1;min-width:0}
@keyframes lead-in-slide{from{opacity:0;transform:translateX(6%)}to{opacity:1;transform:none}}
@keyframes lead-out-slide{from{opacity:1;transform:none}to{opacity:0;transform:translateX(-6%)}}
@keyframes lead-in-fade{from{opacity:0}to{opacity:1}}
@keyframes lead-out-fade{from{opacity:1}to{opacity:0}}
.lead-in-slide{animation:lead-in-slide ${GLIDE_MS}ms cubic-bezier(0.22,1,0.36,1) both}
.lead-out-slide{animation:lead-out-slide ${GLIDE_MS}ms cubic-bezier(0.22,1,0.36,1) both;pointer-events:none}
.lead-in-fade{animation:lead-in-fade ${GLIDE_MS}ms ease both}
.lead-out-fade{animation:lead-out-fade ${GLIDE_MS}ms ease both;pointer-events:none}
@media (prefers-reduced-motion:reduce){.lead-layer{animation:none!important}}
`;

// The numbered list under the big article. If every row fits, it is a plain list. If there are more articles than
// rows, a window of "rows" articles changes by itself: a whole page at a time, or one article at a time, with a
// slide or a fade. It pauses while the pointer or focus is on it and in a hidden tab.
export function LeadRows({ items, rows, step, motion, seconds }: Props) {
  const len = items.length;
  const shown = Math.max(1, Math.min(rows, len));
  const sliding = len > shown;
  const jump = step === "page" ? shown : 1;

  const [state, setState] = useState<{ cur: number; prev: number | null; n: number }>({ cur: 0, prev: null, n: 0 });
  const [minH, setMinH] = useState(0);
  const paused = useRef(false);
  const last = useRef(0);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sliding) return;
    if (window.matchMedia(REDUCED).matches) return;
    last.current = Date.now();
    const id = window.setInterval(() => {
      if (document.hidden || paused.current) return;
      if (Date.now() - last.current < seconds * 1000) return;
      last.current = Date.now();
      setState((s) => ({ cur: (s.cur + jump) % len, prev: s.cur, n: s.n + 1 }));
    }, 250);
    return () => window.clearInterval(id);
  }, [sliding, seconds, jump, len]);

  // The old window leaves the page when its animation is over.
  useEffect(() => {
    if (state.prev === null) return;
    const t = window.setTimeout(() => setState((s) => ({ ...s, prev: null })), GLIDE_MS);
    return () => window.clearTimeout(t);
  }, [state.n, state.prev]);

  // The list never gets shorter than the tallest window seen, so the page below does not jump.
  useEffect(() => {
    const el = layer.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setMinH((h) => Math.max(h, el.offsetHeight)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [state.n]);

  if (!sliding) return <ul className="border-b border-line">{items}</ul>;

  const windowOf = (start: number) =>
    Array.from({ length: shown }, (_, k) => <Fragment key={k}>{items[(start + k) % len]}</Fragment>);

  return (
    <div
      onPointerEnter={() => {
        paused.current = true;
      }}
      onPointerLeave={() => {
        paused.current = false;
        last.current = Date.now();
      }}
      onFocus={() => {
        paused.current = true;
      }}
      onBlur={() => {
        paused.current = false;
        last.current = Date.now();
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="grid overflow-hidden" style={{ minHeight: minH || undefined }}>
        {state.prev !== null && (
          <div key={`out-${state.n}`} aria-hidden inert className={`lead-layer ${outClass[motion]}`}>
            <ul className="border-b border-line">{windowOf(state.prev)}</ul>
          </div>
        )}
        <div
          key={`in-${state.n}`}
          ref={layer}
          className={state.prev !== null ? `lead-layer ${inClass[motion]}` : "lead-layer"}
        >
          <ul className="border-b border-line">{windowOf(state.cur)}</ul>
        </div>
      </div>
    </div>
  );
}