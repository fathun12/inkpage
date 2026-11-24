import { NextResponse } from "next/server";
import { runHoldCleanup } from "@/features/shop/stock";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

// Called once a day by Vercel Cron (see vercel.json). Gives back the stock of orders whose hold ran out.
// Vercel sends "Authorization: Bearer <CRON_SECRET>". Anything else is refused.
export async function GET(request: Request) {
  const secret = env.cronSecret;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const result = await runHoldCleanup();
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true, expired: result.expired });
}