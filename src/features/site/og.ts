import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Reads the og:image of a page. Runs only on the server, when a Writing item is saved.
// Only http and https, 5 seconds in total, local and private addresses are refused (SSRF),
// every redirect is checked again. Only the address of the image is kept; the image is never downloaded.
const timeoutMs = 5000;
const maxBytes = 300_000;
const maxHops = 3;

function privateV4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

function privateIp(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return privateV4(ip);
  if (kind === 6) {
    const l = ip.toLowerCase();
    if (l === "::" || l === "::1") return true;
    if (l.startsWith("::ffff:")) {
      const rest = l.slice(7);
      return isIP(rest) === 4 ? privateV4(rest) : true;
    }
    return /^(fc|fd|fe[89ab])/.test(l);
  }
  return true;
}

export async function safeUrl(raw: string): Promise<URL | null> {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || /\.(localhost|local|internal)$/i.test(host)) return null;
  if (isIP(host)) return privateIp(host) ? null : u;
  try {
    const found = await lookup(host, { all: true });
    if (found.length === 0 || found.some((a) => privateIp(a.address))) return null;
  } catch {
    return null;
  }
  return u;
}

async function readLimited(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let html = "";
  let size = 0;
  while (size < maxBytes) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    size += value.length;
    html += decoder.decode(value, { stream: true });
  }
  await reader.cancel().catch(() => undefined);
  return html;
}

function parseOg(html: string, base: URL): string | null {
  const wanted = ["og:image", "og:image:secure_url", "og:image:url", "twitter:image"];
  const found = new Map<string, string>();
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? "";
    }
    const key = (attrs.property ?? attrs.name ?? "").toLowerCase();
    if (wanted.includes(key) && attrs.content && !found.has(key)) found.set(key, attrs.content);
  }
  for (const key of wanted) {
    const value = found.get(key)?.replace(/&amp;/g, "&").trim();
    if (!value) continue;
    try {
      const abs = new URL(value, base);
      if ((abs.protocol === "http:" || abs.protocol === "https:") && abs.href.length <= 2000) return abs.href;
    } catch {
      // Not an address: try the next one.
    }
  }
  return null;
}

export async function fetchOgImage(raw: string): Promise<string | null> {
  try {
    const signal = AbortSignal.timeout(timeoutMs);
    let current = await safeUrl(raw);
    for (let hop = 0; current && hop <= maxHops; hop++) {
      const res = await fetch(current, {
        redirect: "manual",
        signal,
        headers: { "user-agent": "Mozilla/5.0 (compatible; InkpageBot/1.0)", accept: "text/html" },
      });
      if (res.status >= 300 && res.status < 400) {
        const where = res.headers.get("location");
        if (!where) return null;
        current = await safeUrl(new URL(where, current).href);
        continue;
      }
      if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) return null;
      return parseOg(await readLimited(res), current);
    }
    return null;
  } catch {
    return null;
  }
}