"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { countdownConfig } from "@/config/countdown";
import type {
  CountdownView,
  CountdownWideView,
  DesignFont,
  DesignIntroSize,
  DesignMode,
  DesignTitleAlign,
  DesignTitleSize,
} from "@/config/layout";
import { countdownStage } from "@/lib/countdown";
import { family, introAuto, introSizes, titleSizes } from "./DesignHeading";

type Props = {
  title: string;
  description: string | null;
  // The day it counts down to, and the day the countdown was made (where the 20% and 10% steps are measured from).
  target: string;
  start: string;
  // Chosen in Customize (Sections, Countdown). Left out = the original: Centered, Section.
  mode?: DesignMode;
  // Centered: "section" = the full block, "strip" = one thin line, "clock" = four big numbers stacked.
  view?: CountdownView;
  // Full width: "giant" = four huge numbers edge to edge, "edge" = one thin line edge to edge.
  wideView?: CountdownWideView;
  titleAlign?: DesignTitleAlign;
  titleFont?: DesignFont;
  titleSize?: DesignTitleSize;
  introFont?: DesignFont;
  introSize?: DesignIntroSize;
};

const pad = (n: number) => String(n).padStart(2, "0");

// One shared second counter. It is 0 on the server and on the first browser render, so both HTML versions match.
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}
const getNow = () => Math.floor(Date.now() / 1000);
const getServerNow = () => 0;

// The message, the title and the text under it. Centered = the original (all in the middle of the page).
// Left edge and Right edge stick to that side of the screen. Full puts the title left and the text right.
function Head({
  title,
  description,
  message,
  align,
  titleStyle,
  introStyle,
}: {
  title: string;
  description: string | null;
  message: string;
  align: DesignTitleAlign;
  titleStyle?: CSSProperties;
  introStyle?: CSSProperties;
}) {
  const text = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  const pull = align === "right" ? "ml-auto" : align === "center" ? "mx-auto" : "";
  const titleEl = (
    <>
      <p className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-accent">
        <span aria-hidden className="size-1.5 rounded-full bg-accent" />
        <span>{message}</span>
      </p>
      <h2 className="mt-5 break-words font-voice text-4xl leading-none sm:text-6xl" style={titleStyle}>
        {title}
      </h2>
    </>
  );
  const introEl = description ? (
    <p
      className={`mt-4 max-w-md whitespace-pre-line text-ink-soft ${pull} ${align === "full" ? "md:ml-auto md:text-right" : ""}`}
      style={introStyle}
    >
      {description}
    </p>
  ) : null;

  if (align === "full") {
    return (
      <div className={`${text} grid gap-x-10 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:items-end`}>
        <div className="min-w-0">{titleEl}</div>
        {introEl && <div className="min-w-0">{introEl}</div>}
      </div>
    );
  }
  return (
    <div className={text}>
      {titleEl}
      {introEl}
    </div>
  );
}

export function HomeCountdown({
  title,
  description,
  target,
  start,
  mode = "centered",
  view = "section",
  wideView = "giant",
  titleAlign = "center",
  titleFont = "default",
  titleSize = "auto",
  introFont = "default",
  introSize = "auto",
}: Props) {
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);
  const end = Math.floor(new Date(target).getTime() / 1000);
  const begin = Math.floor(new Date(start).getTime() / 1000);
  if (!Number.isFinite(end) || !Number.isFinite(begin)) return null;

  const ready = now > 0;
  const left = Math.max(0, end - now);
  const stage = countdownStage(begin, end, now);
  const days = Math.floor(left / 86400);
  const parts: [string, number][] = [
    ["Days", days],
    ["Hours", Math.floor((left % 86400) / 3600)],
    ["Minutes", Math.floor((left % 3600) / 60)],
    ["Seconds", left % 60],
  ];
  const wide = mode === "full";
  const thin = wide ? wideView === "edge" : view === "strip";

  // The two thin lines: Strip (Centered, the original) and Edge strip (Full width).
  if (thin) {
    const time = `${days > 0 ? `${days}d ` : ""}${pad(Math.floor((left % 86400) / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
    const shown = ready ? (stage === "done" ? countdownConfig.messages.done : time) : "--";
    const label = (
      <p className="flex min-w-0 items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em]">
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
        <span className="truncate">{title}</span>
      </p>
    );
    const clock = (
      <p role="timer" className="shrink-0 font-voice text-xl tabular-nums leading-none sm:text-2xl">
        {shown}
      </p>
    );
    if (wide) {
      return (
        <section id="countdown" aria-label={title} className="site-strip-pt">
          <div className="site-media-pop flex items-baseline justify-between gap-4 border-y border-line px-5 pt-4 site-strip-pb sm:px-8">
            {label}
            {clock}
          </div>
        </section>
      );
    }
    return (
      <section id="countdown" aria-label={title} className="site-strip-pt px-5 sm:px-8">
        <div className="site-media-pop mx-auto flex max-w-5xl items-baseline justify-between gap-4 border-b-2 border-tertiary pt-4 site-strip-pb">
          {label}
          {clock}
        </div>
      </section>
    );
  }

  // Default font and size give no style at all, so the original look stays exactly the same.
  const titleStyle: CSSProperties | undefined =
    titleFont !== "default" || titleSize !== "auto"
      ? {
          fontFamily: titleFont !== "default" ? family(titleFont) : undefined,
          fontSize: titleSize !== "auto" ? titleSizes[titleSize] : undefined,
        }
      : undefined;
  const introFontSize =
    introSize !== "auto" ? introSizes[introSize] : titleSize !== "auto" ? introAuto[titleSize] : undefined;
  const introStyle: CSSProperties | undefined =
    introFont !== "default" || introFontSize
      ? { fontFamily: introFont !== "default" ? family(introFont) : undefined, fontSize: introFontSize }
      : undefined;
  const message = countdownConfig.messages[stage];
  const head = (
    <Head
      title={title}
      description={description}
      message={message}
      align={titleAlign}
      titleStyle={titleStyle}
      introStyle={introStyle}
    />
  );
  const centerBox = titleAlign === "center" ? "mx-auto max-w-5xl px-4" : "";

  // Full width, Giant: the four numbers huge, edge to edge. All four have the same size, which shrinks for 100+ days.
  if (wide) {
    const digits = ready ? Math.max(2, String(days).length) : 2;
    const giant = `clamp(2rem, ${Math.floor(320 / digits) / 10}vw, 14rem)`;
    return (
      <section id="countdown" aria-label={title} className="site-pt-s">
        <div className="site-media-pop border-b-2 border-tertiary site-py-xs">
          <div className={`px-5 sm:px-8 ${titleAlign === "center" ? "mx-auto max-w-5xl" : ""}`}>{head}</div>
          <div role="timer" className="mt-10 grid grid-cols-4 border-y border-line text-center">
            {parts.map(([name, value]) => (
              <div key={name} className="min-w-0 border-l border-line px-1 py-6 first:border-l-0 sm:py-10">
                <p className="font-voice tabular-nums leading-none" style={{ fontSize: giant }}>
                  {ready ? pad(value) : "--"}
                </p>
                <p className="mt-3 font-mono text-[clamp(7px,2.2vw,11px)] uppercase tracking-[0.1em] text-ink-soft sm:tracking-[0.2em]">
                  {name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Centered, Clock: four big numbers, one under the other, each with its label on the right.
  if (view === "clock") {
    return (
      <section id="countdown" aria-label={title} className="px-5 site-pt-s sm:px-8">
        <div className={`site-media-pop ${centerBox} border-b-2 border-tertiary site-py-xs`}>
          {head}
          <div role="timer" className="mt-10 border-t border-line">
            {parts.map(([name, value]) => (
              <div key={name} className="flex items-baseline justify-between gap-4 border-b border-line py-3 sm:py-4">
                <p className="font-voice text-[clamp(3.5rem,20vw,9rem)] tabular-nums leading-none">
                  {ready ? pad(value) : "--"}
                </p>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Centered, Section: the original block.
  const gridPos = titleAlign === "center" ? "mx-auto" : titleAlign === "right" ? "ml-auto" : "";
  return (
    <section id="countdown" aria-label={title} className="px-5 site-pt-s sm:px-8">
      <div className={`site-media-pop ${centerBox} border-b-2 border-tertiary site-py-xs`}>
        {head}
        <div role="timer" className={`${gridPos} mt-10 grid max-w-xl grid-cols-4 text-center`}>
          {parts.map(([name, value]) => (
            <div key={name} className="min-w-0 border-l border-line px-1 first:border-l-0 sm:px-2">
              <p className="font-voice text-[clamp(1.75rem,9.5vw,3.75rem)] tabular-nums leading-none">
                {ready ? pad(value) : "--"}
              </p>
              <p className="mt-2 font-mono text-[clamp(7px,2.2vw,11px)] uppercase tracking-[0.1em] text-ink-soft sm:tracking-[0.2em]">
                {name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}