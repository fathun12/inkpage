"use client";

import { useSyncExternalStore } from "react";
import { countdownConfig } from "@/config/countdown";
import { countdownStage } from "@/lib/countdown";

type Props = {
  title: string;
  description: string | null;
  // The day it counts down to, and the day the countdown was made (where the 20% and 10% steps are measured from).
  target: string;
  start: string;
};

// One shared second counter. It is 0 on the server and on the first browser render, so both HTML versions match.
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}
const getNow = () => Math.floor(Date.now() / 1000);
const getServerNow = () => 0;

export function HomeCountdown({ title, description, target, start }: Props) {
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);
  const end = Math.floor(new Date(target).getTime() / 1000);
  const begin = Math.floor(new Date(start).getTime() / 1000);
  if (!Number.isFinite(end) || !Number.isFinite(begin)) return null;

  const ready = now > 0;
  const left = Math.max(0, end - now);
  const stage = countdownStage(begin, end, now);
  const parts: [string, number][] = [
    ["Days", Math.floor(left / 86400)],
    ["Hours", Math.floor((left % 86400) / 3600)],
    ["Minutes", Math.floor((left % 3600) / 60)],
    ["Seconds", left % 60],
  ];

  return (
    <section id="countdown" aria-label={title} className="px-5 pt-14 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-5xl border-b border-tertiary px-4 py-12 text-center sm:py-16">
        <p className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-accent">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          <span>{countdownConfig.messages[stage]}</span>
        </p>
        <h2 className="mt-5 font-voice text-4xl leading-none sm:text-6xl">{title}</h2>
        {description && (
          <p className="mx-auto mt-4 max-w-md whitespace-pre-line text-ink-soft">{description}</p>
        )}
        <div role="timer" className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-y-8 sm:grid-cols-4">
          {parts.map(([label, value]) => (
            <div key={label} className="border-l border-line px-2 odd:border-l-0 sm:odd:border-l sm:first:border-l-0">
              <p className="font-voice text-5xl tabular-nums leading-none sm:text-6xl">
                {ready ? String(value).padStart(2, "0") : "--"}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}