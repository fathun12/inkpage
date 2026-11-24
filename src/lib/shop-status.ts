import { shopConfig } from "@/config/shop";
import { formatUsd } from "@/lib/shop-money";
import type { Product } from "@/types/shop";

export type ProductState = {
  price: string;
  note: string | null;
  action: string;
  buyable: boolean;
};

// What a visitor sees for a product. Toko Closed menang atas semua status lain.
export function productState(product: Pick<Product, "price_usd_cents" | "stock">, open: boolean): ProductState {
  const price = formatUsd(product.price_usd_cents);
  if (!open) return { price, note: null, action: "Out of stock", buyable: false };
  if (product.stock !== null && product.stock <= 0) {
    return { price, note: null, action: "Sold out", buyable: false };
  }
  const low = product.stock !== null && product.stock <= shopConfig.lowStockThreshold;
  return {
    price,
    note: low ? `Only ${product.stock} left` : null,
    action: product.price_usd_cents <= 0 ? "Get it free" : "Buy now",
    buyable: true,
  };
}