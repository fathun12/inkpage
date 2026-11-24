import { articleConfig, articleImages, articleLimits } from "@/config/article";
import { mediaConfig } from "@/config/media";
import type { ArticleState, DocMark, DocNode } from "@/types/article";

export const emptyDoc: DocNode = { type: "doc", content: [{ type: "paragraph" }] };

// Only what the editor can make. Anything else is dropped when saving (the server never trusts the browser).
const blockTypes = new Set(["paragraph", "heading", "blockquote", "bulletList", "orderedList", "listItem"]);
const leafTypes = new Set(["horizontalRule", "hardBreak"]);
const markTypes = new Set(["bold", "italic", "underline", "code", "link"]);
const textBlocks = new Set(["paragraph", "heading", "listItem", "blockquote"]);

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function isSafeHref(href: unknown): href is string {
  return typeof href === "string" && href.length <= 2000 && /^(https?:\/\/|mailto:)/i.test(href.trim());
}

const bucketName = mediaConfig.bucket.replace(/[^\w-]/g, "");

// A picture of an article lives in OUR bucket: .../public/<bucket>/<user>/articles/<article>/<file>.
// With userId, it must also be that user's folder.
export function isArticleImageSrc(src: unknown, userId?: string): src is string {
  if (typeof src !== "string" || src.length > 500) return false;
  const owner = userId && /^[0-9a-f-]{36}$/i.test(userId) ? userId : "[0-9a-f-]{36}";
  const pattern = new RegExp(
    `^https://[^/\\s]+/storage/v1/object/public/${bucketName}/${owner}/${articleImages.folder}/[0-9a-f-]{36}/(?:cover-)?[0-9a-f-]{36}\\.(?:webp|jpg|png)$`,
    "i",
  );
  return pattern.test(src);
}

// Every picture address in a document (used to know which stored files are still needed).
export function collectImageUrls(node: DocNode, out: string[] = []): string[] {
  if (node.type === "image" && typeof node.attrs?.src === "string") out.push(node.attrs.src);
  node.content?.forEach((child) => collectImageUrls(child, out));
  return out;
}

// What a writer types in the link box: "example.com" becomes https://example.com. null = not a usable link.
export function normalizeHref(input: string): string | null {
  const value = input.trim();
  if (value === "") return null;
  if (/^(https?:\/\/|mailto:)/i.test(value)) return isSafeHref(value) ? value : null;
  if (!/\s/.test(value) && /^[^\s/]+\.[^\s/]+/.test(value)) {
    const withScheme = `https://${value}`;
    return isSafeHref(withScheme) ? withScheme : null;
  }
  return null;
}

type RawNode = { type?: unknown; attrs?: Record<string, unknown>; content?: unknown; text?: unknown; marks?: unknown };

function cleanMarks(raw: unknown): DocMark[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: DocMark[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const mark = item as { type?: unknown; attrs?: { href?: unknown } };
    if (typeof mark.type !== "string" || !markTypes.has(mark.type)) continue;
    if (mark.type === "link") {
      const href = mark.attrs?.href;
      if (isSafeHref(href)) out.push({ type: "link", attrs: { href: href.trim() } });
      continue;
    }
    out.push({ type: mark.type });
  }
  return out.length > 0 ? out : undefined;
}

type Budget = { nodes: number; images: number; userId?: string };

function cleanNode(raw: unknown, depth: number, budget: Budget): DocNode | null {
  if (typeof raw !== "object" || raw === null || depth > articleLimits.depth) return null;
  budget.nodes += 1;
  if (budget.nodes > articleLimits.nodes) return null;
  const n = raw as RawNode;

  if (n.type === "text") {
    if (typeof n.text !== "string" || n.text === "") return null;
    const node: DocNode = { type: "text", text: n.text.slice(0, articleLimits.textNode) };
    const marks = cleanMarks(n.marks);
    if (marks) node.marks = marks;
    return node;
  }
  if (typeof n.type !== "string") return null;
  if (n.type === "image") {
    const src = n.attrs?.src;
    if (!isArticleImageSrc(src, budget.userId) || budget.images >= articleImages.maxPerArticle) return null;
    budget.images += 1;
    const caption = typeof n.attrs?.caption === "string" ? n.attrs.caption.trim().slice(0, articleLimits.caption) : "";
    return { type: "image", attrs: caption ? { src, caption } : { src } };
  }
  if (leafTypes.has(n.type)) return { type: n.type };
  if (!blockTypes.has(n.type)) return null;

  const node: DocNode = { type: n.type };
  if (n.type === "heading") node.attrs = { level: n.attrs?.level === 3 ? 3 : 2 };
  if (n.type === "orderedList") {
    const start = n.attrs?.start;
    if (typeof start === "number" && Number.isInteger(start) && start > 1 && start < 10_000) node.attrs = { start };
  }
  if (Array.isArray(n.content)) {
    const kids: DocNode[] = [];
    for (const child of n.content) {
      const clean = cleanNode(child, depth + 1, budget);
      if (clean) kids.push(clean);
    }
    if (kids.length > 0) node.content = kids;
  }
  return node;
}

// Turns anything into a safe document. Used on save and on read, so a broken row can never break a page.
export function sanitizeDoc(raw: unknown, userId?: string): DocNode {
  if (typeof raw !== "object" || raw === null || (raw as RawNode).type !== "doc") return emptyDoc;
  const content = (raw as RawNode).content;
  const budget: Budget = { nodes: 0, images: 0, userId };
  const kids: DocNode[] = [];
  if (Array.isArray(content)) {
    for (const child of content) {
      const clean = cleanNode(child, 1, budget);
      if (clean) kids.push(clean);
    }
  }
  const doc: DocNode = { type: "doc", content: kids.length > 0 ? kids : [{ type: "paragraph" }] };
  if ((raw as RawNode).attrs?.indent === true) doc.attrs = { indent: true };
  return doc;
}

export const readDoc = (raw: unknown): DocNode => sanitizeDoc(raw);

function collect(node: DocNode, out: string[]): void {
  if (node.type === "text") {
    if (node.text) out.push(node.text);
    return;
  }
  if (node.type === "hardBreak") {
    out.push(" ");
    return;
  }
  node.content?.forEach((child) => collect(child, out));
  if (textBlocks.has(node.type)) out.push(" ");
}

export function docText(doc: DocNode): string {
  const out: string[] = [];
  collect(doc, out);
  return out.join("").replace(/\s+/g, " ").trim();
}

export function wordCount(text: string): number {
  const clean = text.trim();
  return clean === "" ? 0 : clean.split(/\s+/).length;
}

export function readingMinutes(words: number): number {
  return Math.max(1, Math.ceil(words / articleConfig.wordsPerMinute));
}

export function excerptOf(text: string): string {
  return text.length <= articleLimits.excerpt ? text : `${text.slice(0, articleLimits.excerpt).trimEnd()}…`;
}

// "Judul Saya!" becomes "judul-saya". A title with no Latin letters gives "" (the caller picks a fallback).
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, articleLimits.slug)
    .replace(/-+$/, "");
}

export function articleState(status: string, publishedAt: string | null, now: Date): ArticleState {
  if (status !== "published" || !publishedAt) return "draft";
  return new Date(publishedAt).getTime() > now.getTime() ? "scheduled" : "live";
}

export function formatArticleDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: articleConfig.timeZone,
  }).format(date);
}