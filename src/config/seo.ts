// Where the owner's pages live on the main domain. The sitemap, the canonical links and the structured data use this.
export const seo = {
  origin: "https://mfniam.com",
  // The one account the main domain shows (see next.config.ts).
  owner: "zdtzer0",
} as const;

// The clean address of a page on the main domain, for example cleanUrl("zdtzer0", "/writing/hello").
// Only the owner's account has one. Any other account gets null.
export function cleanUrl(username: string, path: string): string | null {
  return username === seo.owner ? `${seo.origin}${path}` : null;
}