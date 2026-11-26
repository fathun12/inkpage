"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import type { NewsItem } from "@/config/site-content";

export type NewsCountdown = { title: string; target: string };
export type NewsProps = {
  items: NewsItem[];
  seconds: number;
  autoplay: boolean;
  showClock?: boolean;
  countdown?: NewsCountdown | null;
};

// One shared second counter. It is 0 on the server and on the first browser render, so both HTML versions match.
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}
const getNow = () => Math.floor(Date.now() / 1000);
const getServerNow = () => 0;
function useNow(): number {
  return useSyncExternalStore(subscribe, getNow, getServerNow);
}

// A countdown shows until its time has come.
function isLive(countdown: NewsCountdown, now: number): boolean {
  const end = Math.floor(new Date(countdown.target).getTime() / 1000);
  return Number.isFinite(end) && (now === 0 || end > now);
}

// Jakarta time, 24 hours. Empty until the browser has mounted, so the server and browser HTML match.
function Clock() {
  const [text, setText] = useState("");
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const tick = () => setText(format.format(new Date()));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  return (
    <span aria-label="Time in Jakarta" className="min-w-[7ch] font-mono tabular-nums opacity-60">
      {text ? `${text} WIB` : ""}
    </span>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

// The title and the time left, on one line: "Launch  3d 04:12:09".
function CountdownText({ countdown, now }: { countdown: NewsCountdown; now: number }) {
  const end = Math.floor(new Date(countdown.target).getTime() / 1000);
  const left = Math.max(0, end - now);
  const days = Math.floor(left / 86400);
  const time = `${days > 0 ? `${days}d ` : ""}${pad(Math.floor((left % 86400) / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
  return (
    <span className="flex min-w-0 items-baseline gap-2 whitespace-nowrap">
      <span className="truncate">{countdown.title}</span>
      <span className="font-mono tabular-nums opacity-80">{now > 0 ? time : ""}</span>
    </span>
  );
}

function NewsLine({ item }: { item: NewsItem }) {
  return item.url ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="truncate underline-offset-4 hover:underline">
      {item.text}
    </a>
  ) : (
    <span className="truncate">{item.text}</span>
  );
}

// A row of slides that move sideways, with arrows and a counter. Put it inside a flex row.
function Slides({
  slides,
  seconds,
  autoplay,
  small = false,
}: {
  slides: ReactNode[];
  seconds: number;
  autoplay: boolean;
  small?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (!autoplay || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), seconds * 1000);
    return () => window.clearInterval(id);
  }, [autoplay, count, seconds]);

  if (count === 0) return null;
  const at = index % count;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const arrow = `${small ? "w-4 text-sm" : "w-5 text-base"} leading-none opacity-70 hover:opacity-100`;
  const spacer = small ? "w-4" : "w-5";

  return (
    <>
      {count > 1 ? (
        <button type="button" onClick={() => go(-1)} aria-label="Previous news" className={arrow}>
          ‹
        </button>
      ) : (
        <span className={spacer} />
      )}
      <div className="h-full min-w-0 flex-1 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${at * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="flex h-full w-full flex-none items-center justify-center px-2"
              aria-hidden={i !== at}
              inert={i !== at}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
      {count > 1 ? (
        <span className="flex items-center gap-2">
          <span className="font-mono opacity-60">
            {at + 1}/{count}
          </span>
          <button type="button" onClick={() => go(1)} aria-label="Next news" className={arrow}>
            ›
          </button>
        </span>
      ) : (
        <span className={spacer} />
      )}
    </>
  );
}

// The thin bar at the very top. Wide screens: clock, news (slides), countdown. Phones: one slider with all three.
export function NewsBar({ items, seconds, autoplay, showClock = false, countdown = null }: NewsProps) {
  const now = useNow();
  const live = countdown && isLive(countdown, now) ? countdown : null;
  const news = items.map((item, i) => <NewsLine key={`${item.text}-${i}`} item={item} />);

  const phone: ReactNode[] = [];
  if (showClock) phone.push(<Clock key="clock" />);
  if (live) phone.push(<CountdownText key="countdown" countdown={live} now={now} />);
  phone.push(...news);
  if (phone.length === 0) return null;

  return (
    <div role="region" aria-label="News" className="relative z-40 overflow-hidden bg-band text-xs text-band-ink">
      <div className="site-bar-in border-b border-band-line bg-band">
      <div className="mx-auto hidden h-9 max-w-6xl items-center gap-3 px-3 sm:flex">
        {showClock && <Clock />}
        <Slides slides={news} seconds={seconds} autoplay={autoplay} small={live !== null} />
        {live && (
          <div className="flex h-4 max-w-[16rem] flex-none items-center border-l border-band-line pl-3">
            <CountdownText countdown={live} now={now} />
          </div>
        )}
      </div>
      <div className="mx-auto flex h-9 max-w-6xl items-center gap-3 px-3 sm:hidden">
        <Slides slides={phone} seconds={seconds} autoplay={autoplay} small />
      </div>
      </div>
    </div>
  );
}

// The same news inside the black band of the footer. It is narrow, so the clock and the countdown
// are slides of the same slider as the news.
export function NewsTicker({ items, seconds, autoplay, showClock = false, countdown = null }: NewsProps) {
  const now = useNow();
  const live = countdown && isLive(countdown, now) ? countdown : null;

  const slides: ReactNode[] = [];
  if (showClock) slides.push(<Clock key="clock" />);
  if (live) slides.push(<CountdownText key="countdown" countdown={live} now={now} />);
  items.forEach((item, i) => slides.push(<NewsLine key={`${item.text}-${i}`} item={item} />));
  if (slides.length === 0) return null;

  return (
    <div className="flex h-6 min-w-0 flex-1 items-center gap-2 text-xs">
      <Slides slides={slides} seconds={seconds} autoplay={autoplay} small />
    </div>
  );
}