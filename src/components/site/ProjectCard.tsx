import { Img } from "@/components/ui/Img";
import { projectLayout, ratioAspect } from "@/config/item-data";
import { routes } from "@/config/site";
import { pickHomeMedia, readProjectItem, type ProjectFile } from "@/lib/item-data";
import type { Block } from "@/types/block";
import { Credit } from "./Credit";
import { Downloads, TextLinks } from "./Downloads";
import { Reveal } from "./Reveal";

type Props = { block: Block; mode: "home" | "page"; first?: boolean; index?: number; total?: number };

// One media: the frame follows the Ratio of the file. No border, no shadow, sharp corners.
export function ItemMedia({ file, eager }: { file: ProjectFile; eager: boolean }) {
  const fill = "site-media-reveal absolute inset-0 size-full object-cover";
  return (
    <div className="relative w-full overflow-hidden bg-surface" style={{ aspectRatio: ratioAspect[file.ratio] }}>
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

// A project: media on the left (B under A), text and buttons on the right. On a phone the media is on top.
// Home shows two media at most. The Projects page shows all of them.
export function ProjectCard({ block, mode, first = false, index = 0, total = 1 }: Props) {
  const item = readProjectItem(block);
  const shown: ProjectFile[] =
    mode === "home" ? Object.values(pickHomeMedia(item.files)).filter((f): f is ProjectFile => f !== null) : item.files;
  const hasMedia = shown.length > 0;

  const title = <h3 className="font-display text-3xl leading-tight sm:text-5xl">{item.title}</h3>;

  return (
    <div className={hasMedia ? `grid gap-8 ${projectLayout.grid}` : "grid"}>
      {hasMedia && (
        <Reveal variant="still" className="flex flex-col gap-3">
          {shown.map((file, i) => (
            <ItemMedia key={file.url} file={file} eager={first && i === 0} />
          ))}
        </Reveal>
      )}
      <Reveal delay={100} className="flex flex-col justify-center">
        {total > 1 && (
          <>
            <span aria-hidden className="site-tick mb-4 block h-px w-6 bg-accent" />
            <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
          </>
        )}
        {item.url ? (
          <a href={routes.go(block.id)} className="underline-offset-4 hover:underline">
            {title}
          </a>
        ) : (
          title
        )}
        {item.body && <p className="mt-5 max-w-xl whitespace-pre-line text-ink-soft">{item.body}</p>}
        <Downloads links={item.downloads} className="mt-7" />
        <TextLinks links={item.links} className="mt-4" />
      </Reveal>
    </div>
  );
}