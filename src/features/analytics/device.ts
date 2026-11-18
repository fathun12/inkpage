export type Device = "mobile" | "tablet" | "desktop";

/** Returns null for bots and empty user agents (they are not counted). */
export function detectDevice(ua: string | null): Device | null {
  if (!ua) return null;
  if (/bot|crawl|spider|slurp|preview|facebookexternalhit|headless|curl|wget/i.test(ua)) return null;
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

export function referrerHost(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).host.replace(/^www\./, "");
  } catch {
    return null;
  }
}