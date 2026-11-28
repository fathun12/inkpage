import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutContent } from "@/components/site/AboutContent";
import { JsonLd } from "@/components/site/JsonLd";
import { cleanUrl } from "@/config/seo";
import { hasAbout, readSite } from "@/config/site-content";
import { readSiteStyle } from "@/config/site-style";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { fetchSteam } from "@/features/site/steam";
import { personLd } from "@/lib/person-ld";
import { creditOf, socialsOf } from "@/lib/site-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  const canonical = cleanUrl(profile.username, "/about");
  return {
    title: `${readSite(profile.site).about.title ?? "About"} · ${profile.display_name}`,
    alternates: canonical ? { canonical } : undefined,
  };
}

export default async function AboutPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const site = readSite(profile.site);
  if (!hasAbout(site)) notFound();

  const [blocks, steam, steam2] = await Promise.all([
    getPublicBlocks(profile.id),
    fetchSteam(site.steamId),
    site.steamId2 ? fetchSteam(site.steamId2) : Promise.resolve(null),
  ]);
  const person = personLd(profile, site, socialsOf(blocks));
  const url = cleanUrl(profile.username, "/about");

  return (
    <>
      {person && url && (
        <JsonLd data={{ "@context": "https://schema.org", "@type": "ProfilePage", url, mainEntity: person }} />
      )}
      <AboutContent
        title={site.about.title ?? "About"}
        name={profile.display_name}
        bio={profile.bio}
        body={site.about.body}
        photo={site.about.photo}
        steam={steam}
        steam2={steam2}
        steamMedia={site.steamMedia}
        steamCredit={creditOf(site.credits, site.steamMedia)}
        style={readSiteStyle(profile.site_style)}
      />
    </>
  );
}