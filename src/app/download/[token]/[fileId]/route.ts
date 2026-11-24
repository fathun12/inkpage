import { NextResponse } from "next/server";
import { shopConfig } from "@/config/shop";
import { hashToken } from "@/features/shop/token";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ token: string; fileId: string }> };

const headers = { "Cache-Control": "no-store" };

function reply(message: string, status: number) {
  return new NextResponse(message, { status, headers });
}

// A download: check the order, count it, then send the buyer to a short-lived signed address.
export async function GET(_request: Request, { params }: Ctx) {
  const { token, fileId } = await params;
  const db = createAdminClient();

  const { data: order } = await db
    .from("orders")
    .select("id, user_id, product_id, status, paid_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!order || order.status !== "paid" || !order.paid_at) return reply("Not found.", 404);

  const ends = new Date(order.paid_at).getTime() + shopConfig.grantDays * 86_400_000;
  if (Date.now() > ends) return reply("This download link has expired. Contact the seller.", 410);

  const { data: file } = await db
    .from("product_files")
    .select("id, path, name")
    .eq("id", fileId)
    .eq("product_id", order.product_id)
    .maybeSingle();
  if (!file) return reply("Not found.", 404);

  const { count } = await db
    .from("downloads")
    .select("id", { count: "exact", head: true })
    .eq("order_id", order.id)
    .eq("product_file_id", file.id);
  if ((count ?? 0) >= shopConfig.grantMaxDownloads) {
    return reply("Download limit reached for this file. Contact the seller.", 429);
  }

  const signed = await db.storage.from(shopConfig.bucket).createSignedUrl(file.path, shopConfig.signedUrlSeconds, {
    download: file.name,
  });
  if (signed.error || !signed.data) return reply("Could not prepare the file. Try again.", 500);

  const logged = await db
    .from("downloads")
    .insert({ order_id: order.id, user_id: order.user_id, product_file_id: file.id });
  if (logged.error) return reply("Could not prepare the file. Try again.", 500);

  return NextResponse.redirect(signed.data.signedUrl, { status: 302, headers });
}