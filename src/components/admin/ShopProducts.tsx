import type { ReactNode } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { productStatuses, productStatusLabels, shopConfig } from "@/config/shop";
import { dollarsFromCents, formatUsd } from "@/lib/shop-money";
import type { FormAction } from "@/types/form";
import type { ProductWithFiles, ShopSignAction } from "@/types/shop";
import { ShopFileInput } from "./ShopFileInput";

type Actions = {
  create: FormAction;
  save: FormAction;
  remove: FormAction;
  move: FormAction;
  setStock: FormAction;
  sign: ShopSignAction;
};

type Props = { products: ProductWithFiles[]; openId: string | null; actions: Actions; formKey: string };

// A closed part of a form. One thing per part, closed by default.
export function Part({ title, hint, open, children }: { title: string; hint?: string; open?: boolean; children: ReactNode }) {
  return (
    <details open={open} className="ink-border rounded-md bg-surface">
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 px-4 py-3">
        <span className="font-display text-lg font-bold">{title}</span>
        {hint && <span className="font-mono text-xs text-ink-soft">{hint}</span>}
      </summary>
      <div className="flex flex-col gap-5 border-t border-line p-4">{children}</div>
    </details>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="border border-line px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
      {children}
    </span>
  );
}

const L = shopConfig.limits;

// The fields of a product. The same for a new product and for an existing one.
function ProductFields({ product, files }: { product?: ProductWithFiles; files: ReactNode }) {
  const key = product?.id ?? "new";
  return (
    <>
      <Part title="Basics" hint="Name and text." open>
        <Field label="Title" htmlFor={`title-${key}`} hint="Required.">
          <Input id={`title-${key}`} name="title" required maxLength={L.title} defaultValue={product?.title ?? ""} />
        </Field>
        <Field label="Description" htmlFor={`description-${key}`} hint={`Optional. Up to ${L.description} characters.`}>
          <Textarea
            id={`description-${key}`}
            name="description"
            rows={5}
            maxLength={L.description}
            defaultValue={product?.description ?? ""}
          />
        </Field>
      </Part>

      <Part title="Price" hint="In US dollars.">
        <Field label="Price (USD)" htmlFor={`price-${key}`} hint="For example 5 or 5.50. 0 shows as Free.">
          <Input
            id={`price-${key}`}
            name="price_usd"
            inputMode="decimal"
            required
            defaultValue={product ? dollarsFromCents(product.price_usd_cents) : "0"}
          />
        </Field>
        <Field
          label="Price (IDR)"
          htmlFor={`idr-${key}`}
          hint="Optional. Used only after rupiah payment is added. Whole rupiah, for example 75000."
        >
          <Input id={`idr-${key}`} name="price_idr" inputMode="numeric" defaultValue={product?.price_idr ?? ""} />
        </Field>
      </Part>

      <Part title="Stock" hint="How many can be sold.">
        <Field label="Stock" htmlFor={`stock-${key}`} hint="Empty = unlimited. 0 = Sold out. Change it any time to refill.">
          <Input id={`stock-${key}`} name="stock" inputMode="numeric" defaultValue={product?.stock ?? ""} />
        </Field>
      </Part>

      <Part title="Files" hint="What the buyer downloads. Private.">
        {files}
      </Part>

      <Part title="What's included and license" hint="Shown to the buyer.">
        <Field
          label="What's included"
          htmlFor={`included-${key}`}
          hint={`One item per line, up to ${L.includedLines}. For example: 1 workflow JSON`}
        >
          <Textarea id={`included-${key}`} name="included" rows={4} defaultValue={product?.included.join("\n") ?? ""} />
        </Field>
        <Field
          label="License note"
          htmlFor={`license-${key}`}
          hint="Optional. What the buyer may do: personal or commercial use. Check the license of the base model you used."
        >
          <Textarea
            id={`license-${key}`}
            name="license_note"
            rows={3}
            maxLength={L.licenseNote}
            defaultValue={product?.license_note ?? ""}
          />
        </Field>
      </Part>

      <Part title="Where to show" hint="Status and Home.">
        <Field
          label="Status"
          htmlFor={`status-${key}`}
          hint="Draft: hidden. Active: shown in the shop. Archived: hidden, kept for old orders."
        >
          <Select id={`status-${key}`} name="status" defaultValue={product?.status ?? "draft"}>
            {productStatuses.map((status) => (
              <option key={status} value={status}>
                {productStatusLabels[status]}
              </option>
            ))}
          </Select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="show_on_home" defaultChecked={product?.show_on_home ?? false} className="accent-accent" />
          Show on Home
        </label>
      </Part>
    </>
  );
}

function ProductRow({
  product,
  open,
  actions,
  first,
}: {
  product: ProductWithFiles;
  open: boolean;
  actions: Actions;
  first: boolean;
}) {
  return (
    <li className="flex flex-col gap-2">
      <details open={open} className="ink-border rounded-md bg-surface">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
          <span className="font-display text-lg font-bold">{product.title}</span>
          <span className="font-mono text-xs text-ink-soft">
            {formatUsd(product.price_usd_cents)} · stock {product.stock === null ? "unlimited" : product.stock}
          </span>
          <Badge>{productStatusLabels[product.status]}</Badge>
          {product.stock === 0 && <Badge>Sold out</Badge>}
        </summary>
        <div className="flex flex-col gap-6 border-t border-line p-4">
          <form action={actions.save} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={product.id} />
            <ProductFields
              product={product}
              files={<ShopFileInput productId={product.id} current={product.files} sign={actions.sign} />}
            />
            <div>
              <SubmitButton variant="accent">Save product</SubmitButton>
            </div>
          </form>
          <form action={actions.remove} className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <input type="hidden" name="id" value={product.id} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="confirm" required className="accent-accent" />
              Yes, delete this product and its files
            </label>
            <SubmitButton size="sm" pendingLabel="Deleting...">
              Delete product
            </SubmitButton>
          </form>
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-2">
        <form action={actions.move}>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="dir" value="up" />
          <SubmitButton size="sm" pendingLabel="..." disabled={first}>
            Up
          </SubmitButton>
        </form>
        <form action={actions.move}>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="dir" value="down" />
          <SubmitButton size="sm" pendingLabel="...">
            Down
          </SubmitButton>
        </form>
        <form action={actions.setStock} className="ml-auto flex items-center gap-2">
          <input type="hidden" name="id" value={product.id} />
          <Input
            name="stock"
            inputMode="numeric"
            placeholder="unlimited"
            defaultValue={product.stock ?? ""}
            aria-label={`Stock of ${product.title}`}
            className="w-28 px-2 py-1.5 text-sm"
          />
          <SubmitButton size="sm" pendingLabel="...">
            Set stock
          </SubmitButton>
        </form>
      </div>
    </li>
  );
}

export function ShopProducts({ products, openId, actions, formKey }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <details className="ink-border rounded-md bg-surface">
        <summary className="cursor-pointer list-none px-4 py-3 font-display text-lg font-bold">Add product</summary>
        <form key={`new-${formKey}`} action={actions.create} className="flex flex-col gap-4 border-t border-line p-4">
          <ProductFields
            files={<p className="text-sm text-ink-soft">Save the product first. Then open it and add its files.</p>}
          />
          <div>
            <SubmitButton variant="accent">Add product</SubmitButton>
          </div>
        </form>
      </details>

      {products.length === 0 ? (
        <p className="text-sm text-ink-soft">No products yet. Add your first one above.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {products.map((product, i) => (
            <ProductRow
              key={`${product.id}-${formKey}`}
              product={product}
              open={product.id === openId}
              actions={actions}
              first={i === 0}
            />
          ))}
        </ul>
      )}
    </div>
  );
}