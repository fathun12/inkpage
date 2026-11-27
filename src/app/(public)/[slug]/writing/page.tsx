import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardSlider } from "@/components/site/CardSlider";
import { PageIntro } from "@/components/site/PageIntro";
import { Pager } from "@/components/site/Pager";
import { SeriesStack } from "@/components/site/SeriesStack";
import { WritingList } from "@/components/site/WritingList";
import { pageSizes } from "@/config/paging";
import { cleanUrl } from "@/config/seo";
import { routes } from "@/config/site";
import { readSite } from "@/config/site-content";
import { readSiteStyle } from "@/config/site-style";
import { getPublicArticles } from "@/features/articles/queries";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { getSeriesByIds } from "@/features/series/queries";
import { paginate, readPage } from "@/lib/paging";
import { buildSeriesCards, seriesIdsOf } from "@/lib/series-view";
import { listBlocks, newestFirst, recentWriting } from "@/lib/site-view";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = readPage((await searchParams).page);
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  const name = readSite(profile.site).writing.title ?? "Writing";
  const clean = cleanUrl(profile.username, "/writing");
  const canonical = clean && page > 1 ? `${clean}?page=${page}` : clean;
  return {
    title: `${page > 1 ? `${name} (page ${page})` : name} · ${profile.display_name}`,
    alternates: canonical ? { canonical } : undefined,
  };
}

export default async function WritingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const page = readPage((await searchParams).page);
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const site = readSite(profile.site);
  const style = readSiteStyle(profile.site_style);
  const rows = newestFirst(listBlocks(await getPublicBlocks(profile.id), "writing").filter((b) => b.type !== "header"));
  const recent = recentWriting(rows);
  const paged = paginate(rows, page, pageSizes.writing);
  if (page > paged.pages) notFound();

  // Series cards only on page 1. Here they are links to the series pages.
  const articles = page === 1 ? await getPublicArticles(profile.id) : [];
  const seriesCards = buildSeriesCards(await getSeriesByIds(seriesIdsOf(articles)), articles);

  return (
    <>
      <PageIntro title={site.writing.title ?? "Writing"} intro={site.writing.intro} />
      {rows.length > 0 ? (
        <>
          {page === 1 && (
            <CardSlider
              items={recent}
              title="Recently added"
              seconds={style.heroSeconds}
              autoplay={style.motion !== "off"}
              spacing="pt-4 pb-10 sm:pt-6 sm:pb-12"
            />
          )}
          <SeriesStack cards={seriesCards} username={profile.username} />
          <WritingList blocks={paged.items} />
          <Pager
            base={routes.section(profile.username, "writing")}
            page={page}
            pages={paged.pages}
            label="Writing pages"
          />
        </>
      ) : (
        <p className="mx-auto max-w-5xl px-5 pb-24 text-ink-soft sm:px-8">Nothing here yet.</p>
      )}
    </>
  );
}