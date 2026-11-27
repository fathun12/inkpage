import Link from "next/link";
import type { ReactNode } from "react";
import { DesignHeading } from "@/components/site/DesignHeading";
import { MediaSlider } from "@/components/site/MediaSlider";
import { Reveal } from "@/components/site/Reveal";
import { productCrop } from "@/config/crops";
import {
  stackAspect,
  type DesignFont,
  type DesignIntroSize,
  type DesignMode,
  type DesignTitleAlign,
  type DesignTitleSize,
  type ShopView,
  type ShopWideView,
  type StackRatio,
  type WritingSize,
} from "@/config/layout";
import { productState, type ProductState } from "@/lib/shop-status";
import type { Product } from "@/types/shop";
import { ProductCard } from "./ProductCard";
import { ProductGrid } from "./ProductGrid";
import { ProductMedia } from "./ProductMedia";

const two = (n: number) => String(n).padStart(2, "0");

// Cards per row of the Grid layout when the size is not the original (Large uses ProductGrid as it always did).
const gridColumns: Record<WritingSize, string> = {
  small: "sm:grid-cols-3 lg:grid-cols-5",
  medium: "sm:grid-cols-2 lg:grid-cols-4",
  large: "sm:grid-cols-2 lg:grid-cols-3",
};

// Columns of the Contact sheet, by the number of products.
const sheetColumns: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

type Common = { products: Product[]; open: boolean; base: string };

// The shape of the Stack photo. Default = 16:9, or the Photo height when one is set.
function stackBox(ratio: StackRatio, mediaHeight: number): { aspect?: string; height?: string } {
  if (ratio !== "default") return { aspect: stackAspect[ratio] };
  if (mediaHeight > 0) return { height: `${mediaHeight}rem` };
  return { aspect: "16 / 9" };
}

// The first photo of a product, or an empty frame when it has none.
function Cover({
  product,
  aspect,
  height,
  position,
  eager,
}: {
  product: Product;
  aspect?: string;
  height?: string;
  position?: number;
  eager?: boolean;
}) {
  const cover = product.media[0];
  if (!cover) {
    return (
      <div
        aria-hidden
        className="w-full border border-line bg-surface"
        style={height ? { height } : { aspectRatio: aspect ?? productCrop.css }}
      />
    );
  }
  return (
    <ProductMedia url={cover} alt={product.title} aspect={aspect} height={height} position={position} eager={eager} />
  );
}

// Price, and "Only N left" when the stock is low. With status on, a product that cannot be bought also says why.
function Meta({ state, status = false }: { state: ProductState; status?: boolean }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-3 font-mono text-xs uppercase tracking-widest">
      <span>{state.price}</span>
      {state.note && <span className="text-accent">{state.note}</span>}
      {status && !state.buyable && <span className="text-ink-soft">{state.action}</span>}
    </span>
  );
}

// What you can do with the product, drawn like the button of the card.
function Action({ state }: { state: ProductState }) {
  return (
    <span
      className={`inline-block self-start border px-4 py-2.5 font-mono text-xs uppercase tracking-widest ${
        state.buyable ? "border-ink" : "border-line text-ink-soft"
      }`}
    >
      {state.action}
    </span>
  );
}

// Grid with a size other than the original.
function SizedGrid({ products, open, base, size }: Common & { size: WritingSize }) {
  return (
    <ul className={`mx-auto grid max-w-5xl gap-x-8 gap-y-12 px-5 sm:px-8 site-pb ${gridColumns[size]}`}>
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

// One product per row: a small photo, the big name, the price and the button. Like a catalogue.
function ListRows({ products, open, base }: Common) {
  return (
    <ul className="border-b border-line">
      {products.map((product, i) => {
        const state = productState(product, open);
        return (
          <li key={product.id} className="border-t border-line">
            <Reveal delay={Math.min(i, 6) * 60}>
              <Link
                href={`${base}/${product.slug}`}
                className="group grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-5 gap-y-3 py-5 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:gap-x-8 sm:py-6"
              >
                <div className="row-span-2 w-18 sm:row-span-1 sm:w-24">
                  <Cover product={product} aspect={productCrop.css} eager={i === 0} />
                </div>
                <div className="min-w-0">
                  <span className="block font-display text-2xl leading-tight decoration-accent decoration-1 underline-offset-4 group-hover:underline sm:text-3xl">
                    {product.title}
                  </span>
                  <div className="mt-2">
                    <Meta state={state} />
                  </div>
                </div>
                <div className="col-start-2 sm:col-auto">
                  <Action state={state} />
                </div>
              </Link>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}

// One row of cards that slides by itself.
function Shelf({ products, open, base, seconds }: Common & { seconds: number }) {
  return (
    <MediaSlider count={products.length} seconds={seconds}>
      {products.map((product, i) => (
        <li key={product.id} className="w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-[31%]">
          <Reveal variant="still" className="h-full">
            <ProductCard product={product} open={open} href={`${base}/${product.slug}`} eager={i === 0} />
          </Reveal>
        </li>
      ))}
    </MediaSlider>
  );
}

// Full width: square photos that touch each other. The name shows on hover; a product that cannot be bought
// always carries a label in the corner.
function Sheet({ products, open, base }: Common) {
  const cols = sheetColumns[products.length] ?? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  return (
    <ul className={`grid gap-px ${cols}`}>
      {products.map((product, i) => {
        const state = productState(product, open);
        const hasCover = Boolean(product.media[0]);
        return (
          <li key={product.id} className="min-w-0">
            <Reveal variant="still">
              <Link href={`${base}/${product.slug}`} className="group relative block overflow-hidden bg-surface">
                {hasCover ? (
                  <>
                    <Cover product={product} aspect={productCrop.css} eager={i === 0} />
                    <span
                      className="absolute inset-x-0 bottom-0 block p-3 text-white transition-opacity duration-(--dur-base) sm:p-4 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100"
                      style={{ background: "linear-gradient(to top, rgb(0 0 0 / 0.7), transparent)" }}
                    >
                      <span className="block font-display text-lg leading-tight">{product.title}</span>
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest opacity-80">
                        {state.price}
                        {state.note ? ` · ${state.note}` : ""}
                      </span>
                    </span>
                    {!state.buyable && (
                      <span className="absolute left-3 top-3 bg-bg px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink">
                        {state.action}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="flex aspect-square w-full flex-col justify-end gap-2 border border-line p-3 sm:p-4">
                    <span className="block font-display text-xl leading-tight">{product.title}</span>
                    <Meta state={state} status />
                  </span>
                )}
              </Link>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}

// One product across the whole screen: the photo, then its number, name, price and button.
function StackItem({
  product,
  index,
  total,
  state,
  href,
  box,
  position,
  eager,
}: {
  product: Product;
  index: number;
  total: number;
  state: ProductState;
  href: string;
  box: { aspect?: string; height?: string };
  position?: number;
  eager: boolean;
}) {
  return (
    <Link href={href} className="group block">
      <Cover product={product} aspect={box.aspect} height={box.height} position={position} eager={eager} />
      <div className="grid gap-x-10 gap-y-4 px-5 py-6 sm:px-8 sm:py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="min-w-0">
          <span className="block font-mono text-[11px] tracking-widest text-ink-soft">
            {two(index + 1)} / {two(total)}
          </span>
          <span className="mt-2 block wrap-break-word font-display text-3xl leading-[1.05] decoration-accent decoration-1 underline-offset-4 group-hover:underline sm:text-5xl">
            {product.title}
          </span>
          <div className="mt-3">
            <Meta state={state} />
          </div>
        </div>
        <Action state={state} />
      </div>
    </Link>
  );
}

function Stack({
  products,
  open,
  base,
  box,
  position,
}: Common & { box: { aspect?: string; height?: string }; position?: number }) {
  return (
    <ul className="flex flex-col gap-6 sm:gap-10">
      {products.map((product, i) => (
        <li key={product.id}>
          <Reveal variant="still">
            <StackItem
              product={product}
              index={i}
              total={products.length}
              state={productState(product, open)}
              href={`${base}/${product.slug}`}
              box={box}
              position={position}
              eager={i === 0}
            />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// Like Stack, but one product at a time across the whole screen. It slides by itself.
function StackSlide({
  products,
  open,
  base,
  box,
  position,
  seconds,
}: Common & { box: { aspect?: string; height?: string }; position?: number; seconds: number }) {
  return (
    <MediaSlider count={products.length} seconds={seconds} bleed>
      {products.map((product, i) => (
        <li key={product.id} className="w-full shrink-0 snap-start">
          <StackItem
            product={product}
            index={i}
            total={products.length}
            state={productState(product, open)}
            href={`${base}/${product.slug}`}
            box={box}
            position={position}
            eager={i === 0}
          />
        </li>
      ))}
    </MediaSlider>
  );
}

// Photo on one half of the screen, text on the other. The sides swap on each product.
function Split({ products, open, base }: Common) {
  return (
    <ul>
      {products.map((product, i) => {
        const state = productState(product, open);
        return (
          <li key={product.id}>
            <Reveal variant="still">
              <Link href={`${base}/${product.slug}`} className="group grid md:grid-cols-2">
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <Cover product={product} aspect={productCrop.css} eager={i === 0} />
                </div>
                <div className="flex flex-col justify-end gap-4 px-5 py-8 sm:px-8 md:px-14 md:py-16">
                  <span className="block font-mono text-[11px] tracking-widest text-ink-soft">
                    {two(i + 1)} / {two(products.length)}
                  </span>
                  <span className="block wrap-break-word font-display text-4xl leading-[1.05] decoration-accent decoration-1 underline-offset-4 group-hover:underline lg:text-6xl">
                    {product.title}
                  </span>
                  {product.description && (
                    <span className="line-clamp-3 block max-w-md text-ink-soft">{product.description}</span>
                  )}
                  <Meta state={state} />
                  <Action state={state} />
                </div>
              </Link>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}

// One row of tall panels that runs to the edges of the screen. It slides by itself.
function Filmstrip({ products, open, base, seconds }: Common & { seconds: number }) {
  return (
    <MediaSlider count={products.length} seconds={seconds} bleed>
      {products.map((product, i) => (
        <li key={product.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
          <Link href={`${base}/${product.slug}`} className="group block">
            <Cover product={product} aspect="3 / 4" eager={i === 0} />
            <div className="flex flex-col gap-2 px-5 py-4 sm:px-6">
              <span className="block font-display text-xl leading-tight decoration-accent decoration-1 underline-offset-4 group-hover:underline">
                {product.title}
              </span>
              <Meta state={productState(product, open)} status />
            </div>
          </Link>
        </li>
      ))}
    </MediaSlider>
  );
}

type Props = {
  products: Product[];
  open: boolean;
  title: string;
  base: string;
  // Seconds between slides (Slider, Stack slide, Filmstrip).
  seconds?: number;
  // Chosen in Customize (Sections, Shop). Left out = the original: Centered, Grid, Large.
  mode?: DesignMode;
  view?: ShopView;
  wideView?: ShopWideView;
  size?: WritingSize;
  // Stack and Stack slide only: the Photo height (0 = Auto), the ratio, and which part of a cropped photo shows.
  mediaHeight?: number;
  stackRatio?: StackRatio;
  stackCrop?: number;
  // The text under the title (written in Pages) and the look of the title and of that text (Customize).
  intro?: string | null;
  titleAlign?: DesignTitleAlign;
  titleFont?: DesignFont;
  titleSize?: DesignTitleSize;
  introFont?: DesignFont;
  introSize?: DesignIntroSize;
};

const seeAllClass =
  "font-mono text-xs uppercase tracking-widest underline decoration-accent decoration-1 underline-offset-4 transition-colors duration-(--dur-base) hover:text-accent";

// The Shop section of Home: a few products and a "See all" link. It shows even when the shop is closed.
// Centered + Grid + Large + the original title = exactly the look from before.
export function HomeShop({
  products,
  open,
  title,
  base,
  seconds = 5,
  mode = "centered",
  view = "grid",
  wideView = "stack",
  size = "large",
  mediaHeight = 0,
  stackRatio = "default",
  stackCrop = 50,
  intro = null,
  titleAlign = "center",
  titleFont = "default",
  titleSize = "auto",
  introFont = "default",
  introSize = "auto",
}: Props) {
  if (products.length === 0) return null;
  const wide = mode === "full";
  const custom = titleAlign !== "center" || titleFont !== "default" || titleSize !== "auto" || Boolean(intro);
  const common = { products, open, base };
  const box = stackBox(stackRatio, mediaHeight);
  const position = stackRatio === "wide" || stackRatio === "ultra" ? stackCrop : undefined;

  let body: ReactNode;
  if (wide) {
    body = (
      <div className="site-pb">
        {wideView === "stackslide" ? (
          <StackSlide {...common} box={box} position={position} seconds={seconds} />
        ) : wideView === "split" ? (
          <Split {...common} />
        ) : wideView === "filmstrip" ? (
          <Filmstrip {...common} seconds={seconds} />
        ) : wideView === "sheet" ? (
          <Sheet {...common} />
        ) : (
          <Stack {...common} box={box} position={position} />
        )}
      </div>
    );
  } else if (view === "list") {
    body = (
      <div className="mx-auto max-w-5xl px-5 pt-4 sm:px-8 site-pb">
        <ListRows {...common} />
      </div>
    );
  } else if (view === "slider") {
    body = (
      <div className="mx-auto max-w-5xl px-5 pt-4 sm:px-8 site-pb">
        <Shelf {...common} seconds={seconds} />
      </div>
    );
  } else {
    body = size === "large" ? <ProductGrid {...common} /> : <SizedGrid {...common} size={size} />;
  }

  if (!wide && !custom) {
    return (
      <section id="shop" aria-label={title} className="site-pt">
        <div className="mx-auto flex max-w-5xl items-baseline justify-between gap-4 px-5 pb-8 sm:px-8">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
          </Reveal>
          <Link href={base} className="font-mono text-xs uppercase tracking-widest underline underline-offset-4">
            See all
          </Link>
        </div>
        {body}
      </section>
    );
  }

  return (
    <section id="shop" aria-label={title} className="site-pt">
      <DesignHeading
        title={title}
        href={null}
        intro={intro}
        align={titleAlign}
        font={titleFont}
        size={titleSize}
        introFont={introFont}
        introSize={introSize}
      />
      <div className={`-mt-4 px-5 pb-6 text-right sm:px-8 ${wide ? "" : "mx-auto max-w-5xl"}`}>
        <Link href={base} className={seeAllClass}>
          See all →
        </Link>
      </div>
      {body}
    </section>
  );
}