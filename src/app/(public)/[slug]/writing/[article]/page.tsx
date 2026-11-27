import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article/ArticleView";
import { MoreFrom } from "@/components/article/MoreFrom";
import { JsonLd } from "@/components/site/JsonLd";
import { SeriesStack } from "@/components/site/SeriesStack";
import { cleanUrl } from "@/config/seo";
import { routes } from "@/config/site";
import { hasAbout, readSite } from "@/config/site-content";
import { getLikeInfo, getPopularArticleId } from "@/features/articles/like-queries";
import { getPublicArticle, getPublicArticles } from "@/features/articles/queries";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { getSeriesByIds } from "@/features/series/queries";
import { pickMoreFrom } from "@/lib/more-from";
import { personLd } from "@/lib/person-ld";
import { buildSeriesCards } from "@/lib/series-view";
import { socialsOf } from "@/lib/site-view";

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
  const person = personLd(profile, site, socialsOf(await getPublicBlocks(profile.id)));
  const url = cleanUrl(profile.username, `/writing/${articleSlug}`);

  // Every live article: the series card and "More from" are made from this list.
  const [seriesRows, all, likeInfo, popularId] = await Promise.all([
    article.series_id ? getSeriesByIds([article.series_id]) : Promise.resolve([]),
    getPublicArticles(profile.id),
    getLikeInfo(article.id),
    getPopularArticleId(profile.id, article.id),
  ]);
  const seriesRow = seriesRows[0] ?? null;
  const seriesCards = seriesRow ? buildSeriesCards([seriesRow], all) : [];
  const moreItems = pickMoreFrom(article, all, popularId);
  const seriesUrl = seriesRow ? cleanUrl(profile.username, `/series/${seriesRow.slug}`) : null;

  return (
    <>
      {person && url && (
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
            keywords: article.tags.length > 0 ? article.tags.join(", ") : undefined,
            isPartOf:
              seriesRow && seriesUrl
                ? { "@type": "CreativeWorkSeries", name: seriesRow.title, url: seriesUrl }
                : undefined,
            author: person,
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
        tags={article.tags.map((tag) => ({ label: tag, href: routes.articleTag(profile.username, tag) }))}
        author={{
          name: profile.display_name,
          href: aboutPage ? `${routes.profile(profile.username)}/about` : null,
        }}
        shareUrl={url}
        like={{ articleId: article.id, liked: likeInfo.liked, count: likeInfo.count }}
        after={
          <>
            <SeriesStack cards={seriesCards} username={profile.username} />
            <MoreFrom items={moreItems} username={profile.username} name={profile.display_name} />
          </>
        }
      />
    </>
  );
}