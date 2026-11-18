import { NextResponse, type NextRequest } from "next/server";
import { detectDevice } from "@/features/analytics/device";
import { isLive } from "@/lib/schedule";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const home = new URL("/", request.nextUrl.origin);

  const supabase = await createClient();
  const { data: block } = await supabase
    .from("blocks")
    .select("id, user_id, type, url, is_visible, publish_at, expire_at")
    .eq("id", id)
    .maybeSingle();

  if (
    !block ||
    (block.type !== "link" && block.type !== "project") ||
    !block.url ||
    !isLive(block)
  ) {
    return NextResponse.redirect(home);
  }

  const device = detectDevice(request.headers.get("user-agent"));
  if (device) {
    const { data } = await supabase.auth.getUser();
    if (data.user?.id !== block.user_id) {
      await supabase
        .from("events")
        .insert({ user_id: block.user_id, block_id: block.id, kind: "click", device });
    }
  }

  return NextResponse.redirect(block.url, 302);
}