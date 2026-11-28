import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Hero } from "@/components/site/Hero";
import { Intro } from "@/components/site/Intro";
import { SiteFrame } from "@/components/site/SiteFrame";
import { readBackground } from "@/config/background";
import { resolveGreetings } from "@/config/intro";
import { seo } from "@/config/seo";
import { readSite } from "@/config/site-content";
import { readSiteStyle, siteStyleDefaults } from "@/config/site-style";
import { routes } from "@/config/site";
import { loginAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/queries";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { resolveHomeMedia } from "@/lib/site-view";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ error?: string }> };

// What the website shows in its hero. Any failure gives null, and the panel is then plain dark.
async function loadSite() {
  try {
    const profile = await getProfileByUsername(seo.owner);
    if (!profile) return null;
    const blocks = await getPublicBlocks(profile.id);
    const site = readSite(profile.site);
    const style = readSiteStyle(profile.site_style);
    const media = resolveHomeMedia(site, readBackground(profile), blocks);
    return { profile, site, style, media };
  } catch {
    return null;
  }
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  if (await getCurrentUser()) redirect(routes.admin);

  const data = await loadSite();
  const style = data?.style ?? siteStyleDefaults;
  const autoplay = style.motion !== "off";

  const panel =
    data && data.media.hero.length > 0 ? (
      <Hero
        slides={data.media.hero}
        name={data.profile.display_name}
        caption={data.site.heroCaption ?? data.profile.bio}
        seconds={style.heroSeconds}
        autoplay={autoplay}
        gray={style.heroGray}
        credits={data.site.credits}
      >
        {data.site.intro.enabled && data.site.intro.headlines.length > 0 && (
          <Intro
            greetings={resolveGreetings(data.site.intro.greetings)}
            note={data.site.intro.note}
            headlines={data.site.intro.headlines}
            seconds={style.heroSeconds}
            autoplay={autoplay}
          />
        )}
      </Hero>
    ) : null;

  return (
    <SiteFrame style={style}>
      <LoginForm action={loginAction} error={error} panel={panel} />
    </SiteFrame>
  );
}