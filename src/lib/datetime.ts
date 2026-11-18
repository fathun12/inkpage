import { siteConfig } from "@/config/site";

const MINUTE = 60_000;

/** "2026-11-18T10:00" typed in the site timezone -> UTC ISO string */
export function localInputToIso(value?: string): string | null {
  if (!value) return null;
  const ms = Date.parse(`${value}:00Z`);
  if (Number.isNaN(ms)) return null;
  return new Date(ms - siteConfig.utcOffsetMinutes * MINUTE).toISOString();
}

/** UTC ISO string -> "2026-11-18T10:00" in the site timezone */
export function isoToLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  return new Date(ms + siteConfig.utcOffsetMinutes * MINUTE).toISOString().slice(0, 16);
}

export function dayKey(iso: string): string {
  return isoToLocalInput(iso).slice(0, 10);
}

export function todayKey(): string {
  return dayKey(new Date().toISOString());
}