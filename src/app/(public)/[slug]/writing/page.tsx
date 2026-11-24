import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardSlider } from "@/components/site/CardSlider";
import { PageIntro } from "@/components/site/PageIntro";
import { WritingList } from "@/components/site/WritingList";
import { readSite } from "@/config/site-content";
import { readSiteStyle } from "@/config/site-style";
import { getPublicBlocks } from "@/features/blocks/queries";
import { ArticleList } from "@/components/site/ArticleList";
import { getPublicArticles } from "@/features/articles/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { listBlocks, newestFirst, recentWriting } from "@/lib/site-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  return { title: `${readSite(profile.site).writing.title ?? "Writing"} · ${profile.display_name}` };
}

export default async function WritingPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const site = readSite(profile.site);
  const style = readSiteStyle(profile.site_style);
  const rows = newestFirst(listBlocks(await getPublicBlocks(profile.id), "writing").filter((b) => b.type !== "header"));
  const recent = recentWriting(rows);
  const articles = await getPublicArticles(profile.id);

  return (
    <>
      <PageIntro title={site.writing.title ?? "Writing"} intro={site.writing.intro} />
      {articles.length > 0 && <ArticleList articles={articles} username={profile.username} />}
      {rows.length > 0 ? (
        <>
          <CardSlider items={recent} title="Recently added" seconds={style.heroSeconds} autoplay={style.motion !== "off"} />
          <WritingList blocks={rows} />
        </>
      ) : (
        articles.length === 0 && (
          <p className="mx-auto max-w-5xl px-5 pb-24 text-ink-soft sm:px-8">Nothing here yet.</p>
        )
      )}
    </>
  );
}