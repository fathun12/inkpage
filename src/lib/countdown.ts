import { countdownConfig, type CountdownStage } from "@/config/countdown";

// Which message the countdown shows. start, end and now are in seconds.
// now = 0 means "not known yet" (the server render), which shows the first message.
export function countdownStage(start: number, end: number, now: number): CountdownStage {
  if (now === 0) return "coming";
  const left = end - now;
  if (left <= 0) return "done";
  const total = end - start;
  if (total <= 0) return "coming";
  const share = (left / total) * 100;
  if (share <= countdownConfig.nearlyPercent) return "nearly";
  if (share <= countdownConfig.almostPercent) return "almost";
  return "coming";
}