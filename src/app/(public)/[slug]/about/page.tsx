import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutSection } from "@/components/site/AboutSection";
import { JsonLd } from "@/components/site/JsonLd";
import { PageIntro } from "@/components/site/PageIntro";
import { cleanUrl } from "@/config/seo";
import { hasAbout, readSite } from "@/config/site-content";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { personLd } from "@/lib/person-ld";
import { socialsOf } from "@/lib/site-view";

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

  const person = personLd(profile, site, socialsOf(await getPublicBlocks(profile.id)));
  const url = cleanUrl(profile.username, "/about");

  return (
    <>
      {person && url && (
        <JsonLd data={{ "@context": "https://schema.org", "@type": "ProfilePage", url, mainEntity: person }} />
      )}
      <PageIntro title={site.about.title ?? "About"} intro={null} />
      <AboutSection
        name={profile.display_name}
        bio={profile.bio}
        body={site.about.body}
        photo={site.about.photo}
      />
    </>
  );
}