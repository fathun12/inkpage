import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import type { Product } from "@/types/shop";
import { ProductGrid } from "./ProductGrid";

type Props = { products: Product[]; open: boolean; title: string; base: string };

// The Shop section of Home: a few products and a "See all" link. It shows even when the shop is closed.
export function HomeShop({ products, open, title, base }: Props) {
  if (products.length === 0) return null;
  return (
    <section id="shop" aria-label={title} className="pt-16 sm:pt-24">
      <div className="mx-auto flex max-w-5xl items-baseline justify-between gap-4 px-5 pb-8 sm:px-8">
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
        </Reveal>
        <Link href={base} className="font-mono text-xs uppercase tracking-widest underline underline-offset-4">
          See all
        </Link>
      </div>
      <ProductGrid products={products} open={open} base={base} />
    </section>
  );
}