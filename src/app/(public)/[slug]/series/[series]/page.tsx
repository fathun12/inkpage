import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleList } from "@/components/site/ArticleList";
import { PageIntro } from "@/components/site/PageIntro";
import { cleanUrl } from "@/config/seo";
import { routes } from "@/config/site";
import { getPublicArticles } from "@/features/articles/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { getSeriesBySlug } from "@/features/series/queries";
import { sortParts } from "@/lib/series-view";

type Props = { params: Promise<{ slug: string; series: string }> };

async function load(slug: string, seriesSlug: string) {
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return null;
  const series = await getSeriesBySlug(profile.id, seriesSlug);
  if (!series) return null;
  const parts = sortParts((await getPublicArticles(profile.id)).filter((a) => a.series_id === series.id));
  // A series without a live article is not public (the owner sees it only in the admin).
  return parts.length > 0 ? { profile, series, parts } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, series: seriesSlug } = await params;
  const found = await load(slug, seriesSlug);
  if (!found) return { title: "Not found" };
  const { profile, series } = found;
  const canonical = cleanUrl(profile.username, `/series/${series.slug}`);
  return {
    title: `${series.title} · Series · ${profile.display_name}`,
    description: series.description ?? undefined,
    alternates: canonical ? { canonical } : undefined,
  };
}

// One series: its title, its description and every live part in order.
export default async function SeriesPage({ params }: Props) {
  const { slug, series: seriesSlug } = await params;
  const found = await load(slug, seriesSlug);
  if (!found) notFound();
  const { profile, series, parts } = found;

  return (
    <>
      <PageIntro title={series.title} intro={series.description} />
      <p className="mx-auto max-w-5xl px-5 font-mono text-[11px] uppercase tracking-widest text-ink-soft sm:px-8">
        <Link href={routes.section(profile.username, "articles")} className="hover:text-ink">
          &larr; Articles
        </Link>
        {" · "}
        {parts.length} {parts.length === 1 ? "part" : "parts"}
      </p>
      <ArticleList articles={parts} username={profile.username} previews parts />
    </>
  );
}