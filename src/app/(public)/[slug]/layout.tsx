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
import { getPublicShop } from "@/features/shop/public";
import { musicEmbed } from "@/lib/music";
import { buildNav, homeCountdown, socialsOf } from "@/lib/site-view";

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
  const shop = await getPublicShop(profile.id);
  // The same countdown as the Home section: the nearest one that has not come yet. The bars hide it by themselves once the time has come.
  const timer = homeCountdown(blocks);
  const countdown = timer && timer.data.target ? { title: timer.title, target: timer.data.target } : null;

  return (
    <SiteFrame fonts={readFonts(profile)} style={style}>
      <NewsBar
        items={site.news}
        seconds={style.heroSeconds}
        autoplay={style.motion !== "off"}
        showClock={site.showClock}
        countdown={countdown}
      />
      <SiteHeader
        brand={profile.username}
        home={base}
        items={buildNav(base, site, { label: shop.settings.home_title ?? "Shop" })}
      />
      {children}
      <SiteFooter
        brand={profile.username}
        name={profile.display_name}
        bio={profile.bio}
        note={site.footerNote}
        socials={socialsOf(blocks)}
        nav={buildNav(base, site, { label: shop.settings.home_title ?? "Shop" })}
        news={{
          items: site.news,
          seconds: style.heroSeconds,
          autoplay: style.motion !== "off",
          showClock: site.showClock,
          countdown,
        }}
      />
      {music && <MusicPlayer embed={music} />}
      <ViewBeacon endpoint={routes.track} username={profile.username} />
    </SiteFrame>
  );
}