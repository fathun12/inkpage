import { Img } from "@/components/ui/Img";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/block";

export function GalleryBlock({ block }: { block: Block }) {
  const images = block.data.images ?? [];
  if (images.length === 0) return null;

  const cols =
    images.length === 1 ? "grid-cols-1" : images.length === 2 || images.length === 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="font-mono text-xs uppercase tracking-widest text-ink-soft">
        {block.title}
      </figcaption>
      <div className={cn("grid gap-2", cols)}>
        {images.map((src) => (
          <a
            key={src}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="ink-border block overflow-hidden rounded-sm bg-surface"
          >
            <Img src={src} alt={block.title} className="aspect-square w-full object-cover" />
          </a>
        ))}
      </div>
    </figure>
  );
}
