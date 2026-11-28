"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import type { NewsItem } from "@/config/site-content";
import { topBarDefaults, type TopBarMotion, type TopBarStyle } from "@/config/topbar-style";

export type NewsCountdown = { title: string; target: string };
export type NewsProps = {
  items: NewsItem[];
  seconds: number;
  autoplay: boolean;
  showClock?: boolean;
  countdown?: NewsCountdown | null;
  // Only the top bar uses this (Customize, Bars & footer). Left out = the original look.
  layout?: TopBarStyle;
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

// A row of slides with arrows and a counter. Put it inside a flex row.
// motion: slide = sideways, rise = up, fade = one fades into the next. ms = how long one change takes.
function Slides({
  slides,
  seconds,
  autoplay,
  small = false,
  motion = "slide",
  ms = 700,
}: {
  slides: ReactNode[];
  seconds: number;
  autoplay: boolean;
  small?: boolean;
  motion?: TopBarMotion;
  ms?: number;
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
  const duration = { transitionDuration: `${ms}ms` };
  const slideBox = "flex h-full w-full flex-none items-center justify-center px-2";

  return (
    <>
      {count > 1 ? (
        <button type="button" onClick={() => go(-1)} aria-label="Previous news" className={arrow}>
          ‹
        </button>
      ) : (
        <span className={spacer} />
      )}
      <div className="relative h-full min-w-0 flex-1 overflow-hidden">
        {motion === "fade" ? (
          slides.map((slide, i) => (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-center px-2 transition-opacity ease-out"
              style={{ ...duration, opacity: i === at ? 1 : 0 }}
              aria-hidden={i !== at}
              inert={i !== at}
            >
              {slide}
            </div>
          ))
        ) : (
          <div
            className={`flex h-full transition-transform ease-out ${motion === "rise" ? "flex-col" : ""}`}
            style={{
              ...duration,
              transform: motion === "rise" ? `translateY(-${at * 100}%)` : `translateX(-${at * 100}%)`,
            }}
          >
            {slides.map((slide, i) => (
              <div key={i} className={slideBox} aria-hidden={i !== at} inert={i !== at}>
                {slide}
              </div>
            ))}
          </div>
        )}
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

// The thin bar at the very top. Wide screens: clock, news (slides) and countdown, in the order of the layout.
// Phones: one slider with all of them.
export function NewsBar({ items, seconds, autoplay, showClock = false, countdown = null, layout }: NewsProps) {
  const L = layout ?? topBarDefaults;
  const now = useNow();
  const clockOn = showClock && L.show.clock;
  const live = L.show.countdown && countdown && isLive(countdown, now) ? countdown : null;
  const news = L.show.news ? items.map((item, i) => <NewsLine key={`${item.text}-${i}`} item={item} />) : [];
  const secs = L.seconds > 0 ? L.seconds : seconds;

  const phone: ReactNode[] = L.order.flatMap((id): ReactNode[] => {
    if (id === "clock") return clockOn ? [<Clock key="clock" />] : [];
    if (id === "countdown") return live ? [<CountdownText key="countdown" countdown={live} now={now} />] : [];
    return news;
  });
  if (phone.length === 0) return null;

  return (
    <div role="region" aria-label="News" className="site-bar-in relative z-40 border-b border-band-line bg-band text-xs text-band-ink">
      <div className="mx-auto hidden h-9 max-w-6xl items-center gap-3 px-3 sm:flex">
        {L.order.map((id, i) => {
          if (id === "clock") return clockOn ? <Clock key="clock" /> : null;
          if (id === "news") {
            return news.length > 0 ? (
              <Slides
                key="news"
                slides={news}
                seconds={secs}
                autoplay={autoplay}
                small={live !== null}
                motion={L.motion}
                ms={L.ms}
              />
            ) : (
              <span key="news" className="flex-1" />
            );
          }
          return live ? (
            <div
              key="countdown"
              className={`flex h-4 max-w-[16rem] flex-none items-center border-band-line ${i === 0 ? "border-r pr-3" : "border-l pl-3"}`}
            >
              <CountdownText countdown={live} now={now} />
            </div>
          ) : null;
        })}
      </div>
      <div className="mx-auto flex h-9 max-w-6xl items-center gap-3 px-3 sm:hidden">
        <Slides slides={phone} seconds={secs} autoplay={autoplay} small motion={L.motion} ms={L.ms} />
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