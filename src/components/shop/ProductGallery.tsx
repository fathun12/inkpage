import { productCrop } from "@/config/crops";
import { ProductMedia } from "./ProductMedia";

// Every product picture is a square (1:1), on the card and on the product page.
export function ProductGallery({ media, title }: { media: string[]; title: string }) {
  if (media.length === 0) {
    return <div aria-hidden className="w-full border border-line" style={{ aspectRatio: productCrop.css }} />;
  }
  return (
    <div className="flex flex-col gap-3">
      {media.map((url, i) => (
        <ProductMedia key={url} url={url} alt={i === 0 ? title : ""} aspect={productCrop.css} eager={i === 0} />
      ))}
    </div>
  );
}