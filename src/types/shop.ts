import type { ProductStatus } from "@/config/shop";

export type Product = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string | null;
  price_usd_cents: number;
  price_idr: number | null;
  // null = unlimited, 0 = sold out
  stock: number | null;
  included: string[];
  license_note: string | null;
  media: string[];
  status: ProductStatus;
  show_on_home: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ProductFile = {
  id: string;
  product_id: string;
  path: string;
  name: string;
  size_bytes: number | null;
  position: number;
  created_at: string;
};

export type ProductWithFiles = Product & { files: ProductFile[] };

// What the product form sends (already checked).
export type ProductInput = {
  title: string;
  description: string | null;
  price_usd_cents: number;
  price_idr: number | null;
  stock: number | null;
  included: string[];
  license_note: string | null;
  status: ProductStatus;
  show_on_home: boolean;
};

export type ShopSettings = {
  is_open: boolean;
  home_title: string | null;
  terms: string | null;
  privacy: string | null;
  refund: string | null;
  contact_email: string | null;
};

// A file the browser uploaded straight to the private bucket, waiting for Save.
export type AddedShopFile = { path: string; name: string; size: number };

export type ShopSignInput = { productId: string; name: string; type: string; size: number };
export type ShopSignResult = { path: string; token: string } | { error: string };
export type ShopSignAction = (input: ShopSignInput) => Promise<ShopSignResult>;