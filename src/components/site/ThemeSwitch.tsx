"use client";

import { useSyncExternalStore } from "react";

export type Mode = "system" | "light" | "dark";

const KEY = "site-mode";
const EVENT = "site-mode";
const modes: { id: Mode; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function read(): Mode {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function apply(mode: Mode) {
  try {
    if (mode === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch {
    // Private mode: the choice just lasts until the page closes.
  }
  if (mode === "system") document.documentElement.removeAttribute("data-site-mode");
  else document.documentElement.setAttribute("data-site-mode", mode);
  window.dispatchEvent(new Event(EVENT));
}

type Props = { control?: { value: Mode; onChange: (mode: Mode) => void } };

// System / Light / Dark. The choice is kept in this visitor's browser only.
// With "control" (Customize preview) it touches neither <html> nor the browser storage.
export function ThemeSwitch({ control }: Props) {
  const stored = useSyncExternalStore(subscribe, read, () => "system" as Mode);
  const mode = control ? control.value : stored;
  const choose = control ? control.onChange : apply;
  return (
    <div role="group" aria-label="Color mode" className="flex">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          aria-pressed={mode === m.id}
          onClick={() => choose(m.id)}
          className={`-ml-px border border-band-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors duration-(--dur-base) first:ml-0 ${
            mode === m.id ? "bg-band-ink text-band" : "hover:bg-band-ink/15"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}