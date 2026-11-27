import type { ReactNode } from "react";
import type {
  DesignFont,
  DesignIntroSize,
  DesignMode,
  DesignTitleAlign,
  DesignTitleSize,
  VisitSize,
  VisitView,
  VisitWideView,
} from "@/config/layout";
import type { VisitItem } from "@/config/site-content";
import { DesignHeading } from "./DesignHeading";
import { MediaSlider } from "./MediaSlider";
import { Reveal } from "./Reveal";
import { VisitCards } from "./VisitCards";

const button =
  "inline-flex items-center gap-2 border border-ink px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors duration-(--dur-base) hover:bg-ink hover:text-bg";

const two = (n: number) => String(n).padStart(2, "0");

// How many cards in a row (Centered, Grid). Medium is the original.
const gridCols: Record<VisitSize, string> = {
  small: "sm:grid-cols-2 lg:grid-cols-4",
  medium: "sm:grid-cols-2 lg:grid-cols-3",
  large: "sm:grid-cols-2",
};

// Centered, Grid: the original cards, with Size.
function Grid({ items, size }: { items: VisitItem[]; size: VisitSize }) {
  return (
    <ul className={`mx-auto grid max-w-5xl gap-x-8 gap-y-10 px-5 sm:px-8 site-pb ${gridCols[size]}`}>
      {items.map((item, i) => (
        <li key={`${item.url}-${i}`} className="border-t border-line pt-6">
          <Reveal variant="still" className="flex h-full flex-col items-start">
            <h3 className="font-display text-2xl leading-tight">{item.name}</h3>
            {item.body && <p className="mt-3 max-w-md whitespace-pre-line text-sm text-ink-soft">{item.body}</p>}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${item.name}`}
              className={`${button} mt-6`}
            >
              <span>Visit</span>
              <span aria-hidden>↗</span>
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// Centered Index and Full width Edge index: one site per row, the name big. "edge" runs the rows and lines to the screen edges.
function Rows({ items, edge }: { items: VisitItem[]; edge: boolean }) {
  const pad = edge ? "px-5 sm:px-8" : "";
  return (
    <ul className={`${edge ? "" : "mx-auto max-w-5xl px-5 sm:px-8"} site-pb`}>
      {items.map((item, i) => (
        <li key={`${item.url}-${i}`} className="border-t border-line last:border-b">
          <Reveal variant="still">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${item.name}`}
              className={`group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-baseline sm:py-7 ${pad}`}
            >
              <span className="font-mono text-[11px] tracking-widest text-ink-soft">{two(i + 1)}</span>
              <span className="min-w-0">
                <span className="block break-words font-display text-2xl leading-tight underline-offset-4 group-hover:underline sm:text-4xl">
                  {item.name}
                </span>
                {item.body && (
                  <span className="mt-2 block max-w-xl whitespace-pre-line text-sm text-ink-soft">{item.body}</span>
                )}
              </span>
              <span className="col-start-2 font-mono text-xs uppercase tracking-widest sm:col-auto">Visit ↗</span>
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// Full width, Stack: every site is a block across the whole screen, its name huge.
function Stack({ items }: { items: VisitItem[] }) {
  return (
    <ul className="site-pb">
      {items.map((item, i) => (
        <li key={`${item.url}-${i}`} className="border-t border-line last:border-b">
          <Reveal variant="still">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${item.name}`}
              className="group flex min-h-[16rem] flex-col justify-between gap-10 px-5 py-8 sm:min-h-[20rem] sm:px-8 sm:py-12"
            >
              <span className="font-mono text-[11px] tracking-widest text-ink-soft">
                {two(i + 1)} / {two(items.length)}
              </span>
              <span className="block min-w-0">
                <span className="block break-words font-display text-[clamp(2.5rem,11vw,9rem)] leading-[0.95] tracking-tight underline-offset-8 group-hover:underline">
                  {item.name}
                </span>
                {item.body && (
                  <span className="mt-5 block max-w-2xl whitespace-pre-line text-lg text-ink-soft">{item.body}</span>
                )}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest">Visit ↗</span>
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// Centered Slider and Full width Site slide: one site at a time. It slides by itself (MediaSlider).
function Slides({ items, seconds, wide }: { items: VisitItem[]; seconds: number; wide: boolean }) {
  const tile = `group flex flex-col justify-between gap-10 border-y border-line py-8 sm:py-12 ${
    wide ? "min-h-[22rem] px-5 sm:min-h-[26rem] sm:px-8" : "min-h-[16rem] sm:min-h-[20rem]"
  }`;
  const titleSize = wide ? "text-[clamp(2.5rem,11vw,9rem)]" : "text-[clamp(2rem,7vw,4.5rem)]";
  return (
    <div className={`site-pb ${wide ? "" : "mx-auto max-w-5xl px-5 sm:px-8"}`}>
      <MediaSlider count={items.length} seconds={seconds} bleed={wide}>
        {items.map((item, i) => (
          <li key={`${item.url}-${i}`} className="w-full shrink-0 snap-start">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${item.name}`}
              className={tile}
            >
              <span className="font-mono text-[11px] tracking-widest text-ink-soft">
                {two(i + 1)} / {two(items.length)}
              </span>
              <span className="block min-w-0">
                <span
                  className={`block break-words font-display leading-[0.95] tracking-tight underline-offset-8 group-hover:underline ${titleSize}`}
                >
                  {item.name}
                </span>
                {item.body && (
                  <span className="mt-5 block max-w-2xl whitespace-pre-line text-lg text-ink-soft">{item.body}</span>
                )}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest">Visit ↗</span>
            </a>
          </li>
        ))}
      </MediaSlider>
    </div>
  );
}

type Props = {
  items: VisitItem[];
  title: string;
  // The text under the title (written in Pages) and the look of the title and of that text (Customize).
  intro?: string | null;
  // Seconds between slides (Slider and Site slide).
  seconds?: number;
  // Chosen in Customize (Sections, Visit website). Left out = the original: Centered, Grid, Medium.
  mode?: DesignMode;
  view?: VisitView;
  wideView?: VisitWideView;
  size?: VisitSize;
  titleAlign?: DesignTitleAlign;
  titleFont?: DesignFont;
  titleSize?: DesignTitleSize;
  introFont?: DesignFont;
  introSize?: DesignIntroSize;
};

// The "Visit website" section of Home. Centered + Grid + Medium + the original title = exactly the look from before.
export function HomeVisit({
  items,
  title,
  intro = null,
  seconds = 5,
  mode = "centered",
  view = "grid",
  wideView = "edge",
  size = "medium",
  titleAlign = "center",
  titleFont = "default",
  titleSize = "auto",
  introFont = "default",
  introSize = "auto",
}: Props) {
  if (items.length === 0) return null;
  const wide = mode === "full";
  const custom = titleAlign !== "center" || titleFont !== "default" || titleSize !== "auto" || Boolean(intro);

  if (!wide && view === "grid" && size === "medium" && !custom) {
    return <VisitCards items={items} title={title} />;
  }

  let body: ReactNode;
  if (wide) {
    body =
      wideView === "slide" ? (
        <Slides items={items} seconds={seconds} wide />
      ) : wideView === "stack" ? (
        <Stack items={items} />
      ) : (
        <Rows items={items} edge />
      );
  } else {
    body =
      view === "slider" ? (
        <Slides items={items} seconds={seconds} wide={false} />
      ) : view === "index" ? (
        <Rows items={items} edge={false} />
      ) : (
        <Grid items={items} size={size} />
      );
  }

  return (
    <section id="visit" aria-label={title} className="site-pt">
      <DesignHeading
        title={title}
        href={null}
        intro={intro}
        align={titleAlign}
        font={titleFont}
        size={titleSize}
        introFont={introFont}
        introSize={introSize}
      />
      {body}
    </section>
  );
}