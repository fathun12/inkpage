import type { BibliaBook, BibliaData } from "@/types/biblia";
import { safeUrl } from "./og";

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

// Reads the books of the Biblia library through its public endpoint. Server only, 5 seconds at most,
// private addresses are refused, the answer is cached for 5 minutes. Any failure gives null, so the
// website simply shows no Biblia section instead of breaking.
export async function fetchBiblia(address: string | null, limit: number): Promise<BibliaData | null> {
  if (!address) return null;
  let origin: string;
  try {
    origin = new URL(address).origin;
  } catch {
    return null;
  }
  const api = await safeUrl(`${origin}/api/public/books?limit=${limit}`);
  if (!api) return null;
  try {
    const res = await fetch(api, {
      redirect: "error",
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 300 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = obj(await res.json());
    const list = Array.isArray(json.books) ? json.books : [];
    const books = list.slice(0, limit).flatMap((item): BibliaBook[] => {
      const b = obj(item);
      const slug = typeof b.slug === "string" && /^[a-z0-9-]{1,80}$/.test(b.slug) ? b.slug : null;
      const title = typeof b.title === "string" ? b.title.trim().slice(0, 160) : "";
      if (!slug || !title) return [];
      let cover: string | null = null;
      if (typeof b.coverUrl === "string" && b.coverUrl) {
        try {
          const u = new URL(b.coverUrl, origin);
          if (u.protocol === "https:" || u.protocol === "http:") cover = u.href;
        } catch {
          // Not an address: the card shows a plain cover instead.
        }
      }
      return [
        {
          slug,
          title,
          authors: Array.isArray(b.authors)
            ? b.authors.filter((a): a is string => typeof a === "string").slice(0, 3).map((a) => a.slice(0, 80))
            : [],
          year: typeof b.year === "number" && Number.isInteger(b.year) ? b.year : null,
          cover,
          available: typeof b.available === "number" && b.available > 0,
          href: `${origin}/books/${slug}`,
        },
      ];
    });
    return { titles: typeof json.titles === "number" ? json.titles : books.length, books };
  } catch {
    return null;
  }
}