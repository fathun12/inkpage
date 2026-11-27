import type { MetadataRoute } from "next";
import { seo } from "@/config/seo";
import { hasAbout, readSite } from "@/config/site-content";
import { getPublicArticles } from "@/features/articles/queries";
import { getProfileByUsername } from "@/features/profile/queries";

// The main domain and the account it shows live in config/seo.ts.
const { origin, owner } = seo;

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
        ? [{ url: `${origin}/writing/${article.slug}`, lastModified: article.updated_at ?? article.published_at ?? undefined }]
        : [],
    ),
  ];
}