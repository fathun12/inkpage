import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { MusicPlayer } from "@/components/site/MusicPlayer";
import { NewsBar } from "@/components/site/NewsBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteFrame } from "@/components/site/SiteFrame";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ViewBeacon } from "@/components/ui/ViewBeacon";
import { readFonts } from "@/config/font-choices";
import { readSite } from "@/config/site-content";
import { readSiteStyle } from "@/config/site-style";
import { routes } from "@/config/site";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { musicEmbed } from "@/lib/music";
import { buildNav, socialsOf } from "@/lib/site-view";

type Props = { children: ReactNode; params: Promise<{ slug: string }> };

// Shared by Home, Projects, Writing and About: news bar, menu and footer.
export default async function SiteLayout({ children, params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const blocks = await getPublicBlocks(profile.id);
  const site = readSite(profile.site);
  const style = readSiteStyle(profile.site_style);
  const base = routes.profile(profile.username);
  const music = musicEmbed(site.musicUrl);

  return (
    <SiteFrame fonts={readFonts(profile)} style={style}>
      <NewsBar items={site.news} seconds={style.heroSeconds} autoplay={style.motion !== "off"} showClock={site.showClock} />
      <SiteHeader brand={profile.username} home={base} items={buildNav(base, site)} />
      {children}
      <SiteFooter brand={profile.username} note={site.footerNote} socials={socialsOf(blocks)} />
      {music && <MusicPlayer embed={music} />}
      <ViewBeacon endpoint={routes.track} username={profile.username} />
    </SiteFrame>
  );
}