import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardSlider } from "@/components/site/CardSlider";
import { FadeGallery } from "@/components/site/FadeGallery";
import { Hero } from "@/components/site/Hero";
import { HeroContents, type ContentsItem } from "@/components/site/HeroContents";
import { Intro } from "@/components/site/Intro";
import { resolveGreetings } from "@/config/intro";
import { HomeBiblia } from "@/components/site/HomeBiblia";
import { HomeDesigns } from "@/components/site/HomeDesigns";
import { HomeGithub } from "@/components/site/HomeGithub";
import { HomeProjects } from "@/components/site/HomeProjects";
import { HomeShowcase } from "@/components/site/HomeShowcase";
import { IndexSection } from "@/components/site/IndexSection";
import { VisitCards } from "@/components/site/VisitCards";
import { readBackground } from "@/config/background";
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
import { creditOf, homeProjects, homeShowcase, homeWriting, listBlocks, resolveHomeMedia } from "@/lib/site-view";

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
export default async function HomePage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const blocks = await getPublicBlocks(profile.id);
  const site = readSite(profile.site);
  const style = readSiteStyle(profile.site_style);
  const media = resolveHomeMedia(site, readBackground(profile), blocks);
  const rows = listBlocks(blocks, "home");
  const projects = homeProjects(blocks);
  const writing = homeWriting(blocks);
  const showcase = homeShowcase(blocks);
  const autoplay = style.motion !== "off";
  const [biblia, designs, github, shop] = await Promise.all([
    fetchBiblia(site.bibliaUrl, 6),
    fetchDesigns(site.designsUrl, 3),
    fetchGithub(site.githubUser),
    getPublicShop(profile.id),
  ]);
  const shopItems = shop.products.filter((p) => p.show_on_home).slice(0, shopConfig.homeMax);
  const shopTitle = shop.settings.home_title ?? "Shop";
  // The table of contents over the hero: the sections that really show up on Home, in page order.
  const contents = [
    writing.length > 0 && { id: "writing", label: site.cardsTitle ?? site.writing.title ?? "Writing" },
    projects.length > 0 && { id: "projects", label: site.projects.title ?? "Projects" },
    biblia && biblia.books.length > 0 && { id: "biblia", label: site.bibliaTitle ?? "Biblia" },
    github && { id: "github", label: site.githubTitle ?? "GitHub" },
    shopItems.length > 0 && { id: "shop", label: shopTitle },
    rows.length > 0 && { id: "links", label: "Links" },
    showcase.length > 0 && { id: "showcase", label: site.showcaseTitle ?? "Showcase" },
    designs && designs.projects.length > 0 && { id: "designs", label: site.designsTitle ?? "Design" },
    site.visits.length > 0 && { id: "visit", label: site.visitTitle ?? "Visit website" },
    media.gallery.length > 0 && { id: "gallery", label: "Gallery" },
  ].filter((item): item is ContentsItem => Boolean(item));

  return (
    <>
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
      {writing.length > 0 && <span id="writing" className="block" />}
      {writing.length > 0 && (
        <CardSlider
          items={writing}
          title={site.cardsTitle ?? site.writing.title ?? "Writing"}
          seconds={style.heroSeconds}
          autoplay={autoplay}
        />
      )}
      <HomeProjects items={projects} title={site.projects.title ?? "Projects"} />
      {biblia && (
        <HomeBiblia data={biblia} title={site.bibliaTitle ?? "Biblia"} seeAll={`/${profile.username}/biblia`} />
      )}
      {github && <HomeGithub data={github} title={site.githubTitle ?? "GitHub"} />}
      <HomeShop
        products={shopItems}
        open={shop.settings.is_open}
        title={shopTitle}
        base={routes.section(profile.username, "shop")}
      />
      {rows.length > 0 && <span id="links" className="block" />}
      {rows.length > 0 && (
        <IndexSection blocks={rows} mediaUrl={media.indexMedia} credit={creditOf(site.credits, media.indexMedia)} />
      )}
      {showcase.length > 0 && <span id="showcase" className="block" />}
      <HomeShowcase items={showcase} title={site.showcaseTitle ?? "Showcase"} />
      {designs && (
        <HomeDesigns
          data={designs}
          title={site.designsTitle ?? "Design"}
          href={site.designsUrl}
          seconds={style.gallerySeconds}
          autoplay={autoplay}
        />
      )}
      <VisitCards items={site.visits} title={site.visitTitle ?? "Visit website"} />
      {media.gallery.length > 0 && <span id="gallery" className="block" />}
      <FadeGallery images={media.gallery} seconds={style.gallerySeconds} autoplay={autoplay} credits={site.credits} />
    </>
  );
}