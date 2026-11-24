// Limits and timing of articles (Phase 20). Change a number here and the whole feature follows.
export const articleLimits = {
  title: 150,
  subtitle: 200,
  excerpt: 160,
  slug: 80,
  caption: 300,
  footnote: 1000,
  contentChars: 500_000, // size of the saved JSON
  nodes: 20_000,
  depth: 12,
  textNode: 50_000,
} as const;

export const articleConfig = {
  wordsPerMinute: 200,
  autosaveMs: 2000,
  timeZone: "Asia/Jakarta",
} as const;

// Pictures inside articles and the cover. They are shrunk in the browser, then uploaded straight to Storage.
export const articleImages = {
  accept: "image/jpeg,image/png,image/webp",
  folder: "articles",
  maxPerArticle: 30,
  maxPx: 1600,
  quality: 0.82,
  maxSourceMb: 15, // the file the writer picks
  maxMb: 1, // after shrinking
  cover: { width: 1600, height: 800 },
  sweepAfterMs: 30 * 60 * 1000, // unused files are deleted after this long
} as const;