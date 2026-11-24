"use server";

import { ordersHref, shopConfig } from "@/config/shop";
import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { getProfileById } from "@/features/profile/queries";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { field } from "@/lib/form";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { sendReceipt } from "./email";
import { resolveOrderFilter } from "./orders";
import { hashToken, newToken } from "./token";

// Sends the buyer a NEW download link by email. The old link stops working (only a hash is stored, so the old
// token cannot be shown again). For an order that "needs review" this also accepts it: it becomes paid.
// The email goes first: if it fails, nothing changes and the old link keeps working.
export async function sendOrderLinkAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = ordersHref(resolveOrderFilter(field(formData, "filter")));
  const id = field(formData, "id");
  if (!id) return redirectWithError(back, "The order id is missing.");

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, email, status, amount_cents, paid_at, products(title, license_note)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return redirectWithError(back, `Could not read the order: ${error.message}`);
  if (!order) return redirectWithError(back, "That order does not exist anymore.");
  if (order.status !== "paid" && order.status !== "needs_review") {
    return redirectWithError(back, "Only paid orders, or orders that need review, can get a download link.");
  }

  const accept = order.status === "needs_review";
  const paidAt = accept || !order.paid_at ? new Date() : new Date(order.paid_at);
  if (!accept && paidAt.getTime() + shopConfig.grantDays * 86_400_000 < Date.now()) {
    return redirectWithError(back, `The ${shopConfig.grantDays} day download period of this order has ended.`);
  }

  const profile = await getProfileById(user.id);
  if (!profile) return redirectWithError(back, "Your profile was not found.");
  const settings = await supabase.from("shop_settings").select("contact_email").eq("user_id", user.id).maybeSingle();
  const product = Array.isArray(order.products) ? order.products[0] : order.products;

  const token = newToken();
  const origin = (await getSiteUrl()).replace(/\/$/, "");
  const sent = await sendReceipt({
    to: order.email,
    orderId: order.id,
    title: product?.title ?? "Your order",
    priceCents: order.amount_cents,
    paidAt,
    orderUrl: `${origin}${routes.profile(profile.username)}/order/${token}`,
    license: product?.license_note ?? null,
    replyTo: settings.data?.contact_email ?? null,
  });
  if (!sent.ok) {
    return redirectWithError(back, `The email was not sent, so nothing changed and the old link still works. ${sent.error}`);
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update(
      accept
        ? { token_hash: hashToken(token), status: "paid", paid_at: paidAt.toISOString() }
        : { token_hash: hashToken(token) },
    )
    .eq("id", order.id)
    .eq("user_id", user.id)
    .in("status", ["paid", "needs_review"]);
  if (updateError) {
    return redirectWithError(
      back,
      `The email was sent, but the order could not be updated (${updateError.message}). The link in that email will not work. Press the button again.`,
    );
  }
  redirectWithSaved(
    back,
    accept
      ? "Order accepted. The download link was sent to the buyer."
      : "A new download link was sent to the buyer. The old link no longer works.",
  );
}

// Marks an order as refunded and blocks its downloads. It does NOT move money: refund in the payment dashboard.
export async function refundOrderAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = ordersHref(resolveOrderFilter(field(formData, "filter")));
  const id = field(formData, "id");
  if (!id) return redirectWithError(back, "The order id is missing.");
  if (formData.get("confirm") !== "on") {
    return redirectWithError(back, "Tick the box to confirm that you want to mark this order as refunded.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "refunded" })
    .eq("id", id)
    .eq("user_id", user.id)
    .in("status", ["paid", "needs_review"])
    .select("id");
  if (error) return redirectWithError(back, `Could not save: ${error.message}`);
  if (!data || data.length === 0) {
    return redirectWithError(back, "Only paid orders, or orders that need review, can be marked as refunded.");
  }
  redirectWithSaved(back, "Marked as refunded. Downloads are blocked. Remember to refund the money in your payment dashboard.");
}