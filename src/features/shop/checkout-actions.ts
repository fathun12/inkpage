"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { shopConfig } from "@/config/shop";
import { routes } from "@/config/site";
import { getProfileByUsername } from "@/features/profile/queries";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReceipt } from "./email";
import { getActiveProvider } from "./providers";
import { expireHolds } from "./stock";
import { hashToken, newToken } from "./token";

const reasons: Record<string, string> = {
  sold_out: "Sold out.",
  shop_closed: "The shop is closed right now.",
  not_available: "This product is not available.",
  already_claimed: "You already claimed this product with this email.",
  too_many_pending: "Too many unfinished orders for this email. Try again in a few minutes.",
};

// Back to the product page with a reason. The page shows it (parameter buy_error).
function back(username: string, productSlug: string, message: string): never {
  redirect(
    `${routes.section(username, "shop")}/${productSlug}?buy_error=${encodeURIComponent(message)}&t=${Date.now()}`,
  );
}

// Bind the first two arguments in the page: startCheckoutAction.bind(null, username, productSlug).
export async function startCheckoutAction(username: string, productSlug: string, formData: FormData): Promise<void> {
  const profile = await getProfileByUsername(username.toLowerCase());
  if (!profile) redirect("/");
  const fail = (message: string): never => back(profile.username, productSlug, message);

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!z.email().max(shopConfig.limits.email).safeParse(email).success) return fail("Enter a valid email address.");
  if (formData.get("agree") !== "on") return fail("Please agree to the Terms and the Refund policy.");

  const db = createAdminClient();

  // Price and status come from the database, never from the browser.
  const { data: product } = await db
    .from("products")
    .select("id, title, price_usd_cents, license_note, dodo_product_id")
    .eq("user_id", profile.id)
    .eq("slug", productSlug)
    .eq("status", "active")
    .maybeSingle();
  if (!product) return fail("This product is not available.");

  const paid = product.price_usd_cents > 0;
  const provider = paid ? getActiveProvider() : null;
  if (paid && !provider) return fail("Paid checkout is not connected yet.");
  // Checked before any stock is held. The only provider today is Dodo, which needs its own product id.
  if (provider && !product.dodo_product_id) return fail("This product is not ready for payment yet.");

  await expireHolds();
  const settings = await db
    .from("shop_settings")
    .select("updated_at, contact_email")
    .eq("user_id", profile.id)
    .maybeSingle();

  const token = newToken();
  const reserved = await db.rpc("shop_reserve", {
    p_product: product.id,
    p_email: email,
    p_provider: provider?.id ?? "free",
    p_token_hash: hashToken(token),
    p_terms_version: settings.data?.updated_at ?? "unknown",
    p_hold_minutes: shopConfig.holdMinutes,
  });
  if (reserved.error) {
    const message = reserved.error.message;
    const key = Object.keys(reasons).find((k) => message.includes(k));
    return fail(key ? reasons[key] : `Could not start checkout: ${message}`);
  }
  const orderId = reserved.data as string;
  const orderPath = `${routes.profile(profile.username)}/order/${token}`;

  const origin = (await getSiteUrl()).replace(/\/$/, "");

  // Free product: the order is already paid. Send the receipt, then go to the order page to download.
  // A failed email never blocks the order: the buyer still has the order page.
  if (!provider) {
    const sent = await sendReceipt({
      to: email,
      orderId,
      title: product.title,
      priceCents: product.price_usd_cents,
      paidAt: new Date(),
      orderUrl: `${origin}${orderPath}`,
      license: product.license_note,
      replyTo: settings.data?.contact_email ?? null,
    });
    if (!sent.ok) console.error("shop receipt failed", orderId, sent.error);
    redirect(orderPath);
  }

  let url: string;
  try {
    url = await provider.createCheckout({
      id: orderId,
      title: product.title,
      amountCents: product.price_usd_cents,
      currency: "USD",
      email,
      providerProductId: product.dodo_product_id,
      returnUrl: `${origin}${orderPath}`,
    });
  } catch (e) {
    await db.rpc("shop_release", { p_order: orderId, p_status: "failed" });
    return fail(`Could not start checkout: ${e instanceof Error ? e.message : "unknown error"}`);
  }
  redirect(url);
}