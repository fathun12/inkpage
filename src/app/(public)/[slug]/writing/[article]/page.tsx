import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article/ArticleView";
import { JsonLd } from "@/components/site/JsonLd";
import { cleanUrl } from "@/config/seo";
import { routes } from "@/config/site";
import { hasAbout, readSite } from "@/config/site-content";
import { getPublicArticle } from "@/features/articles/queries";
import { getProfileByUsername } from "@/features/profile/queries";

type Props = { params: Promise<{ slug: string; article: string }> };

async function load(slug: string, articleSlug: string) {
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return null;
  const article = await getPublicArticle(profile.id, articleSlug);
  return article ? { profile, article } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, article: articleSlug } = await params;
  const found = await load(slug, articleSlug);
  if (!found) return { title: "Not found" };
  const { profile, article } = found;
  const canonical = cleanUrl(profile.username, `/writing/${articleSlug}`);
  const about = hasAbout(readSite(profile.site)) ? cleanUrl(profile.username, "/about") : null;
  return {
    title: `${article.title} · ${profile.display_name}`,
    description: article.subtitle ?? article.excerpt ?? undefined,
    alternates: canonical ? { canonical } : undefined,
    authors: [about ? { name: profile.display_name, url: about } : { name: profile.display_name }],
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug, article: articleSlug } = await params;
  const found = await load(slug, articleSlug);
  if (!found) notFound();
  const { profile, article } = found;

  const site = readSite(profile.site);
  const aboutPage = hasAbout(site);
  const home = cleanUrl(profile.username, "/");
  const url = cleanUrl(profile.username, `/writing/${articleSlug}`);
  const aboutUrl = aboutPage ? cleanUrl(profile.username, "/about") : null;

  return (
    <>
      {home && url && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.subtitle ?? article.excerpt ?? undefined,
            image: article.cover_url ? [article.cover_url] : undefined,
            datePublished: article.published_at ?? undefined,
            dateModified: article.updated_at,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            author: {
              "@type": "Person",
              "@id": `${home}#person`,
              name: profile.display_name,
              url: aboutUrl ?? home,
              sameAs: site.githubUser ? [`https://github.com/${site.githubUser}`] : undefined,
            },
          }}
        />
      )}
      <ArticleView
        title={article.title}
        subtitle={article.subtitle}
        publishedAt={article.published_at}
        minutes={article.reading_minutes}
        cover={article.cover_url}
        doc={article.content}
        back={routes.section(profile.username, "articles")}
        backLabel="Articles"
        author={{
          name: profile.display_name,
          href: aboutPage ? `${routes.profile(profile.username)}/about` : null,
        }}
      />
    </>
  );
}