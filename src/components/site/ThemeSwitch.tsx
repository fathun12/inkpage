"use client";

import { useSyncExternalStore } from "react";

type Mode = "system" | "light" | "dark";

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

// System / Light / Dark. The choice is kept in this visitor's browser only.
export function ThemeSwitch() {
  const mode = useSyncExternalStore(subscribe, read, () => "system" as Mode);
  return (
    <div role="group" aria-label="Color mode" className="flex">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          aria-pressed={mode === m.id}
          onClick={() => apply(m.id)}
          className={`-ml-px border border-band-ink px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors duration-(--dur-base) first:ml-0 ${
            mode === m.id ? "bg-band-ink text-band" : "hover:bg-band-ink/15"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}