import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FadeGallery } from "@/components/site/FadeGallery";
import { Hero } from "@/components/site/Hero";
import { IndexSection } from "@/components/site/IndexSection";
import { readBackground } from "@/config/background";
import { readSite } from "@/config/site-content";
import { readSiteStyle } from "@/config/site-style";
import { siteConfig } from "@/config/site";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { getSiteUrl } from "@/lib/site-url";
import { listBlocks, resolveHomeMedia } from "@/lib/site-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  const description = profile.bio ?? `${profile.display_name} on ${siteConfig.name}`;
  return {
    metadataBase: new URL(await getSiteUrl()),
    title: profile.display_name,
    description,
    openGraph: { title: profile.display_name, description, type: "website" },
    twitter: { card: "summary_large_image", title: profile.display_name, description },
  };
}

export default async function HomePage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const blocks = await getPublicBlocks(profile.id);
  const site = readSite(profile.site);
  const style = readSiteStyle(profile.site_style);
  const media = resolveHomeMedia(site, readBackground(profile), blocks);
  const rows = listBlocks(blocks, "home");
  const autoplay = style.motion !== "off";

  return (
    <>
      <Hero
        slides={media.hero}
        name={profile.display_name}
        caption={site.heroCaption ?? profile.bio}
        seconds={style.heroSeconds}
        autoplay={autoplay}
        gray={style.heroGray}
      />
      {rows.length > 0 && <IndexSection blocks={rows} mediaUrl={media.indexMedia} />}
      <FadeGallery images={media.gallery} seconds={style.gallerySeconds} autoplay={autoplay} />
    </>
  );
}