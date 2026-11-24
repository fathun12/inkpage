import { shopConfig } from "@/config/shop";
import { createClient } from "@/lib/supabase/server";
import type { ShopSignInput, ShopSignResult } from "@/types/shop";

const MB = 1024 * 1024;

// A file name that is safe inside a storage path.
export function safeFileName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return (cleaned || "file").slice(-shopConfig.limits.fileName);
}

// Gives the browser a one-time upload permission for the PRIVATE bucket. The file itself never passes through the server.
export async function signShopFile(userId: string, input: ShopSignInput): Promise<ShopSignResult> {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", input.productId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!product) return { error: "Product not found. Save the product first." };
  if (!Number.isFinite(input.size) || input.size <= 0) return { error: "The file is empty." };
  if (input.size > shopConfig.limits.fileMb * MB) {
    return { error: `The file is larger than ${shopConfig.limits.fileMb} MB.` };
  }
  const path = `${userId}/${input.productId}/${crypto.randomUUID()}-${safeFileName(input.name)}`;
  const { data, error } = await supabase.storage.from(shopConfig.bucket).createSignedUploadUrl(path);
  if (error || !data) {
    return { error: error?.message ?? "Could not prepare the upload. Did you run the shop migration?" };
  }
  return { path: data.path ?? path, token: data.token };
}

// Full paths of every file stored for one product.
export async function listProductObjects(userId: string, productId: string): Promise<string[]> {
  const supabase = await createClient();
  const folder = `${userId}/${productId}`;
  const { data } = await supabase.storage.from(shopConfig.bucket).list(folder, { limit: 1000 });
  return (data ?? []).filter((item) => item.id !== null).map((item) => `${folder}/${item.name}`);
}

// Deletes every stored file of the product that is not in "keep" (uploaded but never saved, or removed).
export async function sweepProductFiles(userId: string, productId: string, keep: string[]): Promise<void> {
  const supabase = await createClient();
  const keepSet = new Set(keep);
  const orphans = (await listProductObjects(userId, productId)).filter((path) => !keepSet.has(path));
  if (orphans.length > 0) await supabase.storage.from(shopConfig.bucket).remove(orphans);
}