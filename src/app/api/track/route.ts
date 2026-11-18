import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { detectDevice, referrerHost } from "@/features/analytics/device";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  username: z.string().min(1).max(40),
  referrer: z.string().max(500).optional(),
});

const empty = (status: number) => new NextResponse(null, { status });

export async function POST(request: NextRequest) {
  const device = detectDevice(request.headers.get("user-agent"));
  if (!device) return empty(204);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return empty(400);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", parsed.data.username.toLowerCase())
    .maybeSingle();
  if (!profile) return empty(404);

  const { data } = await supabase.auth.getUser();
  if (data.user?.id === profile.id) return empty(204); // the owner's own visits are not counted

  await supabase.from("events").insert({
    user_id: profile.id,
    kind: "view",
    device,
    referrer: referrerHost(parsed.data.referrer),
  });
  return empty(204);
}