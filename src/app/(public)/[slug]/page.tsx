import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FadeGallery } from "@/components/site/FadeGallery";
import { Hero } from "@/components/site/Hero";
import { IndexSection } from "@/components/site/IndexSection";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteFrame } from "@/components/site/SiteFrame";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ViewBeacon } from "@/components/ui/ViewBeacon";
import { readBackground } from "@/config/background";
import { readCustomTheme } from "@/config/custom-theme";
import { readFonts } from "@/config/font-choices";
import { resolveTheme, routes, siteConfig } from "@/config/site";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { getSiteUrl } from "@/lib/site-url";
import type { SocialItem } from "@/types/block";

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

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const blocks = await getPublicBlocks(profile.id);
  const rows = blocks.filter((b) => b.type === "link" || b.type === "project" || b.type === "header");
  const images = blocks.flatMap((b) => (b.type === "gallery" ? (b.data.images ?? []) : []));
  const socials: SocialItem[] = blocks.flatMap((b) => (b.type === "socials" ? (b.data.items ?? []) : []));

  // Until the Pages menu exists (Phase 12b): with 3 or more gallery photos the first one sits behind the list.
  const indexMedia = images.length > 2 ? images[0] : null;
  const gallery = indexMedia ? images.slice(1) : images;

  const links = [
    ...(rows.length > 0 ? [{ label: "Work", href: "#work" }] : []),
    ...(gallery.length > 0 ? [{ label: "Gallery", href: "#gallery" }] : []),
  ];

  return (
    <SiteFrame
      theme={resolveTheme(profile.theme)}
      customTheme={readCustomTheme(profile)}
      fonts={readFonts(profile)}
    >
      <SiteHeader brand={profile.username} links={links} />
      <Hero background={readBackground(profile)} name={profile.display_name} bio={profile.bio} />
      {rows.length > 0 && <IndexSection blocks={rows} mediaUrl={indexMedia} />}
      <FadeGallery images={gallery} />
      <SiteFooter brand={profile.username} socials={socials} />
      <ViewBeacon endpoint={routes.track} username={profile.username} />
    </SiteFrame>
  );
}