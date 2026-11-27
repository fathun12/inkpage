import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleList } from "@/components/site/ArticleList";
import { PageIntro } from "@/components/site/PageIntro";
import { Pager } from "@/components/site/Pager";
import { pageSizes } from "@/config/paging";
import { cleanUrl } from "@/config/seo";
import { routes } from "@/config/site";
import { readSite } from "@/config/site-content";
import { getPublicArticles } from "@/features/articles/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { paginate, readPage } from "@/lib/paging";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = readPage((await searchParams).page);
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  const name = readSite(profile.site).articles.title ?? "Articles";
  // Every page points to itself, so Google keeps page 2 and later as their own pages.
  const clean = cleanUrl(profile.username, "/articles");
  const canonical = clean && page > 1 ? `${clean}?page=${page}` : clean;
  return {
    title: `${page > 1 ? `${name} (page ${page})` : name} · ${profile.display_name}`,
    alternates: canonical ? { canonical } : undefined,
  };
}

// Every article written inside inkpage, newest first, with a small preview of each. Pages of 10.
export default async function ArticlesPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const page = readPage((await searchParams).page);
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const site = readSite(profile.site);
  const all = await getPublicArticles(profile.id);
  const paged = paginate(all, page, pageSizes.articles);
  if (page > paged.pages) notFound();

  return (
    <>
      <PageIntro title={site.articles.title ?? "Articles"} intro={site.articles.intro} />
      {all.length > 0 ? (
        <>
          <ArticleList articles={paged.items} username={profile.username} previews />
          <Pager
            base={routes.section(profile.username, "articles")}
            page={page}
            pages={paged.pages}
            label="Articles pages"
          />
        </>
      ) : (
        <p className="mx-auto max-w-5xl px-5 pb-24 text-ink-soft sm:px-8">No articles yet.</p>
      )}
    </>
  );
}