import { itemLimits } from "@/config/item-data";
import {
  downloadLogos,
  itemRatios,
  type Block,
  type DownloadLogo,
  type ItemDownload,
  type ItemFile,
  type ItemLink,
} from "@/types/block";
import { mediaKind, type MediaKind } from "./site-view";
import { socialLabel } from "./social";
import { isHttpUrl } from "./validation";

// Safe readers for the data of Projects and Writing items. They never throw: empty or broken data
// becomes empty lists. Older items (image_url, data.nexus, data.github) are still read.

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function link(v: unknown): string | null {
  return typeof v === "string" && isHttpUrl(v) ? v : null;
}

function str(v: unknown, max: number): string | null {
  return typeof v === "string" && v.trim() !== "" ? v.trim().slice(0, max) : null;
}

function pick<T extends string>(v: unknown, list: readonly T[], fallback: T): T {
  return typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback;
}

// The logo that fits an address. Anything else gets no logo.
export function detectLogo(address: string): DownloadLogo {
  try {
    const host = new URL(address).hostname.replace(/^www\./, "");
    if (host === "nexusmods.com" || host.endsWith(".nexusmods.com")) return "nexus";
    if (host === "github.com" || host.endsWith(".github.com")) return "github";
  } catch {
    // Not a valid address: no logo.
  }
  return "none";
}

function readFiles(raw: unknown): ItemFile[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, itemLimits.files).flatMap((item): ItemFile[] => {
    const f = obj(item);
    const url = link(f.url);
    if (!url) return [];
    return [{ url, ratio: pick(f.ratio, itemRatios, "landscape"), credit: str(f.credit, itemLimits.credit) }];
  });
}

function readDownloads(d: Record<string, unknown>): ItemDownload[] {
  const list: ItemDownload[] = Array.isArray(d.downloads)
    ? d.downloads.flatMap((item): ItemDownload[] => {
        const x = obj(item);
        const url = link(x.url);
        return url ? [{ url, logo: pick(x.logo, downloadLogos, detectLogo(url)), logoUrl: link(x.logoUrl) }] : [];
      })
    : [];
  // Older items kept one Nexus link and one GitHub link.
  for (const key of ["nexus", "github"] as const) {
    const url = link(d[key]);
    if (url && !list.some((x) => x.url === url)) list.push({ url, logo: key });
  }
  return list.slice(0, itemLimits.downloads);
}

function readLinks(raw: unknown): ItemLink[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, itemLimits.links).flatMap((item): ItemLink[] => {
    const x = obj(item);
    const url = link(x.url);
    return url ? [{ url, label: str(x.label, itemLimits.label) ?? socialLabel(url) }] : [];
  });
}

export type ProjectFile = ItemFile & { kind: MediaKind };

export type ProjectItem = {
  id: string;
  title: string;
  body: string | null;
  url: string | null;
  files: ProjectFile[];
  downloads: ItemDownload[];
  links: ItemLink[];
  home: boolean;
  showcase: boolean;
};

export function readProjectItem(block: Block): ProjectItem {
  const d = obj(block.data);
  let files = readFiles(d.files);
  // Older items had one cover image.
  if (files.length === 0 && block.image_url) {
    files = [{ url: block.image_url, ratio: "landscape", credit: null }];
  }
  return {
    id: block.id,
    title: block.title,
    body: block.body,
    url: block.url,
    files: files.map((f) => ({ ...f, kind: mediaKind(f.url) })),
    downloads: readDownloads(d),
    links: readLinks(d.links),
    home: d.home === true,
    showcase: d.showcase === true,
  };
}

export type WritingItem = {
  id: string;
  title: string;
  url: string | null;
  body: string | null;
  // The image to show: the uploaded one, or else the one read from the link.
  image: string | null;
  // Only the uploaded image (the admin form edits this one).
  uploaded: string | null;
  // Name of the site the link goes to (Medium, skrib.my.id, ...).
  source: string | null;
  home: boolean;
};

export function readWritingItem(block: Block): WritingItem {
  const d = obj(block.data);
  return {
    id: block.id,
    title: block.title,
    url: block.url,
    body: block.body,
    image: block.image_url ?? link(d.og),
    uploaded: block.image_url,
    source: block.url ? socialLabel(block.url) : null,
    home: d.home === true,
  };
}

// Which file of a project goes where. The Home card (13c) and the Showcase (13d) use these same rules.
// Home card: A = first photo; B = first GIF or video, or else the second photo.
export function pickHomeMedia<T extends { kind: MediaKind }>(files: T[]): { a: T | null; b: T | null } {
  const images = files.filter((f) => f.kind === "image");
  const motion = files.filter((f) => f.kind !== "image");
  const a = images[0] ?? motion[0] ?? null;
  const b = motion.find((f) => f !== a) ?? images.find((f) => f !== a) ?? null;
  return { a, b };
}

// Showcase: main = first GIF or video (or else the first file); then up to 3 photos.
export function pickShowcase<T extends { kind: MediaKind }>(files: T[]): { main: T | null; photos: T[] } {
  const main = files.find((f) => f.kind !== "image") ?? files[0] ?? null;
  const photos = files.filter((f) => f !== main && f.kind === "image").slice(0, itemLimits.showcasePhotos);
  return { main, photos };
}

// The label under each file in the admin: where that file is used.
export function roleLabels(kinds: MediaKind[]): string[] {
  const files = kinds.map((kind) => ({ kind }));
  const home = pickHomeMedia(files);
  const show = pickShowcase(files);
  return files.map((f) => {
    const parts: string[] = [];
    if (f === home.a) parts.push("Home A");
    if (f === home.b) parts.push("Home B");
    if (f === show.main) parts.push("Showcase main");
    const at = show.photos.indexOf(f);
    if (at >= 0) parts.push(`Showcase photo ${at + 1}`);
    return parts.length > 0 ? parts.join(" · ") : "Projects page only";
  });
}