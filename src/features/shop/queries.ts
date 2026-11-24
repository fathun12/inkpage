import { createClient } from "@/lib/supabase/server";
import type { Product, ProductFile, ProductWithFiles, ShopSettings } from "@/types/shop";

export const emptySettings: ShopSettings = {
  is_open: false,
  home_title: null,
  terms: null,
  privacy: null,
  refund: null,
  contact_email: null,
};

const missingTables =
  "The shop tables do not exist yet. Run the newest migration (20261124020000_shop_foundation.sql) in Supabase.";

function fail(error: { code?: string; message: string }): never {
  const missing = error.code === "42P01" || error.code === "PGRST205";
  throw new Error(missing ? missingTables : error.message);
}

export async function getShopSettings(userId: string): Promise<ShopSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shop_settings")
    .select("is_open, home_title, terms, privacy, refund, contact_email")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) fail(error);
  return data ? (data as ShopSettings) : emptySettings;
}

// All products of the owner (any status), with their private files.
export async function getOwnProducts(userId: string): Promise<ProductWithFiles[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_files(*)")
    .eq("user_id", userId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) fail(error);
  return (data ?? []).map((row) => {
    const { product_files, ...product } = row as Product & { product_files: ProductFile[] | null };
    const files = [...(product_files ?? [])].sort(
      (a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at),
    );
    return { ...(product as Product), files };
  });
}