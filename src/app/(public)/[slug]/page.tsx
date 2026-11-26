import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardSlider } from "@/components/site/CardSlider";
import { FadeGallery } from "@/components/site/FadeGallery";
import { Hero } from "@/components/site/Hero";
import { HeroContents, type ContentsItem } from "@/components/site/HeroContents";
import { Intro } from "@/components/site/Intro";
import { resolveGreetings } from "@/config/intro";
import { HomeArticles } from "@/components/site/HomeArticles";
import { getPublicArticles } from "@/features/articles/queries";
import { HomeBiblia } from "@/components/site/HomeBiblia";
import { HomeCountdown } from "@/components/site/HomeCountdown";
import { HomeDesigns } from "@/components/site/HomeDesigns";
import { HomeGithub } from "@/components/site/HomeGithub";
import { HomeProjects } from "@/components/site/HomeProjects";
import { HomeShowcase } from "@/components/site/HomeShowcase";
import { IndexSection } from "@/components/site/IndexSection";
import { SectionBox } from "@/components/site/SectionBox";
import { VisitCards } from "@/components/site/VisitCards";
import { readBackground } from "@/config/background";
import type { SectionId } from "@/config/layout";
import { readSite } from "@/config/site-content";
import { readSiteStyle } from "@/config/site-style";
import { routes, siteConfig } from "@/config/site";
import { shopConfig } from "@/config/shop";
import { HomeShop } from "@/components/shop/HomeShop";
import { getPublicShop } from "@/features/shop/public";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { fetchBiblia } from "@/features/site/biblia";
import { fetchDesigns } from "@/features/site/designs";
import { fetchGithub } from "@/features/site/github";
import { getSiteUrl } from "@/lib/site-url";
import {
  creditOf,
  homeCountdown,
  homeProjects,
  homeShowcase,
  homeWriting,
  listBlocks,
  resolveHomeMedia,
} from "@/lib/site-view";

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

// Home, top to bottom: hero, writing cards (slide), projects (no slide), Biblia covers, list over a media, showcase, gallery.
// Each section after the hero can be hidden or given extra space in Customize ("Sections"): style.sections.
export default async function HomePage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const blocks = await getPublicBlocks(profile.id);
  const site = readSite(profile.site);
  const style = readSiteStyle(profile.site_style);
  const sec = style.sections;
  const on = (id: SectionId) => !sec[id].hidden;
  const media = resolveHomeMedia(site, readBackground(profile), blocks);
  const rows = listBlocks(blocks, "home");
  const projects = homeProjects(blocks);
  const writing = homeWriting(blocks);
  const showcase = homeShowcase(blocks);
  const countdown = homeCountdown(blocks);
  const autoplay = style.motion !== "off";
  const [biblia, designs, github, shop, articles] = await Promise.all([
    fetchBiblia(site.bibliaUrl, 6),
    fetchDesigns(site.designsUrl, 3),
    fetchGithub(site.githubUser),
    getPublicShop(profile.id),
    getPublicArticles(profile.id),
  ]);
  const shopItems = shop.products.filter((p) => p.show_on_home).slice(0, shopConfig.homeMax);
  const shopTitle = shop.settings.home_title ?? "Shop";
  const showWriting = writing.length > 0 && on("writing");
  const showArticles = articles.length > 0 && on("articles");
  // The table of contents over the hero: the sections that really show up on Home, in page order.
  const contents = [
    countdown && on("countdown") && { id: "countdown", label: "Countdown" },
    showWriting && { id: "writing", label: site.cardsTitle ?? site.writing.title ?? "Writing" },
    showArticles && { id: "articles", label: site.articles.title ?? "Articles" },
    projects.length > 0 && on("projects") && { id: "projects", label: site.projects.title ?? "Projects" },
    biblia && biblia.books.length > 0 && on("biblia") && { id: "biblia", label: site.bibliaTitle ?? "Biblia" },
    github && on("github") && { id: "github", label: site.githubTitle ?? "GitHub" },
    shopItems.length > 0 && on("shop") && { id: "shop", label: shopTitle },
    rows.length > 0 && on("links") && { id: "links", label: "Links" },
    showcase.length > 0 && on("showcase") && { id: "showcase", label: site.showcaseTitle ?? "Showcase" },
    designs && designs.projects.length > 0 && on("designs") && { id: "designs", label: site.designsTitle ?? "Design" },
    site.visits.length > 0 && on("visit") && { id: "visit", label: site.visitTitle ?? "Visit website" },
    media.gallery.length > 0 && on("gallery") && { id: "gallery", label: "Gallery" },
  ].filter((item): item is ContentsItem => Boolean(item));

  return (
    <main>
      <Hero
        slides={media.hero}
        name={profile.display_name}
        caption={site.heroCaption ?? profile.bio}
        seconds={style.heroSeconds}
        autoplay={autoplay}
        gray={style.heroGray}
        credits={site.credits}
      >
        {site.intro.enabled && site.intro.headlines.length > 0 && (
          <Intro
            greetings={resolveGreetings(site.intro.greetings)}
            note={site.intro.note}
            headlines={site.intro.headlines}
            seconds={style.heroSeconds}
            autoplay={autoplay}
          />
        )}
        <HeroContents items={contents} />
      </Hero>
      {countdown && on("countdown") && (
        <SectionBox setting={sec.countdown}>
          <HomeCountdown
            title={countdown.title}
            description={countdown.body}
            target={countdown.data.target ?? ""}
            start={countdown.created_at}
          />
        </SectionBox>
      )}
      {showWriting && (
        <SectionBox setting={sec.writing}>
          <span id="writing" className="block" />
          <CardSlider
            items={writing}
            title={site.cardsTitle ?? site.writing.title ?? "Writing"}
            seconds={style.heroSeconds}
            autoplay={autoplay}
            spacing={showArticles ? "site-pt pb-6 sm:pb-8" : undefined}
          />
        </SectionBox>
      )}
      {on("articles") && (
        <SectionBox setting={sec.articles}>
          <HomeArticles
            articles={articles}
            username={profile.username}
            title={site.articles.title ?? "Articles"}
            joined={showWriting}
          />
        </SectionBox>
      )}
      {on("projects") && (
        <SectionBox setting={sec.projects}>
          <HomeProjects items={projects} title={site.projects.title ?? "Projects"} />
        </SectionBox>
      )}
      {biblia && on("biblia") && (
        <SectionBox setting={sec.biblia}>
          <HomeBiblia data={biblia} title={site.bibliaTitle ?? "Biblia"} seeAll={`/${profile.username}/biblia`} />
        </SectionBox>
      )}
      {github && on("github") && (
        <SectionBox setting={sec.github}>
          <HomeGithub data={github} title={site.githubTitle ?? "GitHub"} />
        </SectionBox>
      )}
      {on("shop") && (
        <SectionBox setting={sec.shop}>
          <HomeShop
            products={shopItems}
            open={shop.settings.is_open}
            title={shopTitle}
            base={routes.section(profile.username, "shop")}
          />
        </SectionBox>
      )}
      {rows.length > 0 && on("links") && (
        <SectionBox setting={sec.links}>
          <span id="links" className="block" />
          <IndexSection blocks={rows} mediaUrl={media.indexMedia} credit={creditOf(site.credits, media.indexMedia)} />
        </SectionBox>
      )}
      {on("showcase") && (
        <SectionBox setting={sec.showcase}>
          {showcase.length > 0 && <span id="showcase" className="block" />}
          <HomeShowcase items={showcase} title={site.showcaseTitle ?? "Showcase"} />
        </SectionBox>
      )}
      {designs && on("designs") && (
        <SectionBox setting={sec.designs}>
          <HomeDesigns
            data={designs}
            title={site.designsTitle ?? "Design"}
            href={site.designsUrl}
            seconds={style.gallerySeconds}
            autoplay={autoplay}
          />
        </SectionBox>
      )}
      {on("visit") && (
        <SectionBox setting={sec.visit}>
          <VisitCards items={site.visits} title={site.visitTitle ?? "Visit website"} />
        </SectionBox>
      )}
      {on("gallery") && (
        <>
          {media.gallery.length > 0 && <span id="gallery" className="block" />}
          <FadeGallery images={media.gallery} seconds={style.gallerySeconds} autoplay={autoplay} credits={site.credits} />
        </>
      )}
    </main>
  );
}