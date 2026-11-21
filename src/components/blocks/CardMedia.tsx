import { Img } from "@/components/ui/Img";
import { mediaHeightPx } from "@/config/card";
import { cn } from "@/lib/utils";
import type { CardMedia as CardMediaData } from "@/types/block";

// Pure. The whole file is kept (no crop); the card (overflow hidden + radius) cuts it to its shape.
// behind: fills the card under the text. -z-10 puts it above the card color but under all
// content (the card is an isolated stacking context), so nothing else needs a z-index.
// below: a strip under the text, still inside the card.
// A GIF is hidden when the visitor asks for reduced motion, like the background GIF.
export function CardMedia({ media, eager = false }: { media: CardMediaData; eager?: boolean }) {
  const below = media.placement === "below";
  return (
    <Img
      src={media.url}
      loading={eager ? "eager" : "lazy"}
      draggable={false}
      className={cn(
        "pointer-events-none",
        below ? "block w-full" : "absolute inset-0 -z-10 size-full",
        media.kind === "gif" && "motion-reduce:hidden",
      )}
      style={{
        objectFit: media.fit,
        objectPosition: media.position,
        opacity: media.opacity / 100,
        height: below ? mediaHeightPx[media.height] : undefined,
      }}
    />
  );
}