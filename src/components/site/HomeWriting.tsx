import type { CSSProperties, ReactNode } from "react";
import { Img } from "@/components/ui/Img";
import {
  stackAspect,
  type DesignFont,
  type DesignIntroSize,
  type DesignMode,
  type DesignTitleAlign,
  type DesignTitleSize,
  type StackRatio,
  type WritingSize,
  type WritingView,
  type WritingWideView,
} from "@/config/layout";
import { routes } from "@/config/site";
import { readWritingItem } from "@/lib/item-data";
import type { Block } from "@/types/block";
import { CardSlider } from "./CardSlider";
import { DesignHeading } from "./DesignHeading";
import { MediaSlider } from "./MediaSlider";
import { Reveal } from "./Reveal";
import { WritingCard } from "./WritingCard";

type Entry = { block: Block; item: ReturnType<typeof readWritingItem> };

// Cards per row in the Grid layout.
const gridColumns: Record<WritingSize, string> = {
  large: "sm:grid-cols-2",
  medium: "sm:grid-cols-2 lg:grid-cols-3",
  small: "sm:grid-cols-2 lg:grid-cols-4",
};

type Props = {
  items: Block[];
  title: string | null;
  seconds: number;
  // Not used any more: a row with more than one card always slides by itself.
  autoplay?: boolean;
  spacing?: string;
  id?: string;
  // Chosen in Customize (Sections, Writing). Left out = the original: Centered, Slider.
  mode?: DesignMode;
  view?: WritingView;
  wideView?: WritingWideView;
  size?: WritingSize;
  // Height of the Stack photo in rem. 0 = Auto (16:9, or the Ratio).
  mediaHeight?: number;
  stackRatio?: StackRatio;
  stackCrop?: number;
  intro?: string | null;
  titleAlign?: DesignTitleAlign;
  titleFont?: DesignFont;
  titleSize?: DesignTitleSize;
  introFont?: DesignFont;
  introSize?: DesignIntroSize;
};

// The frame of the Stack photo. Default = a fixed height or 16:9. Another ratio sets the shape; crop (0 top to
// 100 bottom) is which part of the photo shows (--crop is read by the photo as object-position).
function stackFrame(height: number, ratio: StackRatio, crop: number): CSSProperties {
  if (ratio === "default") return height > 0 ? { height: `${height}rem` } : { aspectRatio: "16 / 9" };
  const style: Record<string, string> = { aspectRatio: stackAspect[ratio] };
  if (ratio !== "normal") style["--crop"] = `50% ${crop}%`;
  return style as CSSProperties;
}

// One writing is one link (counted by /go, opens a new tab). Without a link it is plain text.
function Linked({ entry, className, children }: { entry: Entry; className: string; children: ReactNode }) {
  return entry.item.url ? (
    <a href={routes.go(entry.block.id)} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );
}

// One writing per row, only type: a big title, a short text, and the source at the right. No photos.
function List({ entries }: { entries: Entry[] }) {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <ul className="border-b border-line">
        {entries.map((e) => (
          <li key={e.block.id} className="border-t border-line">
            <Reveal>
              <Linked
                entry={e}
                className="group grid gap-3 py-7 sm:py-9 md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)] md:gap-10"
              >
                <span className="block min-w-0">
                  <span className="block font-display text-3xl leading-tight sm:text-4xl">
                    <span className="site-sweep">{e.item.title}</span>
                  </span>
                  {e.item.body && (
                    <span className="mt-3 line-clamp-2 block max-w-xl text-ink-soft">{e.item.body}</span>
                  )}
                </span>
                {e.item.source && (
                  <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft md:text-right">
                    {e.item.source}
                  </span>
                )}
              </Linked>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Grid({ entries, size }: { entries: Entry[]; size: WritingSize }) {
  return (
    <ul className={`mx-auto grid max-w-6xl gap-x-8 gap-y-14 px-5 sm:px-8 ${gridColumns[size]}`}>
      {entries.map((e, i) => (
        <li key={e.block.id}>
          <Reveal delay={Math.min(i, 4) * 80}>
            <WritingCard block={e.block} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// One writing per row: ONE photo across the whole screen, then the title and the text. A writing without a photo
// shows its title big on a tinted box (and the title is not repeated under it).
// With "slide" (Stack slide): the same, one writing per screen, sliding by itself.
function Stack({
  entries,
  height,
  ratio,
  crop,
  slide,
}: {
  entries: Entry[];
  height: number;
  ratio: StackRatio;
  crop: number;
  slide?: { seconds: number };
}) {
  const rows = entries.map((e, i) => {
    const image = e.item.image;
    return (
      <li key={e.block.id} className={slide ? "w-full shrink-0" : undefined}>
        <Linked entry={e} className="group block">
          <Reveal variant="still">
            <div className="relative w-full overflow-hidden bg-surface" style={stackFrame(height, ratio, crop)}>
              {image ? (
                <Img
                  src={image}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 size-full object-cover [object-position:var(--crop,50%_50%)]"
                />
              ) : (
                <span className="absolute inset-0 flex items-end bg-highlight px-5 pb-6 font-display text-4xl leading-tight sm:px-8 sm:pb-10 sm:text-6xl">
                  <span className="site-sweep">{e.item.title}</span>
                </span>
              )}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-6 grid gap-5 px-5 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-12">
              {image ? (
                <span className="block font-display text-3xl leading-tight sm:text-5xl">
                  <span className="site-sweep">{e.item.title}</span>
                </span>
              ) : (
                <span />
              )}
              <span className="block">
                {e.item.source && (
                  <span className="block font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                    {e.item.source}
                  </span>
                )}
                {e.item.body && (
                  <span className="mt-3 block max-w-xl whitespace-pre-line text-ink-soft">{e.item.body}</span>
                )}
              </span>
            </div>
          </Reveal>
        </Linked>
      </li>
    );
  });
  if (slide) {
    return (
      <MediaSlider count={entries.length} seconds={slide.seconds} bleed>
        {rows}
      </MediaSlider>
    );
  }
  return <ul className="flex flex-col gap-16 sm:gap-28">{rows}</ul>;
}

// One row of cards that runs to the edges of the screen and slides by itself.
function Filmstrip({ entries, seconds }: { entries: Entry[]; seconds: number }) {
  return (
    <MediaSlider count={entries.length} seconds={seconds} inset>
      {entries.map((e) => (
        <li key={e.block.id} className="w-[82%] shrink-0 sm:w-[46%] lg:w-[31%]">
          <Reveal variant="still">
            <WritingCard block={e.block} />
          </Reveal>
        </li>
      ))}
    </MediaSlider>
  );
}

// The Writing section of Home. Centered + Slider = the original (CardSlider, nothing changes).
// The other layouts draw the title with DesignHeading, like Showcase.
export function HomeWriting({
  items,
  title,
  seconds,
  spacing = "site-py",
  id = "selected",
  mode = "centered",
  view = "slider",
  wideView = "stack",
  size = "large",
  mediaHeight = 0,
  stackRatio = "default",
  stackCrop = 50,
  intro = null,
  titleAlign = "center",
  titleFont = "default",
  titleSize = "auto",
  introFont = "default",
  introSize = "auto",
}: Props) {
  if (items.length === 0) return null;
  const label = title ?? "Writing";
  const heading = (
    <DesignHeading
      title={label}
      href={null}
      intro={intro}
      align={titleAlign}
      font={titleFont}
      size={titleSize}
      introFont={introFont}
      introSize={introSize}
    />
  );
  const wide = mode === "full";

  if (!wide && view === "slider") {
    const custom = titleAlign !== "center" || titleFont !== "default" || titleSize !== "auto" || Boolean(intro);
    return (
      <CardSlider
        items={items}
        title={title}
        seconds={seconds}
        spacing={spacing}
        id={id}
        heading={custom ? heading : undefined}
      />
    );
  }

  const entries: Entry[] = items.map((block) => ({ block, item: readWritingItem(block) }));
  return (
    <section id={id} aria-label={label} className={spacing}>
      {heading}
      {wide && wideView === "filmstrip" && <Filmstrip entries={entries} seconds={seconds} />}
      {wide && wideView === "stackslide" && (
        <Stack entries={entries} height={mediaHeight} ratio={stackRatio} crop={stackCrop} slide={{ seconds }} />
      )}
      {wide && wideView === "stack" && (
        <Stack entries={entries} height={mediaHeight} ratio={stackRatio} crop={stackCrop} />
      )}
      {!wide && view === "list" && <List entries={entries} />}
      {!wide && view === "grid" && <Grid entries={entries} size={size} />}
    </section>
  );
}