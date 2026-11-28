"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import type { NewsItem } from "@/config/site-content";
import { footerBandDefaults, type FooterBand, type FooterBandSize } from "@/config/footer-style";
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
  // Only the news in the black band of the footer uses this. Left out = the original look.
  band?: FooterBand;
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
  gap = "gap-3",
}: {
  slides: ReactNode[];
  seconds: number;
  autoplay: boolean;
  small?: boolean;
  motion?: TopBarMotion;
  ms?: number;
  gap?: string;
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
    <div className={`flex h-full min-w-0 flex-1 items-center ${gap}`}>
      <span className="flex flex-none items-center gap-2">
        {count > 1 ? (
          <button type="button" onClick={() => go(-1)} aria-label="Previous news" className={arrow}>
            ‹
          </button>
        ) : (
          <span className={spacer} />
        )}
        {count > 1 && (
          <span aria-hidden className="invisible font-mono">
            {at + 1}/{count}
          </span>
        )}
      </span>
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
        <span className="flex flex-none items-center gap-2">
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
    </div>
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
  const wrap = L.mode === "full" ? "w-full" : "mx-auto max-w-6xl";

  const phone: ReactNode[] = L.order.flatMap((id): ReactNode[] => {
    if (id === "clock") return clockOn ? [<Clock key="clock" />] : [];
    if (id === "countdown") return live ? [<CountdownText key="countdown" countdown={live} now={now} />] : [];
    return news;
  });
  if (phone.length === 0) return null;

  // Wide screens: the news is the middle column. Whatever comes before it in the order goes to the left column,
  // whatever comes after it to the right column. The two side columns are always equally wide, so the news
  // stays exactly in the middle of the bar. With no clock and no countdown there are no side columns.
  const cut = L.order.indexOf("news");
  const leftIds = cut < 0 ? L.order : L.order.slice(0, cut);
  const rightIds = cut < 0 ? [] : L.order.slice(cut + 1);
  const shows = (id: string) => (id === "clock" ? clockOn : id === "countdown" ? live !== null : false);
  const columns = leftIds.some(shows) || rightIds.some(shows)
    ? "grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)]"
    : "grid-cols-1";
  const side = (ids: string[], edge: "left" | "right") => (
    <div className={`flex min-w-0 items-center gap-3 ${edge === "left" ? "justify-start" : "justify-end"}`}>
      {ids.map((id) => {
        if (id === "clock") return clockOn ? <Clock key="clock" /> : null;
        if (id === "countdown") {
          return live ? (
            <div
              key="countdown"
              className={`flex h-4 min-w-0 max-w-[16rem] items-center border-band-line ${edge === "left" ? "border-r pr-3" : "border-l pl-3"}`}
            >
              <CountdownText countdown={live} now={now} />
            </div>
          ) : null;
        }
        return null;
      })}
    </div>
  );

  return (
    <div role="region" aria-label="News" className="site-bar-in relative z-40 border-b border-band-line bg-band text-xs text-band-ink">
      <div className={`${wrap} hidden h-9 items-center gap-3 px-3 sm:grid ${columns}`}>
        {columns !== "grid-cols-1" && side(leftIds, "left")}
        <div className="h-9 min-w-0">
          {news.length > 0 && (
            <Slides
              slides={news}
              seconds={secs}
              autoplay={autoplay}
              small={live !== null}
              motion={L.motion}
              ms={L.ms}
            />
          )}
        </div>
        {columns !== "grid-cols-1" && side(rightIds, "right")}
      </div>
      <div className="mx-auto flex h-9 max-w-6xl items-center gap-3 px-3 sm:hidden">
        <Slides slides={phone} seconds={secs} autoplay={autoplay} small motion={L.motion} ms={L.ms} />
      </div>
    </div>
  );
}

const bandBox: Record<FooterBandSize, string> = {
  small: "h-5 text-[11px]",
  normal: "h-6 text-xs",
  large: "h-7 text-sm",
  huge: "h-8 text-base",
};

// The same news inside the black band of the footer. It is narrow, so the clock and the countdown
// are slides of the same slider as the news. Which parts show, their order and the motion come from `band`.
export function NewsTicker({ items, seconds, autoplay, showClock = false, countdown = null, band }: NewsProps) {
  const B = band ?? footerBandDefaults;
  const now = useNow();
  const clockOn = showClock && B.show.clock;
  const live = B.show.countdown && countdown && isLive(countdown, now) ? countdown : null;
  const news = B.show.news ? items.map((item, i) => <NewsLine key={`${item.text}-${i}`} item={item} />) : [];

  const slides: ReactNode[] = B.order.flatMap((id): ReactNode[] => {
    if (id === "clock") return clockOn ? [<Clock key="clock" />] : [];
    if (id === "countdown") return live ? [<CountdownText key="countdown" countdown={live} now={now} />] : [];
    return news;
  });
  if (slides.length === 0) return null;

  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2 ${bandBox[B.size]}`}>
      <Slides
        slides={slides}
        seconds={B.seconds > 0 ? B.seconds : seconds}
        autoplay={autoplay}
        small
        motion={B.motion}
        ms={B.ms}
        gap="gap-2"
      />
    </div>
  );
}