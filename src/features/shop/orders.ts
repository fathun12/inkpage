import { orderStatuses, shopConfig, type OrderStatus } from "@/config/shop";
import { createClient } from "@/lib/supabase/server";
import type { OrderRow } from "@/types/shop";

type Raw = {
  id: string;
  email: string;
  status: OrderStatus;
  provider: string;
  amount_cents: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
  products: { title: string } | { title: string }[] | null;
};

// An unknown value in the address means "all orders".
export function resolveOrderFilter(value: string | null | undefined): OrderStatus | null {
  return (orderStatuses as readonly string[]).includes(value ?? "") ? (value as OrderStatus) : null;
}

// The newest orders of the owner, with the product title. Only the owner can read them (row level security).
export async function getOwnOrders(userId: string, status: OrderStatus | null): Promise<OrderRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("id, email, status, provider, amount_cents, currency, created_at, paid_at, products(title)")
    .eq("user_id", userId);
  if (status) query = query.eq("status", status);
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(shopConfig.ordersListMax);
  if (error) throw new Error(error.message);

  return ((data ?? []) as Raw[]).map((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    return {
      id: row.id,
      email: row.email,
      status: row.status,
      provider: row.provider,
      amount_cents: row.amount_cents,
      currency: row.currency,
      created_at: row.created_at,
      paid_at: row.paid_at,
      product_title: product?.title ?? "Deleted product",
    };
  });
}