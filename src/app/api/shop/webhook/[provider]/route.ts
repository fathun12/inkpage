import { NextResponse } from "next/server";
import { routes } from "@/config/site";
import { sendReceipt } from "@/features/shop/email";
import { getProvider } from "@/features/shop/providers";
import type { ProviderEvent } from "@/features/shop/providers/types";
import { hashToken, newToken } from "@/features/shop/token";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ provider: string }> };

// After a payment: make the buyer's real order token (only its hash is stored), then email the order page link.
// The hash is saved BEFORE the email, so the link in the email always works. Never throws: the order is already
// paid, and an error here would make Dodo retry the whole webhook. If the email fails the owner presses
// "Send link again" in the Orders tab.
async function sendPaidReceipt(db: ReturnType<typeof createAdminClient>, event: ProviderEvent): Promise<void> {
  try {
    if (!event.orderId) return;
    const { data: order } = await db
      .from("orders")
      .select("id, user_id, email, amount_cents, paid_at, products(title, license_note)")
      .eq("id", event.orderId)
      .eq("status", "paid")
      .maybeSingle();
    if (!order) {
      console.warn("shop: receipt skipped, the order is not paid", event.orderId);
      return;
    }
    const [profile, settings] = await Promise.all([
      db.from("profiles").select("username").eq("id", order.user_id).maybeSingle(),
      db.from("shop_settings").select("contact_email").eq("user_id", order.user_id).maybeSingle(),
    ]);
    if (!profile.data) return;

    const token = newToken();
    const saved = await db
      .from("orders")
      .update({ token_hash: hashToken(token) })
      .eq("id", order.id)
      .eq("status", "paid");
    if (saved.error) {
      console.error("shop receipt failed: token not saved", order.id, saved.error.message);
      return;
    }

    const product = Array.isArray(order.products) ? order.products[0] : order.products;
    const origin = (await getSiteUrl()).replace(/\/$/, "");
    const sent = await sendReceipt({
      to: order.email,
      orderId: order.id,
      title: product?.title ?? "Your order",
      priceCents: order.amount_cents,
      paidAt: order.paid_at ? new Date(order.paid_at) : new Date(),
      orderUrl: `${origin}${routes.profile(profile.data.username)}/order/${token}`,
      license: product?.license_note ?? null,
      replyTo: settings.data?.contact_email ?? null,
    });
    if (!sent.ok) console.error("shop receipt failed", order.id, sent.error);
  } catch (e) {
    console.error("shop receipt failed", e instanceof Error ? e.message : e);
  }
}

async function apply(db: ReturnType<typeof createAdminClient>, event: ProviderEvent): Promise<void> {
  if (event.kind === "refunded") {
    // A refund event may name only the provider's payment: then the saved payment reference finds the order.
    const reference = event.orderId ?? event.providerRef;
    if (!reference) return;
    const update = db.from("orders").update({ status: "refunded" }).eq("status", "paid");
    const { error } = await (event.orderId ? update.eq("id", event.orderId) : update.eq("provider_ref", reference));
    if (error) throw new Error(error.message);
    return;
  }
  if (!event.orderId) return;
  if (event.kind === "paid") {
    const { data, error } = await db.rpc("shop_settle", { p_order: event.orderId, p_provider_ref: event.providerRef });
    if (error) throw new Error(error.message);
    if (data === "needs_review") console.warn("shop: late payment needs review", event.orderId);
    // Only the first settlement sends the receipt ("already_paid" means an earlier event did it).
    if (data === "paid" || data === "paid_late") await sendPaidReceipt(db, event);
    return;
  }
  const { error } = await db.rpc("shop_release", { p_order: event.orderId, p_status: event.kind });
  if (error) throw new Error(error.message);
}

export async function POST(request: Request, { params }: Ctx) {
  const { provider: id } = await params;
  const provider = getProvider(id);
  if (!provider) return NextResponse.json({ error: "unknown provider" }, { status: 404 });

  // The signature is checked on the raw body, so read it as text first.
  const raw = await request.text();
  let event: ProviderEvent | null;
  try {
    event = await provider.verifyWebhook(request, raw);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  if (!event) return NextResponse.json({ ok: true, ignored: true });

  const db = createAdminClient();

  // Every event once: provider + event id is unique. Only the kind and the order id are stored.
  const seen = await db
    .from("webhook_events")
    .insert({ provider: id, event_id: event.eventId, payload: { kind: event.kind, orderId: event.orderId } });
  if (seen.error) {
    if (seen.error.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    console.error("webhook_events insert failed", seen.error.message);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }

  try {
    await apply(db, event);
  } catch (e) {
    // Forget the event so the provider's retry is processed again.
    await db.from("webhook_events").delete().eq("provider", id).eq("event_id", event.eventId);
    console.error("webhook apply failed", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}