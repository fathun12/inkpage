import type { CSSProperties } from "react";
import { stackAspect, type ProjectWideView, type StackRatio } from "@/config/layout";
import { routes } from "@/config/site";
import { pickHomeMedia, readProjectItem, type ProjectFile, type ProjectItem } from "@/lib/item-data";
import type { Block } from "@/types/block";
import { Downloads, TextLinks } from "./Downloads";
import { MediaSlider } from "./MediaSlider";
import { ItemMedia } from "./ProjectCard";
import { Reveal } from "./Reveal";

type Entry = {
  block: Block;
  item: ProjectItem;
  // The two media of a project on Home: A = the first photo, B = the first GIF or video (or the second photo).
  a: ProjectFile | null;
  b: ProjectFile | null;
};
type Slide = { seconds: number; autoplay: boolean };
type Shape = { entries: Entry[]; height: number };

const shade: CSSProperties = { background: "linear-gradient(to top, rgb(0 0 0 / 0.62), transparent)" };

function prepare(blocks: Block[]): Entry[] {
  return blocks
    .filter((block) => block.type !== "header")
    .map((block) => {
      const item = readProjectItem(block);
      const { a, b } = pickHomeMedia(item.files);
      return { block, item, a, b };
    });
}

const two = (n: number) => String(n).padStart(2, "0");

// Height of a photo frame: a fixed height in rem, or (0 = Auto) the shape that suits the layout.
function frame(height: number, aspect: string): CSSProperties {
  return height > 0 ? { height: `${height}rem` } : { aspectRatio: aspect };
}

// The frame of the Stack photo. Default = 16:9 or the Photo height. Another ratio sets the shape; crop (0 top to
// 100 bottom) is which part of the photo shows. --crop is read by the media (object-position).
function stackFrame(height: number, ratio: StackRatio, crop: number): CSSProperties {
  if (ratio === "default") return frame(height, "16 / 9");
  const style: Record<string, string> = { aspectRatio: stackAspect[ratio] };
  if (ratio !== "normal") style["--crop"] = `50% ${crop}%`;
  return style as CSSProperties;
}

// A project without a photo shows its title in the box.
function Empty({ title }: { title: string }) {
  return (
    <span className="absolute inset-0 flex items-end bg-highlight p-4 font-display text-2xl leading-tight">
      {title}
    </span>
  );
}

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
      {entry.a ? <ItemMedia file={entry.a} eager={eager} inFrame /> : <Empty title={entry.item.title} />}
    </div>
  );
}

function Count({ at, total }: { at: number; total: number }) {
  return (
    <span className="mb-3 block font-mono text-[11px] tracking-widest text-ink-soft">
      {two(at + 1)} / {two(total)}
    </span>
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

// One project per row: ONE photo across the whole screen, then its number, the title and the text.
// With slide (Stack slide): the same, one project per screen, sliding by itself.
function Stack({
  entries,
  height,
  slide,
  ratio,
  crop,
}: Shape & { slide?: Slide; ratio: StackRatio; crop: number }) {
  const items = entries.map((e, i) => (
    <li key={e.block.id} className={slide ? "w-full shrink-0 snap-start" : undefined}>
      <Reveal variant="still">
        <Frame entry={e} eager={i === 0} style={stackFrame(height, ratio, crop)} />
      </Reveal>
      <Reveal delay={100}>
        <div className="mt-6 grid gap-5 px-5 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-12">
          <div>
            <Count at={i} total={entries.length} />
            <Title entry={e} className="text-3xl sm:text-5xl" />
          </div>
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

// Photo on one half of the screen, text on the other. The sides swap on each project.
// The second media (B) is a thin strip under the photo.
function Split({ entries, height }: Shape) {
  const style = height > 0 ? { height: `${height}rem` } : undefined;
  const ratio = height > 0 ? "" : "aspect-[4/3] md:aspect-[4/5]";
  return (
    <ul className="flex flex-col gap-16 sm:gap-24">
      {entries.map((e, i) => (
        <li key={e.block.id} className="grid md:grid-cols-2">
          <Reveal variant="still" className={i % 2 === 1 ? "md:order-2" : undefined}>
            <Frame entry={e} eager={i === 0} className={ratio} style={style} />
            {e.b && (
              <div className="relative mt-px aspect-[16/9] w-full overflow-hidden bg-surface">
                <ItemMedia file={e.b} eager={false} inFrame index={1} />
              </div>
            )}
          </Reveal>
          <Reveal delay={100} className="flex flex-col justify-center px-5 py-10 sm:px-8 md:px-14 md:py-16">
            <Count at={i} total={entries.length} />
            <Title entry={e} className="text-3xl sm:text-4xl" />
            <div className="mt-5">
              <Details item={e.item} />
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// One row of tall panels that slides sideways by itself.
function Filmstrip({ entries, height, slide }: Shape & { slide: Slide }) {
  return (
    <MediaSlider count={entries.length} seconds={slide.seconds} autoplay={slide.autoplay} inset>
      {entries.map((e, i) => (
        <li key={e.block.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
          <Reveal variant="still">
            <Frame entry={e} eager={i === 0} style={frame(height, "3 / 4")} />
            <div className="pt-4">
              <Count at={i} total={entries.length} />
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

const sheetColumns: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3",
};

// A photo tile with the title over its bottom. It opens the project link when there is one.
function Tile({
  entry,
  className,
  style,
  eager,
}: {
  entry: Entry;
  className: string;
  style?: CSSProperties;
  eager: boolean;
}) {
  const { block, item, a } = entry;
  const inner = (
    <>
      {a ? <ItemMedia file={a} eager={eager} inFrame /> : <Empty title={item.title} />}
      {a && (
        <span
          className="absolute inset-x-0 bottom-0 p-4 text-white transition-opacity duration-(--dur-base) sm:p-5 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100"
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

// Square photos that touch each other, like a contact sheet. The title shows on hover (always on a phone).
function Sheet({ entries, height }: Shape) {
  const style = height > 0 ? { height: `${height}rem` } : undefined;
  const ratio = height > 0 ? "" : "aspect-square";
  return (
    <ul className={`grid gap-px ${sheetColumns[Math.min(Math.max(entries.length, 1), 5)]}`}>
      {entries.map((e, i) => (
        <li key={e.block.id} className="min-w-0">
          <Reveal variant="still">
            <Tile entry={e} className={ratio} style={style} eager={i === 0} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// The Full width forms of the Projects section (edge to edge, no side space). Chosen in Customize.
export function ProjectsWide({
  view,
  blocks,
  height,
  slide,
  ratio = "default",
  crop = 50,
}: {
  view: ProjectWideView;
  blocks: Block[];
  height: number;
  slide: Slide;
  ratio?: StackRatio;
  crop?: number;
}) {
  const entries = prepare(blocks);
  if (entries.length === 0) return null;
  if (view === "split") return <Split entries={entries} height={height} />;
  if (view === "filmstrip") return <Filmstrip entries={entries} height={height} slide={slide} />;
  if (view === "sheet") return <Sheet entries={entries} height={height} />;
  if (view === "stackslide") {
    return <Stack entries={entries} height={height} slide={slide} ratio={ratio} crop={crop} />;
  }
  return <Stack entries={entries} height={height} ratio={ratio} crop={crop} />;
}