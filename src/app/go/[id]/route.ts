import { NextResponse, type NextRequest } from "next/server";
import { detectDevice } from "@/features/analytics/device";
import { isLive } from "@/lib/schedule";
import { createClient } from "@/lib/supabase/server";

type SocialItem = { url?: string; label?: string };
type Target = { url: string; label: string | null };

// Works out where a block sends the visitor. Social blocks hold several links, so ?i= picks one.
function resolveTarget(
  block: { type: string; url: string | null; data: unknown },
  index: string | null,
): Target | null {
  if (block.type === "link" || block.type === "project") {
    return block.url ? { url: block.url, label: null } : null;
  }
  if (block.type === "socials" && index !== null) {
    const items = (block.data as { items?: SocialItem[] } | null)?.items ?? [];
    const item = items[Number(index)];
    if (!item?.url) return null;
    return { url: item.url, label: item.label ? item.label.slice(0, 40) : null };
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const home = new URL("/", request.nextUrl.origin);

  const supabase = await createClient();
  const { data: block } = await supabase
    .from("blocks")
    .select("id, user_id, type, url, data, is_visible, publish_at, expire_at")
    .eq("id", id)
    .maybeSingle();

  if (!block || !isLive(block)) return NextResponse.redirect(home);

  const target = resolveTarget(block, request.nextUrl.searchParams.get("i"));
  if (!target || !/^https?:\/\//i.test(target.url)) return NextResponse.redirect(home);

  const device = detectDevice(request.headers.get("user-agent"));
  if (device) {
    const { data } = await supabase.auth.getUser();
    if (data.user?.id !== block.user_id) {
      await supabase.from("events").insert({
        user_id: block.user_id,
        block_id: block.id,
        kind: "click",
        device,
        ...(target.label ? { label: target.label } : {}),
      });
    }
  }

  return NextResponse.redirect(target.url, 302);
}