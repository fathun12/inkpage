import { dayKey, todayKey } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import type { Stats } from "@/types/analytics";

type EventRow = {
  kind: "view" | "click";
  block_id: string | null;
  device: string | null;
  created_at: string;
};

const PAGE = 1000;
const DAY = 86_400_000;

async function fetchEvents(userId: string, since: string): Promise<EventRow[]> {
  const supabase = await createClient();
  const rows: EventRow[] = [];
  for (let page = 0; page < 20; page++) {
    const { data, error } = await supabase
      .from("events")
      .select("kind, block_id, device, created_at")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .range(page * PAGE, page * PAGE + PAGE - 1);
    if (error || !data) break;
    rows.push(...(data as EventRow[]));
    if (data.length < PAGE) break;
  }
  return rows;
}

export async function getStats(userId: string, days: number): Promise<Stats> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * DAY).toISOString();
  const [events, blocksRes] = await Promise.all([
    fetchEvents(userId, since),
    supabase.from("blocks").select("id, title").eq("user_id", userId),
  ]);

  const titles = new Map(
    ((blocksRes.data ?? []) as { id: string; title: string }[]).map((b) => [b.id, b.title]),
  );

  const daily = new Map<string, { views: number; clicks: number }>();
  const end = new Date(`${todayKey()}T00:00:00Z`).getTime();
  for (let i = days - 1; i >= 0; i--) {
    daily.set(new Date(end - i * DAY).toISOString().slice(0, 10), { views: 0, clicks: 0 });
  }

  const clicksPerBlock = new Map<string, number>();
  const devices = new Map<string, number>();
  let views = 0;
  let clicks = 0;

  for (const e of events) {
    const bucket = daily.get(dayKey(e.created_at));
    if (e.kind === "view") {
      views++;
      if (bucket) bucket.views++;
      if (e.device) devices.set(e.device, (devices.get(e.device) ?? 0) + 1);
    } else {
      clicks++;
      if (bucket) bucket.clicks++;
      if (e.block_id) clicksPerBlock.set(e.block_id, (clicksPerBlock.get(e.block_id) ?? 0) + 1);
    }
  }

  return {
    days,
    views,
    clicks,
    ctr: views > 0 ? clicks / views : 0,
    daily: [...daily.entries()].map(([label, v]) => ({ label, ...v })),
    topBlocks: [...clicksPerBlock.entries()]
      .map(([id, count]) => ({ id, title: titles.get(id) ?? "Deleted block", clicks: count }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5),
    devices: [...devices.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  };
}