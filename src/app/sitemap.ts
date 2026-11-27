import type { MetadataRoute } from "next";
import { hasAbout, readSite } from "@/config/site-content";
import { getPublicArticles } from "@/features/articles/queries";
import { getProfileByUsername } from "@/features/profile/queries";

// The main domain, with the clean addresses (no owner name in them, see next.config.ts).
const origin = "https://mfniam.com";
// The account the main domain shows.
const owner = "zdtzer0";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profile = await getProfileByUsername(owner);
  if (!profile) return [{ url: `${origin}/` }];

  const site = readSite(profile.site);
  const articles = await getPublicArticles(profile.id);

  // The same pages the menu shows: Articles once one is published, Biblia and About once they have content.
  const pages = ["/", "/projects", "/writing"];
  if (articles.length > 0) pages.push("/articles");
  if (site.bibliaUrl) pages.push("/biblia");
  if (hasAbout(site)) pages.push("/about");

  return [
    ...pages.map((path) => ({ url: `${origin}${path}` })),
    ...articles.flatMap((article) =>
      article.slug
        ? [{ url: `${origin}/writing/${article.slug}`, lastModified: article.published_at ?? undefined }]
        : [],
    ),
  ];
}