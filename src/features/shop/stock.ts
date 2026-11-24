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