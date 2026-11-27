import type { CSSProperties } from "react";
import type { ShowcaseWideView } from "@/config/layout";
import { routes } from "@/config/site";
import { pickShowcase, pickStack, readProjectItem, type ProjectFile, type ProjectItem } from "@/lib/item-data";
import type { Block } from "@/types/block";
import { Downloads, TextLinks } from "./Downloads";
import { MediaSlider } from "./MediaSlider";
import { ItemMedia } from "./ProjectCard";
import { Reveal } from "./Reveal";

type Entry = {
  block: Block;
  item: ProjectItem;
  main: ProjectFile | null;
  photos: ProjectFile[];
  // The one media the Stack layouts show.
  stack: ProjectFile | null;
};

const shade: CSSProperties = { background: "linear-gradient(to top, rgb(0 0 0 / 0.62), transparent)" };

function prepare(blocks: Block[]): Entry[] {
  return blocks.map((block) => {
    const item = readProjectItem(block);
    const { main, photos } = pickShowcase(item.files);
    return { block, item, main, photos, stack: pickStack(item.files, item.stackMedia) };
  });
}

// Height of a photo frame: a fixed height in rem, or (0 = Auto) the shape that suits the layout.
function frame(height: number, aspect: string): CSSProperties {
  return height > 0 ? { height: `${height}rem` } : { aspectRatio: aspect };
}

// A project without a photo shows its title in the box.
function Empty({ title }: { title: string }) {
  return (
    <span className="absolute inset-0 flex items-end bg-highlight p-4 font-display text-2xl leading-tight">
      {title}
    </span>
  );
}

// The main media of a project in a box that has its own frame. The media fills the box.
function Frame({
  entry,
  eager,
  className = "",
  style,
}: {
  entry: Entry;
  eager: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`relative w-full overflow-hidden bg-surface ${className}`} style={style}>
      {entry.main ? <ItemMedia file={entry.main} eager={eager} inFrame /> : <Empty title={entry.item.title} />}
    </div>
  );
}

const stripColumns = ["", "grid-cols-1", "grid-cols-2", "grid-cols-2 sm:grid-cols-3"] as const;

// The documentation photos (up to 3) in one tight row under the main media.
function Strip({ photos }: { photos: ProjectFile[] }) {
  if (photos.length === 0) return null;
  return (
    <Reveal variant="still">
      <ul className={`mt-px grid gap-px ${stripColumns[photos.length]}`}>
        {photos.map((file, i) => (
          <li
            key={file.url}
            className={`relative aspect-[4/3] overflow-hidden bg-surface ${
              photos.length === 3 && i === 2 ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <ItemMedia file={file} eager={false} inFrame index={i} />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function Title({ entry, className }: { entry: Entry; className: string }) {
  const heading = (
    <h3 className={`font-display leading-tight ${className}`}>
      <span className="site-sweep">{entry.item.title}</span>
    </h3>
  );
  return entry.item.url ? (
    <a href={routes.go(entry.block.id)} className="block">
      {heading}
    </a>
  ) : (
    heading
  );
}

// Text, Download buttons and text links of a project.
function Details({ item, clamp = false }: { item: ProjectItem; clamp?: boolean }) {
  return (
    <>
      {item.body && (
        <p className={`max-w-xl whitespace-pre-line text-ink-soft ${clamp ? "line-clamp-3 text-sm" : ""}`}>
          {item.body}
        </p>
      )}
      <Downloads links={item.downloads} className={clamp ? "mt-4" : "mt-6"} />
      <TextLinks links={item.links} className={clamp ? "mt-3" : "mt-4"} />
    </>
  );
}

type Shape = { entries: Entry[]; height: number };

// One project per row: ONE media across the whole screen (chosen in Pages), then title and text.
function Stack({
  entries,
  height,
  slide,
}: Shape & { slide?: { seconds: number; autoplay: boolean } }) {
  // With slide (Stack slide): the same project, one per screen, sliding by itself.
  const items = entries.map((e, i) => (
        <li key={e.block.id} className={slide ? "w-full shrink-0 snap-start" : undefined}>
          <Reveal variant="still">
            <Frame entry={{ ...e, main: e.stack }} eager={i === 0} style={frame(height, "16 / 9")} />
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-6 grid gap-5 px-5 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-12">
              <Title entry={e} className="text-3xl sm:text-5xl" />
              <div>
                <Details item={e.item} />
              </div>
            </div>
          </Reveal>
        </li>
  ));
  if (slide) {
    return (
      <MediaSlider count={entries.length} seconds={slide.seconds} autoplay={slide.autoplay} bleed>
        {items}
      </MediaSlider>
    );
  }
  return <ul className="flex flex-col gap-16 sm:gap-28">{items}</ul>;
}

// Media on one half of the screen, text on the other. The sides swap on each project.
function Split({ entries, height }: Shape) {
  const style = height > 0 ? { height: `${height}rem` } : undefined;
  const ratio = height > 0 ? "" : "aspect-[4/3] md:aspect-[4/5]";
  return (
    <ul className="flex flex-col gap-16 sm:gap-24">
      {entries.map((e, i) => (
        <li key={e.block.id}>
          <div className="grid md:grid-cols-2">
            <Reveal variant="still" className={i % 2 === 1 ? "md:order-2" : undefined}>
              <Frame entry={e} eager={i === 0} className={ratio} style={style} />
            </Reveal>
            <Reveal delay={100} className="flex flex-col justify-center px-5 py-10 sm:px-8 md:px-14 md:py-16">
              <Title entry={e} className="text-3xl sm:text-4xl" />
              <div className="mt-5">
                <Details item={e.item} />
              </div>
            </Reveal>
          </div>
          <Strip photos={e.photos} />
        </li>
      ))}
    </ul>
  );
}

// One row of tall panels that slides sideways.
function Filmstrip({
  entries,
  height,
  slide,
}: Shape & { slide: { seconds: number; autoplay: boolean } }) {
  return (
    <MediaSlider count={entries.length} seconds={slide.seconds} autoplay={slide.autoplay} inset>
      {entries.map((e, i) => (
        <li key={e.block.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
          <Reveal variant="still">
            <Frame entry={e} eager={i === 0} style={frame(height, "3 / 4")} />
            <div className="pt-4">
              <Title entry={e} className="text-xl sm:text-2xl" />
              <div className="mt-2">
                <Details item={e.item} clamp />
              </div>
            </div>
          </Reveal>
        </li>
      ))}
    </MediaSlider>
  );
}

// A photo tile with the title over its bottom. It opens the project link when there is one.
function Tile({
  entry,
  className,
  style,
  hover,
  eager,
}: {
  entry: Entry;
  className: string;
  style?: CSSProperties;
  hover: boolean;
  eager: boolean;
}) {
  const { block, item, main } = entry;
  const inner = (
    <>
      {main ? <ItemMedia file={main} eager={eager} inFrame /> : <Empty title={item.title} />}
      {main && (
        <span
          className={`absolute inset-x-0 bottom-0 p-4 text-white sm:p-5 ${
            hover
              ? "transition-opacity duration-(--dur-base) md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100"
              : ""
          }`}
          style={shade}
        >
          <span className="block font-display text-xl leading-tight sm:text-2xl">{item.title}</span>
        </span>
      )}
    </>
  );
  const cls = `group relative block overflow-hidden bg-surface ${className}`;
  return item.url ? (
    <a href={routes.go(block.id)} className={cls} style={style}>
      {inner}
    </a>
  ) : (
    <div className={cls} style={style}>
      {inner}
    </div>
  );
}

const sheetColumns: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3",
};

// Square photos that touch each other. The title shows on hover (always on a phone).
function Sheet({ entries, height }: Shape) {
  const style = height > 0 ? { height: `${height}rem` } : undefined;
  const ratio = height > 0 ? "" : "aspect-square";
  return (
    <ul className={`grid gap-px ${sheetColumns[Math.min(Math.max(entries.length, 1), 5)]}`}>
      {entries.map((e, i) => (
        <li key={e.block.id} className="min-w-0">
          <Reveal variant="still">
            <Tile entry={e} className={ratio} style={style} hover eager={i === 0} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// How many of the 12 columns each tile takes on a wide screen. Every row adds up to 12.
const mosaicSpans: Record<number, string[]> = {
  1: ["lg:col-span-12"],
  2: ["lg:col-span-7", "lg:col-span-5"],
  3: ["lg:col-span-7", "lg:col-span-5", "lg:col-span-12"],
  4: ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"],
  5: ["lg:col-span-7", "lg:col-span-5", "lg:col-span-4", "lg:col-span-4", "lg:col-span-4"],
};

// Photos of different sizes in one tight grid. One column on a phone.
function Mosaic({ entries, height }: Shape) {
  const spans = mosaicSpans[Math.min(Math.max(entries.length, 1), 5)];
  const vars = { "--tile-h": `${height > 0 ? height : 28}rem` } as CSSProperties;
  return (
    <ul className="grid grid-cols-1 gap-px lg:grid-cols-12" style={vars}>
      {entries.map((e, i) => (
        <li key={e.block.id} className={`min-w-0 ${spans[i] ?? "lg:col-span-6"}`}>
          <Reveal variant="still">
            <Tile
              entry={e}
              className="aspect-[4/3] lg:aspect-auto lg:h-[var(--tile-h)]"
              hover={false}
              eager={i === 0}
            />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// The Full width forms of the Showcase section (edge to edge, no side space). Chosen in Customize.
export function ShowcaseWide({
  view,
  blocks,
  height,
  slide,
}: {
  view: ShowcaseWideView;
  blocks: Block[];
  height: number;
  slide: { seconds: number; autoplay: boolean };
}) {
  const entries = prepare(blocks);
  if (entries.length === 0) return null;
  if (view === "split") return <Split entries={entries} height={height} />;
  if (view === "filmstrip") return <Filmstrip entries={entries} height={height} slide={slide} />;
  if (view === "sheet") return <Sheet entries={entries} height={height} />;
  if (view === "mosaic") return <Mosaic entries={entries} height={height} />;
  if (view === "stackslide") return <Stack entries={entries} height={height} slide={slide} />;
  return <Stack entries={entries} height={height} />;
}