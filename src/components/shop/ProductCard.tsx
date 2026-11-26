import Link from "next/link";
import { productCrop } from "@/config/crops";
import { productState } from "@/lib/shop-status";
import type { Product } from "@/types/shop";
import { ProductMedia } from "./ProductMedia";

type Props = { product: Product; open: boolean; href: string; eager?: boolean };

// One product in a grid. The whole card is a link to the product page. The last line shows what you can do.
export function ProductCard({ product, open, href, eager = false }: Props) {
  const state = productState(product, open);
  const cover = product.media[0];
  return (
    <Link href={href} className="group flex h-full flex-col gap-4">
      {cover ? (
        <ProductMedia url={cover} alt={product.title} aspect={productCrop.css} eager={eager} />
      ) : (
        <div aria-hidden className="w-full border border-line" style={{ aspectRatio: productCrop.css }} />
      )}
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-2xl leading-tight underline-offset-4 group-hover:underline">{product.title}</h3>
        <p className="flex flex-wrap items-baseline gap-x-3 font-mono text-xs uppercase tracking-widest">
          <span>{state.price}</span>
          {state.note && <span className="text-accent">{state.note}</span>}
        </p>
      </div>
      <span
        className={`mt-auto self-start border px-4 py-2.5 font-mono text-xs uppercase tracking-widest ${
          state.buyable ? "border-ink" : "border-line text-ink-soft"
        }`}
      >
        {state.action}
      </span>
    </Link>
  );
}