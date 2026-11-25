import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import type { CheckoutOrder, PaymentProvider, ProviderEvent } from "./types";

// Dodo Payments (Merchant of Record).
// Checkout: POST {base}/checkouts. Webhooks: the "Standard Webhooks" signature
// (headers webhook-id, webhook-timestamp, webhook-signature).

const baseUrls = {
  test_mode: "https://test.dodopayments.com",
  live_mode: "https://live.dodopayments.com",
} as const;

const requestTimeoutMs = 10_000;
// A webhook older or newer than this many seconds is refused (replay protection).
const toleranceSeconds = 300;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Json = Record<string, unknown>;

function asObject(value: unknown): Json | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Json) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

async function createCheckout(order: CheckoutOrder): Promise<string> {
  const apiKey = env.dodoApiKey;
  const mode = env.dodoEnvironment;
  if (!apiKey) throw new Error("DODO_PAYMENTS_API_KEY is missing.");
  if (!mode) throw new Error("DODO_PAYMENTS_ENVIRONMENT must be test_mode or live_mode.");
  if (!order.providerProductId) throw new Error("This product has no Dodo product id.");

  const response = await fetch(`${baseUrls[mode]}/checkouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      product_cart: [{ product_id: order.providerProductId, quantity: 1 }],
      customer: { email: order.email },
      return_url: order.returnUrl,
      // Dodo copies this onto the payment, so the webhook can name our order and email its page link.
      metadata: { order_id: order.id, order_token: order.token },
    }),
    signal: AbortSignal.timeout(requestTimeoutMs),
    cache: "no-store",
  });

  const text = await response.text();
  let json: Json | null = null;
  try {
    json = asObject(JSON.parse(text));
  } catch {
    json = null;
  }
  if (!response.ok) {
    const reason = asString(json?.message) ?? text.slice(0, 200);
    throw new Error(`Dodo answered ${response.status}: ${reason}`);
  }
  // The docs say only session_id is guaranteed, so a missing address is an error, not a crash.
  const url = asString(json?.checkout_url);
  if (!url) throw new Error("Dodo did not return a payment page address.");
  return url;
}

async function verifyWebhook(request: Request, rawBody: string): Promise<ProviderEvent | null> {
  const secret = env.dodoWebhookKey;
  if (!secret) throw new Error("DODO_PAYMENTS_WEBHOOK_KEY is missing.");

  const headers = request.headers;
  const id = headers.get("webhook-id") ?? headers.get("svix-id");
  const timestamp = headers.get("webhook-timestamp") ?? headers.get("svix-timestamp");
  const signatures = headers.get("webhook-signature") ?? headers.get("svix-signature");
  if (!id || !timestamp || !signatures) throw new Error("Missing signature headers.");

  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || Math.abs(Date.now() / 1000 - seconds) > toleranceSeconds) {
    throw new Error("The webhook timestamp is outside the allowed window.");
  }

  // The signing key is the base64 part after "whsec_". The signed text is "{id}.{timestamp}.{raw body}".
  const key = Buffer.from(secret.startsWith("whsec_") ? secret.slice(6) : secret, "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest();
  const valid = signatures.split(" ").some((part) => {
    const [version, value] = part.split(",");
    if (version !== "v1" || !value) return false;
    const given = Buffer.from(value, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
  if (!valid) throw new Error("bad signature");

  // From here the message is genuine. Anything we do not understand is ignored (answer 200, no retry).
  let body: Json | null;
  try {
    body = asObject(JSON.parse(rawBody));
  } catch {
    return null;
  }
  const type = asString(body?.type);
  const data = asObject(body?.data);
  if (!type || !data) return null;

  const providerRef = asString(data.payment_id);
  const metaOrder = asString(asObject(data.metadata)?.order_id);
  const orderId = metaOrder && uuidPattern.test(metaOrder) ? metaOrder : null;

  // webhook-id is the event id: Dodo reuses it on retries, so repeats are caught by webhook_events.
  if (type === "payment.succeeded" || type === "payment.failed" || type === "payment.cancelled") {
    if (!orderId) {
      console.warn("dodo webhook without a valid order_id", type, providerRef);
      return null;
    }
    const kind = type === "payment.succeeded" ? "paid" : type === "payment.failed" ? "failed" : "canceled";
    const orderToken = asString(asObject(data.metadata)?.order_token);
    return { eventId: id, kind, orderId, providerRef, orderToken };
  }

  if (type === "refund.succeeded") {
    // A partial refund leaves the order paid (the buyer keeps the file).
    if (data.is_partial === true) return null;
    if (!orderId && !providerRef) return null;
    return { eventId: id, kind: "refunded", orderId, providerRef };
  }

  return null;
}

export const dodoProvider: PaymentProvider = { id: "dodo", createCheckout, verifyWebhook };