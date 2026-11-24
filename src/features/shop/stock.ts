import { createAdminClient } from "@/lib/supabase/admin";

// Gives back the stock of orders whose hold ran out. Never throws: a broken cleanup must not break the website.
export async function expireHolds(): Promise<void> {
  try {
    const { error } = await createAdminClient().rpc("shop_expire_holds");
    if (error) console.error("shop_expire_holds failed", error.message);
  } catch (e) {
    console.error("shop_expire_holds failed", e instanceof Error ? e.message : e);
  }
}

// For the daily cron: like expireHolds, but it reports how many orders were closed (or why it failed).
export async function runHoldCleanup(): Promise<{ ok: true; expired: number } | { ok: false; error: string }> {
  try {
    const { data, error } = await createAdminClient().rpc("shop_expire_holds");
    if (error) return { ok: false, error: error.message };
    return { ok: true, expired: typeof data === "number" ? data : 0 };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown error" };
  }
}