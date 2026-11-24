import { Img } from "@/components/ui/Img";
import { mediaKind } from "@/lib/site-view";

type Props = {
  url: string;
  alt?: string;
  // CSS aspect-ratio. Empty = the media keeps its own shape.
  aspect?: string;
  eager?: boolean;
};

export function ProductMedia({ url, alt = "", aspect, eager = false }: Props) {
  const fit = aspect ? "absolute inset-0 size-full object-cover" : "block h-auto w-full";
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
    <div className="relative w-full overflow-hidden bg-surface" style={aspect ? { aspectRatio: aspect } : undefined}>
      {media}
    </div>
  );
}