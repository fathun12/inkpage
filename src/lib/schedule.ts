import type { Block, BlockStatus } from "@/types/block";

type Timing = Pick<Block, "is_visible" | "publish_at" | "expire_at">;

export function scheduleState(block: Timing, now: number = Date.now()): BlockStatus {
  if (!block.is_visible) return "hidden";
  if (block.publish_at && Date.parse(block.publish_at) > now) return "scheduled";
  if (block.expire_at && Date.parse(block.expire_at) <= now) return "expired";
  return "live";
}

export function isLive(block: Timing, now?: number): boolean {
  return scheduleState(block, now) === "live";
}