import { Reveal } from "@/components/site/Reveal";
import type { Product } from "@/types/shop";
import { ProductCard } from "./ProductCard";

type Props = { products: Product[]; open: boolean; base: string };

export function ProductGrid({ products, open, base }: Props) {
  return (
    <ul className="mx-auto grid max-w-5xl gap-x-8 gap-y-12 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 site-pb">
      {products.map((product, i) => (
        <li key={product.id}>
          <Reveal delay={(i % 3) * 80} className="h-full">
            <ProductCard product={product} open={open} href={`${base}/${product.slug}`} eager={i === 0} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}