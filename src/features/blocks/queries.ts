import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isLive, scheduleState } from "@/lib/schedule";
import type { Block, BlockView } from "@/types/block";

// cache: the site layout and the page both ask for the blocks, but the database is asked once.
export const getPublicBlocks = cache(async (userId: string): Promise<Block[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocks")
    .select("*")
    .eq("user_id", userId)
    .eq("is_visible", true)
    .order("position", { ascending: true });

  const now = Date.now();
  const live = ((data ?? []) as Block[]).filter((b) => isLive(b, now));
  return [...live.filter((b) => b.is_pinned), ...live.filter((b) => !b.is_pinned)];
});

export async function getOwnBlocks(userId: string): Promise<BlockView[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocks")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true });

  const now = Date.now();
  return ((data ?? []) as Block[]).map((b) => ({ ...b, status: scheduleState(b, now) }));
}