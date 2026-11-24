import Link from "next/link";
import type { ProductState } from "@/lib/shop-status";
import type { Product } from "@/types/shop";
import { BuyPanel } from "./BuyPanel";
import { ProductGallery } from "./ProductGallery";
import { ShopLinks } from "./ShopLinks";

type Props = {
  product: Product;
  state: ProductState;
  back: string;
  backLabel: string;
  links: { label: string; href: string }[];
  email: string | null;
};

const label = "font-mono text-xs uppercase tracking-widest text-ink-soft";

export function ProductDetail({ product, state, back, backLabel, links, email }: Props) {
  return (
    <article className="mx-auto max-w-5xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <Link href={back} className={`${label} hover:text-ink`}>
        ← {backLabel}
      </Link>
      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <ProductGallery media={product.media} title={product.title} />
        <div className="flex flex-col gap-8">
          <h1 className="font-voice text-4xl leading-none sm:text-6xl">{product.title}</h1>
          <BuyPanel state={state} />
          {product.description && <p className="whitespace-pre-line text-ink-soft">{product.description}</p>}
          {product.included.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className={label}>What’s included</h2>
              <ul className="flex flex-col gap-1.5 text-sm">
                {product.included.map((line, i) => (
                  <li key={`${line}-${i}`} className="border-t border-line pt-1.5">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {product.license_note && (
            <section className="flex flex-col gap-3">
              <h2 className={label}>License</h2>
              <p className="whitespace-pre-line text-sm text-ink-soft">{product.license_note}</p>
            </section>
          )}
          <ShopLinks links={links} email={email} />
        </div>
      </div>
    </article>
  );
}