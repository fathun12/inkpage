"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

// Reading settings of an article page. Each reader's choice is kept in their own browser.
type Settings = {
  size: number;
  font: "serif" | "sans";
  align: "left" | "justify";
  width: "narrow" | "medium" | "wide";
};

const defaults: Settings = { size: 2, font: "serif", align: "left", width: "medium" };
const storageKey = "inkpage-reader";
const sizeCount = 5;

const listeners = new Set<() => void>();
let memory = "";

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string {
  try {
    return window.localStorage.getItem(storageKey) ?? memory;
  } catch {
    return memory;
  }
}

function getServerSnapshot(): string {
  return "";
}

function write(value: string) {
  memory = value;
  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    // Storage blocked: the choice still works until the page closes.
  }
  listeners.forEach((listener) => listener());
}

function parse(raw: string): Settings {
  if (!raw) return defaults;
  try {
    const r = JSON.parse(raw) as Partial<Settings>;
    return {
      size: typeof r.size === "number" && r.size >= 1 && r.size <= sizeCount ? Math.round(r.size) : defaults.size,
      font: r.font === "sans" ? "sans" : "serif",
      align: r.align === "justify" ? "justify" : "left",
      width: r.width === "narrow" || r.width === "wide" ? r.width : "medium",
    };
  } catch {
    return defaults;
  }
}

const labelClass = "font-mono text-[11px] uppercase tracking-widest text-ink-soft";

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-md border px-3 py-2 text-sm ${
        active ? "border-ink bg-surface text-ink" : "border-line text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

type Props = {
  head: ReactNode;
  meta: ReactNode;
  children: ReactNode;
};

// The whole article page: title block, a row with the date and the settings button, then the content.
export function ReaderShell({ head, meta, children }: Props) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const settings = useMemo(() => parse(raw), [raw]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function change(patch: Partial<Settings>) {
    write(JSON.stringify({ ...settings, ...patch }));
  }

  return (
    <article
      className="reader mx-auto w-full px-5 pb-24 pt-10 sm:px-8"
      data-size={settings.size}
      data-font={settings.font}
      data-align={settings.align}
      data-width={settings.width}
    >
      {head}
      <div className="mt-5 flex items-center justify-between gap-4">
        {meta}
        <div ref={box} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Reading settings"
            className="rounded-md border border-line px-3 py-1 text-ink-soft hover:text-ink"
          >
            •••
          </button>
          {open && (
            <div className="absolute right-0 top-full z-20 mt-2 flex w-72 flex-col gap-4 rounded-md border border-line bg-bg p-4">
              <div className="flex flex-col gap-2">
                <span className={labelClass}>Text size</span>
                <div className="flex items-center gap-2">
                  <Choice active={false} onClick={() => change({ size: Math.max(1, settings.size - 1) })}>
                    A-
                  </Choice>
                  <span className="w-16 text-center text-sm text-ink-soft">
                    {settings.size} of {sizeCount}
                  </span>
                  <Choice active={false} onClick={() => change({ size: Math.min(sizeCount, settings.size + 1) })}>
                    A+
                  </Choice>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className={labelClass}>Font</span>
                <div className="flex gap-2">
                  <Choice active={settings.font === "serif"} onClick={() => change({ font: "serif" })}>
                    Serif
                  </Choice>
                  <Choice active={settings.font === "sans"} onClick={() => change({ font: "sans" })}>
                    Sans
                  </Choice>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className={labelClass}>Alignment</span>
                <div className="flex gap-2">
                  <Choice active={settings.align === "left"} onClick={() => change({ align: "left" })}>
                    Left
                  </Choice>
                  <Choice active={settings.align === "justify"} onClick={() => change({ align: "justify" })}>
                    Justify
                  </Choice>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className={labelClass}>Column width</span>
                <div className="flex gap-2">
                  <Choice active={settings.width === "narrow"} onClick={() => change({ width: "narrow" })}>
                    Narrow
                  </Choice>
                  <Choice active={settings.width === "medium"} onClick={() => change({ width: "medium" })}>
                    Medium
                  </Choice>
                  <Choice active={settings.width === "wide"} onClick={() => change({ width: "wide" })}>
                    Wide
                  </Choice>
                </div>
              </div>
              <button
                type="button"
                onClick={() => write(JSON.stringify(defaults))}
                className="self-start text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                Reset to default
              </button>
            </div>
          )}
        </div>
      </div>
      {children}
    </article>
  );
}