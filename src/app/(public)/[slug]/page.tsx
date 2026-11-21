import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { ProfileHeader } from "@/components/layout/ProfileHeader";
import { PublicFrame } from "@/components/layout/PublicFrame";
import { ViewBeacon } from "@/components/ui/ViewBeacon";
import { readBackground } from "@/config/background";
import { readFonts } from "@/config/font-choices";
import { resolveTheme, routes, siteConfig } from "@/config/site";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { readCard } from "@/lib/card-style";
import { getSiteUrl } from "@/lib/site-url";

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
  const card = readCard(profile.card);

  return (
    <PublicFrame
      theme={resolveTheme(profile.theme)}
      background={readBackground(profile)}
      fonts={readFonts(profile)}
      card={card}
    >
      <ProfileHeader
        displayName={profile.display_name}
        username={profile.username}
        bio={profile.bio}
        avatarUrl={profile.avatar_url}
      />
      <BlockRenderer blocks={blocks} glass={card.kind === "glass"} />
      <ViewBeacon endpoint={routes.track} username={profile.username} />
    </PublicFrame>
  );
}