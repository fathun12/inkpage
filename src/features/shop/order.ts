import { shopConfig } from "@/config/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "./token";

export type OrderFile = { id: string; name: string; sizeBytes: number | null; left: number };

export type OrderView = {
  status: string;
  email: string;
  title: string;
  license: string | null;
  // End of the download period (paid orders only).
  accessEnds: string | null;
  files: OrderFile[];
};

// The order behind a token, for the order page. null = no such order (or it belongs to another profile).
export async function getOrderView(userId: string, token: string): Promise<OrderView | null> {
  const db = createAdminClient();
  const { data: order, error } = await db
    .from("orders")
    .select("id, status, email, product_id, expires_at, paid_at, products(title, license_note)")
    .eq("token_hash", hashToken(token))
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !order) return null;

  const product = Array.isArray(order.products) ? order.products[0] : order.products;

  let status: string = order.status;
  if (status === "pending" && order.expires_at && new Date(order.expires_at).getTime() < Date.now()) {
    status = "expired";
  }

  const ends = order.paid_at
    ? new Date(new Date(order.paid_at).getTime() + shopConfig.grantDays * 86_400_000)
    : null;
  const open = status === "paid" && ends !== null && ends.getTime() > Date.now();

  let files: OrderFile[] = [];
  if (open) {
    const [list, logs] = await Promise.all([
      db
        .from("product_files")
        .select("id, name, size_bytes")
        .eq("product_id", order.product_id)
        .order("position", { ascending: true }),
      db.from("downloads").select("product_file_id").eq("order_id", order.id),
    ]);
    const used = new Map<string, number>();
    for (const row of logs.data ?? []) {
      const key = row.product_file_id as string | null;
      if (key) used.set(key, (used.get(key) ?? 0) + 1);
    }
    files = (list.data ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      sizeBytes: f.size_bytes,
      left: Math.max(0, shopConfig.grantMaxDownloads - (used.get(f.id) ?? 0)),
    }));
  }

  return {
    status,
    email: order.email,
    title: product?.title ?? "Your order",
    license: product?.license_note ?? null,
    accessEnds: open && ends ? ends.toISOString() : null,
    files,
  };
}