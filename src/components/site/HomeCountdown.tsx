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
      <div className="mx-auto max-w-5xl border-b-2 border-tertiary px-4 py-12 text-center sm:py-16">
        <p className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-accent">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          <span>{countdownConfig.messages[stage]}</span>
        </p>
        <h2 className="mt-5 font-voice text-4xl leading-none sm:text-6xl">{title}</h2>
        {description && (
          <p className="mx-auto mt-4 max-w-md whitespace-pre-line text-ink-soft">{description}</p>
        )}
        <div role="timer" className="mx-auto mt-10 grid max-w-xl grid-cols-4">
          {parts.map(([label, value]) => (
            <div key={label} className="min-w-0 border-l border-line px-1 first:border-l-0 sm:px-2">
              <p className="font-voice text-[clamp(1.75rem,9.5vw,3.75rem)] tabular-nums leading-none">
                {ready ? String(value).padStart(2, "0") : "--"}
              </p>
              <p className="mt-2 font-mono text-[clamp(7px,2.2vw,11px)] uppercase tracking-[0.1em] text-ink-soft sm:tracking-[0.2em]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}