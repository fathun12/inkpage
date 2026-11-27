import type { ReactNode } from "react";
import { Img } from "@/components/ui/Img";
import type {
  DesignFont,
  DesignIntroSize,
  DesignMode,
  DesignTitleAlign,
  DesignTitleSize,
  LinksView,
  LinksWideView,
} from "@/config/layout";
import { routes } from "@/config/site";
import { mediaKind } from "@/lib/site-view";
import type { Block } from "@/types/block";
import { Credit } from "./Credit";
import { DesignHeading } from "./DesignHeading";
import { hostOf, IndexSection, isDownload } from "./IndexSection";
import { MediaSlider } from "./MediaSlider";
import { Reveal } from "./Reveal";

type Item = { block: Block; number: number | null };
type RowKind = "index" | "table" | "edge" | "giant";

const two = (n: number) => String(n).padStart(2, "0");

// Header blocks keep no number; every other block counts 1, 2, 3 ...
function numbered(blocks: Block[]): Item[] {
  const list: Item[] = [];
  let count = 0;
  for (const block of blocks) {
    if (block.type === "header") {
      list.push({ block, number: null });
    } else {
      count += 1;
      list.push({ block, number: count });
    }
  }
  return list;
}

const rowClass: Record<RowKind, string> = {
  index: "group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-4 py-6",
  table: "group grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-4 py-3.5",
  edge: "group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-4 px-5 py-6 sm:px-8",
  giant: "group grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-4 px-5 py-3 sm:px-8 sm:py-4",
};

const titleClass: Record<RowKind, string> = {
  index:
    "block font-display text-3xl leading-tight transition-transform duration-(--dur-base) group-hover:translate-x-2 sm:text-5xl",
  table: "block truncate font-display text-xl leading-tight sm:text-2xl",
  edge:
    "block font-display text-3xl leading-tight transition-transform duration-(--dur-base) group-hover:translate-x-2 sm:text-5xl",
  giant:
    "block break-words font-display text-[clamp(2.5rem,11vw,9rem)] leading-[0.95] tracking-tight transition-transform duration-(--dur-base) group-hover:translate-x-4",
};

// One row of the list: a thin line on top, the number, the title and the site name. Clicks go through /go/<id>.
function Row({ item, index, kind }: { item: Item; index: number; kind: RowKind }) {
  const { block, number } = item;
  const pad = kind === "edge" || kind === "giant" ? "px-5 sm:px-8" : "";

  if (number === null) {
    return (
      <li className={`pb-3 pt-12 first:pt-0 ${pad}`}>
        <Reveal>
          <p className="font-mono text-xs opacity-70">{block.title}</p>
        </Reveal>
      </li>
    );
  }

  const download = isDownload(block.url);
  const host = hostOf(block.url);
  const showBody = kind === "index" || kind === "edge";
  const content = (
    <>
      <span className="text-sm font-medium text-accent">{number}</span>
      <span className="min-w-0">
        <span className={titleClass[kind]}>{block.title}</span>
        {showBody && block.body && <span className="mt-2 block max-w-xl text-sm opacity-70">{block.body}</span>}
      </span>
      <span className="flex items-baseline gap-4">
        {kind !== "giant" && (
          <span className="hidden font-mono text-xs opacity-60 sm:block">
            {download ? `Download · ${host}` : host}
          </span>
        )}
        <span
          aria-hidden
          className="font-display text-2xl transition-transform duration-(--dur-base) group-hover:translate-x-1 group-hover:-translate-y-1"
        >
          {download ? "↓" : "↗"}
        </span>
      </span>
    </>
  );

  return (
    <li>
      <Reveal delay={Math.min(index, 8) * 70} className="relative">
        <span aria-hidden className="site-line" />
        {block.url ? (
          <a href={routes.go(block.id)} className={rowClass[kind]}>
            {content}
          </a>
        ) : (
          <div className={rowClass[kind]}>{content}</div>
        )}
      </Reveal>
    </li>
  );
}

function Rows({ items, kind }: { items: Item[]; kind: RowKind }) {
  const wide = kind === "edge" || kind === "giant";
  return (
    <ul className={`relative flex flex-col ${wide ? "" : "mx-auto max-w-5xl px-5 sm:px-8"}`}>
      {items.map((item, i) => (
        <Row key={item.block.id} item={item} index={i} kind={kind} />
      ))}
    </ul>
  );
}

// One link at a time. It slides by itself (MediaSlider). Header blocks are left out.
function Slides({ items, seconds, wide }: { items: Item[]; seconds: number; wide: boolean }) {
  const links = items.filter((item) => item.number !== null);
  if (links.length === 0) return null;
  const tile = `group flex flex-col justify-between gap-10 border-y border-white/25 py-8 sm:py-12 ${
    wide ? "min-h-[22rem] px-5 sm:min-h-[26rem] sm:px-8" : "min-h-[16rem] sm:min-h-[20rem]"
  }`;
  const titleSize = wide ? "text-[clamp(2.5rem,11vw,9rem)]" : "text-[clamp(2rem,7vw,4.5rem)]";
  return (
    <div className={wide ? "" : "mx-auto max-w-5xl px-5 sm:px-8"}>
      <MediaSlider count={links.length} seconds={seconds} bleed={wide}>
        {links.map(({ block, number }) => {
          const download = isDownload(block.url);
          const content = (
            <>
              <span className="font-mono text-[11px] tracking-widest opacity-70">
                {two(number ?? 0)} / {two(links.length)}
              </span>
              <span className="block min-w-0">
                <span
                  className={`block break-words font-display leading-[0.95] tracking-tight underline-offset-8 group-hover:underline ${titleSize}`}
                >
                  {block.title}
                </span>
                {block.body && <span className="mt-5 block max-w-2xl text-lg opacity-70">{block.body}</span>}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest opacity-70">
                {download ? `Download · ${hostOf(block.url)}` : hostOf(block.url)} {download ? "↓" : "↗"}
              </span>
            </>
          );
          return (
            <li key={block.id} className="w-full shrink-0 snap-start">
              {block.url ? (
                <a href={routes.go(block.id)} className={tile}>
                  {content}
                </a>
              ) : (
                <div className={tile}>{content}</div>
              )}
            </li>
          );
        })}
      </MediaSlider>
    </div>
  );
}

type Props = {
  blocks: Block[];
  mediaUrl: string | null;
  credit?: string | null;
  // The label above the list and the text under it (written in Pages). Empty = no title, the original.
  title?: string | null;
  intro?: string | null;
  // Seconds between slides (Slider and Link slide).
  seconds?: number;
  // Chosen in Customize (Sections, Links). Left out = the original: Centered, Index.
  mode?: DesignMode;
  view?: LinksView;
  wideView?: LinksWideView;
  titleAlign?: DesignTitleAlign;
  titleFont?: DesignFont;
  titleSize?: DesignTitleSize;
  introFont?: DesignFont;
  introSize?: DesignIntroSize;
};

// The Links section of Home: the list of links over the Index media, on black.
// Centered + Index + no title = exactly the original IndexSection.
export function HomeLinks({
  blocks,
  mediaUrl,
  credit = null,
  title = null,
  intro = null,
  seconds = 5,
  mode = "centered",
  view = "index",
  wideView = "edge",
  titleAlign = "center",
  titleFont = "default",
  titleSize = "auto",
  introFont = "default",
  introSize = "auto",
}: Props) {
  const wide = mode === "full";
  // A text under the title without a label gets the title "Links".
  const heading = title || (intro ? "Links" : null);

  if (!wide && view === "index" && !heading) {
    return <IndexSection blocks={blocks} mediaUrl={mediaUrl} credit={credit} />;
  }

  const items = numbered(blocks);
  let body: ReactNode;
  if (wide) {
    body =
      wideView === "slide" ? (
        <Slides items={items} seconds={seconds} wide />
      ) : (
        <Rows items={items} kind={wideView === "giant" ? "giant" : "edge"} />
      );
  } else {
    body =
      view === "slider" ? (
        <Slides items={items} seconds={seconds} wide={false} />
      ) : (
        <Rows items={items} kind={view === "table" ? "table" : "index"} />
      );
  }

  return (
    <section id="work" className="site-index relative overflow-hidden">
      {mediaUrl && (
        <>
          <Reveal variant="still" className="absolute inset-0">
            {mediaKind(mediaUrl) === "video" ? (
              <video
                src={mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden
                className="site-media-reveal site-index-media size-full object-cover"
              />
            ) : (
              <Img src={mediaUrl} className="site-media-reveal site-index-media size-full object-cover" />
            )}
          </Reveal>
          <div aria-hidden className="site-index-veil absolute inset-0" />
          <Credit text={credit} />
        </>
      )}
      <div className="site-index-pad relative">
        {heading && (
          <DesignHeading
            title={heading}
            href={null}
            intro={intro}
            align={titleAlign}
            font={titleFont}
            size={titleSize}
            introFont={introFont}
            introSize={introSize}
            tone="band"
          />
        )}
        {body}
      </div>
    </section>
  );
}