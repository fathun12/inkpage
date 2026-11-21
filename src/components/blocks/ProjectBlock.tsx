import { Img } from "@/components/ui/Img";
import { routes } from "@/config/site";
import { readMedia } from "@/lib/card-media";
import type { Block } from "@/types/block";
import { CardMedia } from "./CardMedia";

export function ProjectBlock({ block, eager = false }: { block: Block; eager?: boolean }) {
  const media = readMedia(block.data.media);
  const content = (
    <>
      {media?.placement === "behind" && <CardMedia media={media} eager={eager} />}
      {block.image_url && <Img src={block.image_url} className="aspect-video w-full object-cover" />}
      <span className="relative z-10 flex flex-col gap-1 p-5">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Project</span>
        <span className="font-display text-xl font-bold">{block.title}</span>
        {block.body && <span className="text-sm text-ink-soft">{block.body}</span>}
        {block.url && (
          <span className="mt-2 font-mono text-xs underline underline-offset-4">View project →</span>
        )}
      </span>
      {media?.placement === "below" && <CardMedia media={media} eager={eager} />}
    </>
  );

  const shell = "card block";
  if (!block.url) return <div className={shell}>{content}</div>;
  return (
    <a href={routes.go(block.id)} className={`${shell} press`}>
      {content}
    </a>
  );
}