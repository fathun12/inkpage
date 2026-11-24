// Limits and timing of articles (Phase 20). Change a number here and the whole feature follows.
export const articleLimits = {
  title: 150,
  subtitle: 200,
  excerpt: 160,
  slug: 80,
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