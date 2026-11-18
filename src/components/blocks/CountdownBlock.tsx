"use client";

import { useSyncExternalStore } from "react";

type Props = { title: string; target: string };

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}
const getNow = () => Math.floor(Date.now() / 1000);
const getServerNow = () => 0;

export function CountdownBlock({ title, target }: Props) {
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);
  const end = Math.floor(new Date(target).getTime() / 1000);
  if (!Number.isFinite(end)) return null;

  const ready = now > 0;
  const left = Math.max(0, end - now);
  const parts: [string, number][] = [
    ["Days", Math.floor(left / 86400)],
    ["Hours", Math.floor((left % 86400) / 3600)],
    ["Min", Math.floor((left % 3600) / 60)],
    ["Sec", left % 60],
  ];

  return (
    <div className="ink-border rounded-md bg-surface p-5 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">{title}</p>
      {ready && left === 0 ? (
        <p className="mt-3 font-display text-3xl font-black">It has started.</p>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {parts.map(([label, value]) => (
            <div key={label}>
              <p className="font-display text-4xl font-black">
                {ready ? String(value).padStart(2, "0") : "--"}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
