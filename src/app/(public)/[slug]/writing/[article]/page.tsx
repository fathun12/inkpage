import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article/ArticleView";
import { readSite } from "@/config/site-content";
import { routes } from "@/config/site";
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
  return {
    title: `${found.article.title} · ${found.profile.display_name}`,
    description: found.article.subtitle ?? found.article.excerpt ?? undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug, article: articleSlug } = await params;
  const found = await load(slug, articleSlug);
  if (!found) notFound();
  const { profile, article } = found;
  const site = readSite(profile.site);

  return (
    <ArticleView
      title={article.title}
      subtitle={article.subtitle}
      publishedAt={article.published_at}
      minutes={article.reading_minutes}
      cover={article.cover_url}
      doc={article.content}
      back={routes.section(profile.username, "writing")}
      backLabel={site.writing.title ?? "Writing"}
    />
  );
}