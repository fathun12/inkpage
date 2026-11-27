import { articleLimits } from "@/config/article";

// Letters (any language), numbers, spaces and hyphens only. Built from a string so every build target accepts it.
const notAllowed = new RegExp("[^\\p{L}\\p{N}\\s-]", "gu");

export type TagResult = { tags: string[] } | { error: string };

// "Philosophy,  essay , Essay" becomes ["philosophy", "essay"]: lowercase, single spaces, no repeats.
export function cleanTags(input: string): TagResult {
  const tags: string[] = [];
  for (const part of input.split(/[,\n]/)) {
    const tag = part
      .normalize("NFKC")
      .toLowerCase()
      .replace(notAllowed, "")
      .replace(/\s+/g, " ")
      .replace(/^[-\s]+|[-\s]+$/g, "");
    if (tag === "" || tags.includes(tag)) continue;
    if (tag.length > articleLimits.tag) {
      return { error: `A tag can be at most ${articleLimits.tag} characters ("${tag.slice(0, 20)}...").` };
    }
    tags.push(tag);
  }
  if (tags.length > articleLimits.tags) return { error: `An article can have at most ${articleLimits.tags} tags.` };
  return { tags };
}