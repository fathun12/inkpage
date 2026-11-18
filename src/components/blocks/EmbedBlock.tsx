import { parseEmbed } from "@/lib/embed";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/block";

export function EmbedBlock({ block }: { block: Block }) {
  const embed = block.url ? parseEmbed(block.url) : null;
  if (!embed) return null;

  return (
    <div className="ink-border overflow-hidden rounded-md bg-surface">
      <iframe
        src={embed.src}
        title={block.title}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        className={cn("block w-full border-0", embed.height === null && "aspect-video")}
        style={embed.height ? { height: embed.height } : undefined}
      />
    </div>
  );
}
