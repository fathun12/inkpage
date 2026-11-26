import { Img } from "@/components/ui/Img";
import { projectLayout, ratioAspect } from "@/config/item-data";
import { routes } from "@/config/site";
import { pickHomeMedia, readProjectItem, type ProjectFile } from "@/lib/item-data";
import type { Block } from "@/types/block";
import { Credit } from "./Credit";
import { Downloads, TextLinks } from "./Downloads";
import { MediaSlider } from "./MediaSlider";
import { Reveal } from "./Reveal";

type Props = {
  block: Block;
  mode: "home" | "page";
  first?: boolean;
  index?: number;
  total?: number;
  // Only the Projects page uses it: how the row of extra media slides.
  slide?: { seconds: number; autoplay: boolean };
};

// One media: the frame follows the Ratio of the file. No border, no shadow, sharp corners.
export function ItemMedia({ file, eager }: { file: ProjectFile; eager: boolean }) {
  const fill =
    "site-media-reveal absolute inset-0 size-full object-cover transition-[scale] duration-500 ease-out group-hover/media:scale-105 motion-reduce:transition-none motion-reduce:group-hover/media:scale-100";
  return (
    <div
      className="group/media relative w-full overflow-hidden bg-surface"
      style={{ aspectRatio: ratioAspect[file.ratio] }}
    >
      {file.kind === "video" ? (
        <video
          src={file.url}
          autoPlay
          muted
          loop
          playsInline
          preload={eager ? "auto" : "metadata"}
          aria-hidden
          className={fill}
        />
      ) : (
        <Img src={file.url} loading={eager ? "eager" : "lazy"} className={fill} />
      )}
      <Credit text={file.credit} />
    </div>
  );
}

// A project: at most two media on the left (the same two as on Home), text on the right. On a phone the media is on top.
// Two portrait media sit side by side; anything else is stacked (B under A).
// The text column is as tall as the media: the accent line is level with the top of the media, the Download buttons
// follow the text, and the text links sit at the bottom, level with the bottom of the media.
// Home shows only the two media. The Projects page also shows the rest as a sliding row under the project.
export function ProjectCard({ block, mode, first = false, total = 1, slide = { seconds: 5, autoplay: true } }: Props) {
  const item = readProjectItem(block);
  const { a, b } = pickHomeMedia(item.files);
  const shown = [a, b].filter((f): f is ProjectFile => f !== null);
  const rest = mode === "page" ? item.files.filter((f) => !shown.includes(f)) : [];
  const side = shown.length === 2 && shown.every((f) => f.ratio === "portrait");
  const hasMedia = shown.length > 0;

  const title = (
    <h3 className="site-proj-title font-display text-3xl font-medium leading-tight sm:text-5xl">
      <span className="site-sweep">{item.title}</span>
    </h3>
  );

  return (
    <div className="flex flex-col gap-10">
      <div className={hasMedia ? `site-proj-grid grid gap-8 ${projectLayout.grid}` : "grid"}>
        {hasMedia && (
          <Reveal variant="still" className={side ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
            {shown.map((file, i) => (
              <ItemMedia key={file.url} file={file} eager={first && i === 0} />
            ))}
          </Reveal>
        )}
        <Reveal delay={100} className="flex flex-col justify-between gap-8 self-stretch">
          <div>
            {total > 1 && <span aria-hidden className="site-tick mb-5 block h-px w-6 bg-accent" />}
            {item.url ? (
              <a href={routes.go(block.id)} className="block">
                {title}
              </a>
            ) : (
              title
            )}
            {item.body && <p className="mt-5 max-w-xl whitespace-pre-line text-ink-soft">{item.body}</p>}
            <Downloads links={item.downloads} className="mt-7" />
          </div>
          <TextLinks links={item.links} className="mt-2" />
        </Reveal>
      </div>
      {rest.length > 0 && (
        <Reveal variant="still">
          <MediaSlider count={rest.length} seconds={slide.seconds} autoplay={slide.autoplay}>
            {rest.map((file) => (
              <li
                key={file.url}
                className="shrink-0 snap-start"
                style={{ width: `calc(var(--slide-h) * ${ratioAspect[file.ratio]})` }}
              >
                <ItemMedia file={file} eager={false} />
              </li>
            ))}
          </MediaSlider>
        </Reveal>
      )}
    </div>
  );
}