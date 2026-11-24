import type { DesignKind, DesignProject, DesignsData } from "@/types/designs";
import { safeUrl } from "./og";

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function image(v: unknown): string | null {
  if (typeof v !== "string" || !v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Reads the projects of the House Showcase website through its public endpoint, then picks `count` projects
// at random, each with up to 3 random documentation photos. Server only, 5 seconds at most, private addresses
// are refused, the answer is cached for 5 minutes. Any failure gives null, so the section is simply not shown.
export async function fetchDesigns(address: string | null, count: number): Promise<DesignsData | null> {
  if (!address) return null;
  let origin: string;
  try {
    origin = new URL(address).origin;
  } catch {
    return null;
  }
  const api = await safeUrl(`${origin}/api/public/projects?limit=12`);
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
    const list = Array.isArray(json.projects) ? json.projects : [];
    const all = list.slice(0, 12).flatMap((item): DesignProject[] => {
      const p = obj(item);
      const slug = typeof p.slug === "string" && /^[a-z0-9-]{1,80}$/.test(p.slug) ? p.slug : null;
      const kind: DesignKind | null = p.kind === "house" || p.kind === "furniture" ? p.kind : null;
      const title = str(p.titleEn, 160) || str(p.titleId, 160);
      const path = typeof p.path === "string" && /^\/[A-Za-z0-9/_-]{1,120}$/.test(p.path) ? p.path : null;
      if (!slug || !kind || !title || !path) return [];
      const photos = Array.isArray(p.photos)
        ? p.photos.map(image).filter((x): x is string => x !== null)
        : [];
      return [
        {
          slug,
          kind,
          title,
          tagline: (str(p.taglineEn, 200) || str(p.taglineId, 200)).slice(0, 200),
          cover: image(p.cover),
          photos,
          href: `${origin}${path}`,
        },
      ];
    });
    const projects = shuffle(all)
      .slice(0, count)
      .map((p) => ({ ...p, photos: shuffle(p.photos) }));
    return { total: typeof json.total === "number" ? json.total : all.length, projects };
  } catch {
    return null;
  }
}