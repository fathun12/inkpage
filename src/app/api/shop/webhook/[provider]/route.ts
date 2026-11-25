import { NextResponse } from "next/server";
import { getProvider } from "@/features/shop/providers";
import type { ProviderEvent } from "@/features/shop/providers/types";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ provider: string }> };

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