import { z } from "zod";
import { productStatuses, shopConfig } from "@/config/shop";
import { field } from "@/lib/form";
import { centsFromDollars } from "@/lib/shop-money";
import { firstError } from "@/lib/validation";
import type { ProductInput, ShopSettings } from "@/types/shop";

const L = shopConfig.limits;

const productSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a title.")
    .max(L.title, `The title can be at most ${L.title} characters.`),
  description: z.string().trim().max(L.description, `The description can be at most ${L.description} characters.`).optional(),
  license_note: z.string().trim().max(L.licenseNote, `The license note can be at most ${L.licenseNote} characters.`).optional(),
  status: z.enum(productStatuses, { error: "Pick a status." }),
});

export function readProductForm(formData: FormData): { data: ProductInput } | { error: string } {
  const parsed = productSchema.safeParse({
    title: field(formData, "title") ?? "",
    description: field(formData, "description"),
    license_note: field(formData, "license_note"),
    status: field(formData, "status") ?? "draft",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const priceText = field(formData, "price_usd");
  if (priceText === undefined) return { error: "Enter a price. Use 0 for a free product." };
  const cents = centsFromDollars(priceText);
  if (cents === null) return { error: "The price must be a number like 5 or 5.50." };
  if (cents > L.maxPriceUsdCents) return { error: `The price can be at most $${L.maxPriceUsdCents / 100}.` };

  let idr: number | null = null;
  const idrText = field(formData, "price_idr");
  if (idrText !== undefined) {
    const digits = idrText.replace(/[.\s]/g, "");
    if (!/^\d+$/.test(digits)) return { error: "The IDR price must be a whole number, for example 75000." };
    idr = Number(digits);
    if (idr > L.maxPriceIdr) return { error: `The IDR price can be at most ${L.maxPriceIdr}.` };
  }

  let stock: number | null = null;
  const stockText = field(formData, "stock");
  if (stockText !== undefined) {
    if (!/^\d+$/.test(stockText)) return { error: "Stock must be a whole number, or empty for unlimited." };
    stock = Number(stockText);
    if (stock > L.maxStock) return { error: `Stock can be at most ${L.maxStock}.` };
  }

  const included = (field(formData, "included") ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
  if (included.length > L.includedLines) {
    return { error: `"What's included" can have up to ${L.includedLines} lines.` };
  }
  if (included.some((line) => line.length > L.includedLine)) {
    return { error: `Each line of "What's included" can be at most ${L.includedLine} characters.` };
  }

  return {
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      price_usd_cents: cents,
      price_idr: idr,
      stock,
      included,
      license_note: parsed.data.license_note ?? null,
      status: parsed.data.status,
      show_on_home: formData.get("show_on_home") === "on",
    },
  };
}

const settingsSchema = z.object({
  home_title: z.string().trim().max(L.homeTitle, `The Home label can be at most ${L.homeTitle} characters.`).optional(),
  terms: z.string().trim().max(L.legal, `Terms can be at most ${L.legal} characters.`).optional(),
  privacy: z.string().trim().max(L.legal, `Privacy can be at most ${L.legal} characters.`).optional(),
  refund: z.string().trim().max(L.legal, `Refund can be at most ${L.legal} characters.`).optional(),
  contact_email: z
    .string()
    .trim()
    .max(L.email, `The email can be at most ${L.email} characters.`)
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Enter a valid contact email address.")
    .optional(),
});

export function readSettingsForm(formData: FormData): { data: ShopSettings } | { error: string } {
  const parsed = settingsSchema.safeParse({
    home_title: field(formData, "home_title"),
    terms: field(formData, "terms"),
    privacy: field(formData, "privacy"),
    refund: field(formData, "refund"),
    contact_email: field(formData, "contact_email"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const v = parsed.data;
  return {
    data: {
      is_open: formData.get("is_open") === "on",
      home_title: v.home_title ?? null,
      terms: v.terms ?? null,
      privacy: v.privacy ?? null,
      refund: v.refund ?? null,
      contact_email: v.contact_email ?? null,
    },
  };
}