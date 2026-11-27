import { searchLimits } from "@/config/search";

// Reads ?q=. Spaces are collapsed. Empty or too short means "no search" (null).
export function readQuery(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const query = raw.normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, searchLimits.maxChars).trim();
  return query.length >= searchLimits.minChars ? query : null;
}

export function queryWords(query: string): string[] {
  return query.split(" ").filter(Boolean).slice(0, searchLimits.maxWords);
}

// For lists without a search column (Writing): every word of the search must be somewhere in the text.
export function matchesWords(text: string, query: string): boolean {
  const haystack = text.toLowerCase();
  return queryWords(query.toLowerCase()).every((word) => haystack.includes(word));
}