import type { CSSProperties } from "react";
import { Img } from "@/components/ui/Img";
import { mediaKind } from "@/lib/site-view";

type Props = {
  url: string;
  alt?: string;
  // CSS aspect-ratio. Empty = the media keeps its own shape.
  aspect?: string;
  // A fixed height (CSS length, like "30rem"). Used instead of the aspect-ratio when given.
  height?: string;
  // Which part of a cropped photo shows, 0 (top) to 100 (bottom). Empty = the middle.
  position?: number;
  eager?: boolean;
};

export function ProductMedia({ url, alt = "", aspect, height, position, eager = false }: Props) {
  const fixed = Boolean(aspect || height);
  const fit = fixed ? "absolute inset-0 size-full object-cover object-(--pos)" : "block h-auto w-full";
  const style = {
    aspectRatio: height ? undefined : aspect,
    height,
    ...(position === undefined ? {} : { "--pos": `50% ${position}%` }),
  } as CSSProperties;
  const media =
    mediaKind(url) === "video" ? (
      <video
        src={url}
        autoPlay
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        aria-hidden
        className={fit}
      />
    ) : (
      <Img src={url} alt={alt} loading={eager ? "eager" : "lazy"} className={fit} />
    );
  return (
    <div className="relative w-full overflow-hidden bg-surface" style={fixed ? style : undefined}>
      {media}
    </div>
  );
}