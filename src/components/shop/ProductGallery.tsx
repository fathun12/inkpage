import { shopConfig } from "@/config/shop";
import { ProductMedia } from "./ProductMedia";

export function ProductGallery({ media, title }: { media: string[]; title: string }) {
  if (media.length === 0) {
    return <div aria-hidden className="w-full border border-line" style={{ aspectRatio: shopConfig.cardAspect }} />;
  }
  return (
    <div className="flex flex-col gap-3">
      {media.map((url, i) => (
        <ProductMedia key={url} url={url} alt={i === 0 ? title : ""} eager={i === 0} />
      ))}
    </div>
  );
}