import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleList } from "@/components/site/ArticleList";
import { PageIntro } from "@/components/site/PageIntro";
import { Pager } from "@/components/site/Pager";
import { SeriesStack } from "@/components/site/SeriesStack";
import { pageSizes } from "@/config/paging";
import { cleanUrl } from "@/config/seo";
import { routes } from "@/config/site";
import { readSite } from "@/config/site-content";
import { getPublicArticles } from "@/features/articles/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { getSeriesByIds } from "@/features/series/queries";
import { paginate, readPage } from "@/lib/paging";
import { buildSeriesCards, seriesIdsOf } from "@/lib/series-view";
import { cleanTags } from "@/lib/tags";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[]; tag?: string | string[] }>;
};

// ?tag=philosophy. A broken or empty value means "no filter".
function readTag(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const cleaned = cleanTags(raw);
  return "tags" in cleaned ? (cleaned.tags[0] ?? null) : null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const page = readPage(sp.page);
  const tag = readTag(sp.tag);
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  const name = readSite(profile.site).articles.title ?? "Articles";
  const label = tag ? `#${tag} · ${name}` : name;
  // Every page points to itself, so Google keeps page 2 and later (and each tag) as their own pages.
  const clean = cleanUrl(profile.username, tag ? `/articles?tag=${encodeURIComponent(tag)}` : "/articles");
  const canonical = clean && page > 1 ? `${clean}${tag ? "&" : "?"}page=${page}` : clean;
  return {
    title: `${page > 1 ? `${label} (page ${page})` : label} · ${profile.display_name}`,
    alternates: canonical ? { canonical } : undefined,
  };
}

// Every article written inside inkpage, newest first, with a small preview of each. Pages of 10.
// ?tag=x shows only the articles with that tag. Series cards stand above the list on page 1.
export default async function ArticlesPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = readPage(sp.page);
  const tag = readTag(sp.tag);
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const site = readSite(profile.site);
  const all = await getPublicArticles(profile.id);
  const shown = tag ? all.filter((a) => a.tags.includes(tag)) : all;
  const paged = paginate(shown, page, pageSizes.articles);
  if (page > paged.pages) notFound();

  const articlesUrl = routes.section(profile.username, "articles");
  const cards = !tag && page === 1 ? buildSeriesCards(await getSeriesByIds(seriesIdsOf(all)), all) : [];

  return (
    <>
      <PageIntro title={site.articles.title ?? "Articles"} intro={site.articles.intro} />
      {tag && (
        <p className="mx-auto max-w-5xl px-5 pb-2 font-mono text-[11px] uppercase tracking-widest text-ink-soft sm:px-8">
          Tagged #{tag} · {shown.length} {shown.length === 1 ? "article" : "articles"} ·{" "}
          <Link href={articlesUrl} className="underline underline-offset-4 hover:text-ink">
            All articles
          </Link>
        </p>
      )}
      <SeriesStack cards={cards} username={profile.username} />
      {shown.length > 0 ? (
        <>
          <ArticleList articles={paged.items} username={profile.username} previews />
          <Pager
            base={tag ? routes.articleTag(profile.username, tag) : articlesUrl}
            page={page}
            pages={paged.pages}
            label="Articles pages"
          />
        </>
      ) : (
        <p className="mx-auto max-w-5xl px-5 pb-24 text-ink-soft sm:px-8">
          {tag ? "No articles with this tag." : "No articles yet."}
        </p>
      )}
    </>
  );
}