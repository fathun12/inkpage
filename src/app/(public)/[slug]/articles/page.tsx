import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleList } from "@/components/site/ArticleList";
import { PageIntro } from "@/components/site/PageIntro";
import { cleanUrl } from "@/config/seo";
import { readSite } from "@/config/site-content";
import { getPublicArticles } from "@/features/articles/queries";
import { getProfileByUsername } from "@/features/profile/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  const canonical = cleanUrl(profile.username, "/articles");
  return {
    title: `${readSite(profile.site).articles.title ?? "Articles"} · ${profile.display_name}`,
    alternates: canonical ? { canonical } : undefined,
  };
}

// Every article written inside inkpage, newest first, with a small preview of each.
export default async function ArticlesPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const site = readSite(profile.site);
  const articles = await getPublicArticles(profile.id);

  return (
    <>
      <PageIntro title={site.articles.title ?? "Articles"} intro={site.articles.intro} />
      {articles.length > 0 ? (
        <ArticleList articles={articles} username={profile.username} previews />
      ) : (
        <p className="mx-auto max-w-5xl px-5 pb-24 text-ink-soft sm:px-8">No articles yet.</p>
      )}
    </>
  );
}