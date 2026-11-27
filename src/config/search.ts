// Search on the Articles and Writing pages (Phase 28d). Change a number here and both pages follow.
export const searchLimits = {
  minChars: 2, // a shorter search is ignored
  maxChars: 100,
  maxWords: 6, // when the whole phrase is not found, up to this many words must all be present
} as const;