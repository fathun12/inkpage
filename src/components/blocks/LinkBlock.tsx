import { Img } from "@/components/ui/Img";
import { routes } from "@/config/site";
import { readMedia } from "@/lib/card-media";
import type { Block } from "@/types/block";
import { CardMedia } from "./CardMedia";

function hostOf(url: string | null): string {
  try {
    return new URL(url ?? "").host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function LinkBlock({ block, eager = false }: { block: Block; eager?: boolean }) {
  const pinned = block.is_pinned;
  const media = readMedia(block.data.media);
  return (
    <a
      href={routes.go(block.id)}
      data-pinned={pinned ? "" : undefined}
      className="card press group block"
    >
      {media?.placement === "behind" && <CardMedia media={media} eager={eager} />}
      <span className="flex items-center gap-4 px-5 py-4">
        {block.image_url && (
          <Img src={block.image_url} className="ink-border size-16 shrink-0 rounded-sm object-cover" />
        )}
        <span className="relative z-10 min-w-0 flex-1">
          {pinned && (
            <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest opacity-80">
              Pinned
            </span>
          )}
          <span className="block truncate font-display text-xl font-bold">{block.title}</span>
          {block.body && <span className="mt-0.5 block text-sm opacity-80">{block.body}</span>}
          <span className="mt-1 block truncate font-mono text-xs opacity-70">{hostOf(block.url)}</span>
        </span>
        <span
          aria-hidden
          className="relative z-10 font-display text-2xl transition-transform duration-(--dur-base) group-hover:translate-x-1"
        >
          →
        </span>
      </span>
      {media?.placement === "below" && <CardMedia media={media} eager={eager} />}
    </a>
  );
}