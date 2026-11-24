import "server-only";
import { shopConfig } from "@/config/shop";
import { env } from "@/lib/env";

const API_URL = "https://api.brevo.com/v3/smtp/email";

export type ReceiptInput = {
  to: string;
  orderId: string;
  title: string;
  priceCents: number;
  paidAt: Date;
  // The order page, with the buyer's secret token. This is the download link.
  orderUrl: string;
  license: string | null;
  // The seller's contact email (Shop settings). Replies go here, because the sender is a noreply address.
  replyTo: string | null;
};

export type MailResult = { ok: true } | { ok: false; error: string };

// Brevo fills {{params.x}} inside the HTML, so braces from a product title must never arrive as braces.
function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

function priceText(cents: number): string {
  return cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)} USD`;
}

function dateText(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

// Email clients ignore our design tokens and web fonts, so this one file uses plain inline styles.
function receiptHtml(input: ReceiptInput): string {
  const rows: [string, string][] = [
    ["Order", input.orderId.slice(0, 8).toUpperCase()],
    ["Product", input.title],
    ["Price", priceText(input.priceCents)],
    ["Date", dateText(input.paidAt)],
  ];
  const cell = "padding:8px 0;border-top:1px solid #111111;font-size:14px;vertical-align:top;";
  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="${cell}color:#666666;width:90px;">${esc(k)}</td><td style="${cell}">${esc(v)}</td></tr>`,
    )
    .join("");
  const license = input.license
    ? `<p style="margin:24px 0 4px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#666666;">License</p>
       <p style="margin:0;font-size:14px;white-space:pre-line;">${esc(input.license)}</p>`
    : "";

  return `<!doctype html><html><body style="margin:0;padding:24px;background:#ffffff;color:#111111;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;">
<h1 style="margin:0 0 16px;font-size:22px;font-weight:500;">Thank you for your order.</h1>
<table style="width:100%;border-collapse:collapse;border-bottom:1px solid #111111;">${table}</table>
<p style="margin:24px 0 12px;font-size:14px;">Your files are on your order page:</p>
<p style="margin:0 0 12px;"><a href="${esc(input.orderUrl)}" style="display:inline-block;padding:10px 18px;border:1px solid #111111;color:#111111;text-decoration:none;font-size:14px;">Open my order</a></p>
<p style="margin:0;font-size:13px;color:#666666;">Keep this email: the link works for ${shopConfig.grantDays} days, up to ${shopConfig.grantMaxDownloads} downloads per file.</p>
${license}
<p style="margin:24px 0 0;font-size:12px;color:#666666;">This is an automated message. Reply to this email to reach the seller.</p>
</div></body></html>`;
}

// Never throws: a failed email must not break an order.
export async function sendReceipt(input: ReceiptInput): Promise<MailResult> {
  const apiKey = env.brevoApiKey;
  const senderEmail = env.brevoSenderEmail;
  if (!apiKey || !senderEmail) {
    return { ok: false, error: "Email is not set up (BREVO_API_KEY or BREVO_SENDER_EMAIL is missing)." };
  }
  const senderName = (env.brevoSenderName ?? shopConfig.mail.fallbackSenderName).slice(0, 70);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: input.to }],
        replyTo: input.replyTo ? { email: input.replyTo } : undefined,
        subject: `Your order: ${input.title}`.slice(0, 150),
        htmlContent: receiptHtml(input),
        tags: ["shop-receipt"],
      }),
      signal: AbortSignal.timeout(shopConfig.mail.timeoutMs),
      cache: "no-store",
    });
    if (res.ok) return { ok: true };

    let detail = "";
    try {
      const body = (await res.json()) as { code?: string; message?: string };
      detail = [body.code, body.message].filter(Boolean).join(": ");
    } catch {
      // The body was not JSON. The status code is enough.
    }
    return { ok: false, error: `Brevo ${res.status}${detail ? ` (${detail})` : ""}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown error" };
  }
}