import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutSection } from "@/components/site/AboutSection";
import { PageIntro } from "@/components/site/PageIntro";
import { hasAbout, readSite } from "@/config/site-content";
import { getProfileByUsername } from "@/features/profile/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  return { title: `${readSite(profile.site).about.title ?? "About"} · ${profile.display_name}` };
}

export default async function AboutPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const site = readSite(profile.site);
  if (!hasAbout(site)) notFound();

  return (
    <>
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