import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import { HomeWriting } from "@/components/site/HomeWriting";
import { FadeGallery } from "@/components/site/FadeGallery";
import { Hero } from "@/components/site/Hero";
import { HeroContents, type ContentsItem } from "@/components/site/HeroContents";
import { Intro } from "@/components/site/Intro";
import { JsonLd } from "@/components/site/JsonLd";
import { resolveGreetings } from "@/config/intro";
import { HomeArticles } from "@/components/site/HomeArticles";
import { getPublicArticles } from "@/features/articles/queries";
import { HomeBiblia } from "@/components/site/HomeBiblia";
import { HomeCountdown } from "@/components/site/HomeCountdown";
import { HomeDesigns } from "@/components/site/HomeDesigns";
import { HomeGithub } from "@/components/site/HomeGithub";
import { HomeProjects } from "@/components/site/HomeProjects";
import { HomeShowcase } from "@/components/site/HomeShowcase";
import { HomeLinks } from "@/components/site/HomeLinks";
import { Reveal } from "@/components/site/Reveal";
import { SectionBox } from "@/components/site/SectionBox";
import { HomeVisit } from "@/components/site/HomeVisit";
import { readBackground } from "@/config/background";
import type { SectionId } from "@/config/layout";
import { cleanUrl } from "@/config/seo";
import { readSite } from "@/config/site-content";
import { readSiteStyle } from "@/config/site-style";
import { routes } from "@/config/site";
import { shopConfig } from "@/config/shop";
import { HomeShop } from "@/components/shop/HomeShop";
import { getPublicShop } from "@/features/shop/public";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { fetchBiblia } from "@/features/site/biblia";
import { fetchDesigns } from "@/features/site/designs";
import { fetchGithub } from "@/features/site/github";
import { personLd } from "@/lib/person-ld";
import { getSiteUrl } from "@/lib/site-url";
import {
  creditOf,
  homeCountdown,
  homeProjects,
  homeShowcase,
  homeWriting,
  listBlocks,
  resolveHomeMedia,
  socialsOf,
} from "@/lib/site-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  const description = profile.bio ?? `Personal website of ${profile.display_name}.`;
  const canonical = cleanUrl(profile.username, "/");
  return {
    metadataBase: new URL(await getSiteUrl()),
    alternates: canonical ? { canonical } : undefined,
    title: profile.display_name,
    description,
    openGraph: { title: profile.display_name, description, type: "website" },
    twitter: { card: "summary_large_image", title: profile.display_name, description },
  };
}

// Home: the hero first, then the sections in the order chosen in Customize ("Sections", style.order),
// then the footer (in the layout). Each section can be hidden or given extra space: style.sections.
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
    fetchDesigns(site.designsUrl, style.designCount),
    fetchGithub(site.githubUser),
    getPublicShop(profile.id),
    getPublicArticles(profile.id),
  ]);
  const shopItems = shop.products.filter((p) => p.show_on_home).slice(0, shopConfig.homeMax);
  const shopTitle = shop.settings.home_title ?? "Shop";

  // Which sections have something to show, the order chosen, and what is not hidden.
  const present: Record<SectionId, boolean> = {
    countdown: Boolean(countdown),
    writing: writing.length > 0,
    articles: articles.length > 0,
    projects: projects.length > 0,
    biblia: Boolean(biblia && biblia.books.length > 0),
    github: Boolean(github),
    shop: shopItems.length > 0,
    links: rows.length > 0,
    showcase: showcase.length > 0,
    designs: Boolean(designs && designs.projects.length > 0),
    visit: site.visits.length > 0,
    gallery: media.gallery.length > 0,
  };
  const sequence = style.order.filter((id) => on(id) && present[id]);

  // Writing and Articles touch only when Articles comes right after Writing.
  const writingAt = sequence.indexOf("writing");
  const joined = writingAt >= 0 && sequence[writingAt + 1] === "articles";

  // The table of contents over the hero: the sections that really show up, in page order.
  const labels: Record<SectionId, string> = {
    countdown: "Countdown",
    writing: site.cardsTitle ?? site.writing.title ?? "Writing",
    articles: site.articles.title ?? "Articles",
    projects: site.projects.title ?? "Projects",
    biblia: site.bibliaTitle ?? "Biblia",
    github: site.githubTitle ?? "GitHub",
    shop: shopTitle,
    links: site.linksTitle ?? "Links",
    showcase: site.showcaseTitle ?? "Showcase",
    designs: site.designsTitle ?? "Design",
    visit: site.visitTitle ?? "Visit website",
    gallery: "Gallery",
  };
  const contents: ContentsItem[] = sequence.map((id) => ({ id, label: labels[id] }));

  const parts: Record<SectionId, ReactNode> = {
    countdown: countdown && on("countdown") && (
      <SectionBox setting={sec.countdown}>
        <Reveal variant="still">
          <HomeCountdown
            title={countdown.title}
            description={countdown.body}
            target={countdown.data.target ?? ""}
            start={countdown.created_at}
            mode={style.countdownMode}
            view={style.countdownView}
            wideView={style.countdownWideView}
            titleAlign={style.countdownTitleAlign}
            titleFont={style.countdownTitleFont}
            titleSize={style.countdownTitleSize}
            introFont={style.countdownIntroFont}
            introSize={style.countdownIntroSize}
          />
        </Reveal>
      </SectionBox>
    ),
    writing: writing.length > 0 && on("writing") && (
      <SectionBox setting={sec.writing}>
        <span id="writing" className="block" />
        <HomeWriting
          mode={style.writingMode}
          view={style.writingView}
          wideView={style.writingWideView}
          size={style.writingSize}
          mediaHeight={style.writingMedia}
          stackRatio={style.writingStackRatio}
          stackCrop={style.writingStackCrop}
          titleAlign={style.writingTitleAlign}
          titleFont={style.writingTitleFont}
          titleSize={style.writingTitleSize}
          introFont={style.writingIntroFont}
          introSize={style.writingIntroSize}
          intro={site.cardsIntro}
          items={writing}
          title={site.cardsTitle ?? site.writing.title ?? "Writing"}
          seconds={style.heroSeconds}
          autoplay={autoplay}
          spacing={joined ? "site-pt pb-6 sm:pb-8" : undefined}
        />
      </SectionBox>
    ),
    articles: on("articles") && (
      <SectionBox setting={sec.articles}>
        <HomeArticles
          articles={articles}
          username={profile.username}
          title={site.articles.title ?? "Articles"}
          joined={joined}
          mode={style.articlesMode}
          view={style.articlesView}
          wideView={style.articlesWideView}
          size={style.articlesSize}
          mediaHeight={style.articlesMedia}
          stackRatio={style.articlesStackRatio}
          stackCrop={style.articlesStackCrop}
          leadRows={style.articlesLeadRows}
          leadStep={style.articlesLeadStep}
          leadMotion={style.articlesLeadMotion}
          leadTop={style.articlesLeadTop}
          leadBottom={style.articlesLeadBottom}
          seconds={style.heroSeconds}
          intro={site.articlesHomeIntro}
          titleAlign={style.articlesTitleAlign}
          titleFont={style.articlesTitleFont}
          titleSize={style.articlesTitleSize}
          introFont={style.articlesIntroFont}
          introSize={style.articlesIntroSize}
        />
      </SectionBox>
    ),
    projects: on("projects") && (
      <SectionBox setting={sec.projects}>
        <HomeProjects
          items={projects}
          title={site.projects.title ?? "Projects"}
          seeAll={routes.section(profile.username, "projects")}
          view={style.projectView}
          mode={style.projectMode}
          wideView={style.projectWideView}
          stackRatio={style.projectStackRatio}
          stackCrop={style.projectStackCrop}
          intro={site.projectsHomeIntro}
          titleAlign={style.projectTitleAlign}
          titleFont={style.projectTitleFont}
          titleSize={style.projectTitleSize}
          introFont={style.projectIntroFont}
          introSize={style.projectIntroSize}
          mediaHeight={style.projectMedia}
          slide={{ seconds: style.heroSeconds, autoplay }}
        />
      </SectionBox>
    ),
    biblia: biblia && on("biblia") && (
      <SectionBox setting={sec.biblia}>
        <HomeBiblia
          data={biblia}
          title={site.bibliaTitle ?? "Biblia"}
          seeAll={`/${profile.username}/biblia`}
          seconds={style.heroSeconds}
          mode={style.bibliaMode}
          view={style.bibliaView}
          wideView={style.bibliaWideView}
          size={style.bibliaSize}
          intro={site.bibliaHomeIntro}
          titleAlign={style.bibliaTitleAlign}
          titleFont={style.bibliaTitleFont}
          titleSize={style.bibliaTitleSize}
          introFont={style.bibliaIntroFont}
          introSize={style.bibliaIntroSize}
        />
      </SectionBox>
    ),
    github: github && on("github") && (
      <SectionBox setting={sec.github}>
        <HomeGithub
          data={github}
          title={site.githubTitle ?? "GitHub"}
          seconds={style.heroSeconds}
          mode={style.githubMode}
          view={style.githubView}
          wideView={style.githubWideView}
          intro={site.githubHomeIntro}
          titleAlign={style.githubTitleAlign}
          titleFont={style.githubTitleFont}
          titleSize={style.githubTitleSize}
          introFont={style.githubIntroFont}
          introSize={style.githubIntroSize}
        />
      </SectionBox>
    ),
    shop: on("shop") && (
      <SectionBox setting={sec.shop}>
        <HomeShop
          products={shopItems}
          open={shop.settings.is_open}
          title={shopTitle}
          base={routes.section(profile.username, "shop")}
          seconds={style.heroSeconds}
          mode={style.shopMode}
          view={style.shopView}
          wideView={style.shopWideView}
          size={style.shopSize}
          mediaHeight={style.shopMedia}
          stackRatio={style.shopStackRatio}
          stackCrop={style.shopStackCrop}
          intro={site.shopHomeIntro}
          titleAlign={style.shopTitleAlign}
          titleFont={style.shopTitleFont}
          titleSize={style.shopTitleSize}
          introFont={style.shopIntroFont}
          introSize={style.shopIntroSize}
        />
      </SectionBox>
    ),
    links: rows.length > 0 && on("links") && (
      <SectionBox setting={sec.links}>
        <span id="links" className="block" />
        <HomeLinks
          blocks={rows}
          mediaUrl={media.indexMedia}
          credit={creditOf(site.credits, media.indexMedia)}
          title={site.linksTitle}
          intro={site.linksHomeIntro}
          seconds={style.heroSeconds}
          mode={style.linksMode}
          view={style.linksView}
          wideView={style.linksWideView}
          titleAlign={style.linksTitleAlign}
          titleFont={style.linksTitleFont}
          titleSize={style.linksTitleSize}
          introFont={style.linksIntroFont}
          introSize={style.linksIntroSize}
        />
      </SectionBox>
    ),
    showcase: on("showcase") && (
      <SectionBox setting={sec.showcase}>
        {showcase.length > 0 && <span id="showcase" className="block" />}
        <HomeShowcase
          items={showcase}
          title={site.showcaseTitle ?? "Showcase"}
          mode={style.showcaseMode}
          view={style.showcaseView}
          wideView={style.showcaseWideView}
          size={style.showcaseSize}
          mediaHeight={style.showcaseMedia}
          slide={{ seconds: style.heroSeconds, autoplay }}
          intro={site.showcaseIntro}
          stackRatio={style.showcaseStackRatio}
          stackCrop={style.showcaseStackCrop}
          titleAlign={style.showcaseTitleAlign}
          titleFont={style.showcaseTitleFont}
          titleSize={style.showcaseTitleSize}
          introFont={style.showcaseIntroFont}
          introSize={style.showcaseIntroSize}
        />
      </SectionBox>
    ),
    designs: designs && on("designs") && (
      <SectionBox setting={sec.designs}>
        <HomeDesigns
          data={designs}
          title={site.designsTitle ?? "Design"}
          href={site.designsUrl}
          seconds={style.gallerySeconds}
          autoplay={autoplay}
          mode={style.designMode}
          view={style.designView}
          wideView={style.designWideView}
          intro={site.designsIntro}
          stackRatio={style.designStackRatio}
          stackCrop={style.designStackCrop}
          titleAlign={style.designTitleAlign}
          titleFont={style.designTitleFont}
          titleSize={style.designTitleSize}
          introFont={style.designIntroFont}
          introSize={style.designIntroSize}
          size={style.designSize}
          mediaHeight={style.designMedia}
          slide={{ seconds: style.heroSeconds, autoplay }}
        />
      </SectionBox>
    ),
    visit: on("visit") && (
      <SectionBox setting={sec.visit}>
        <HomeVisit
          items={site.visits}
          title={site.visitTitle ?? "Visit website"}
          intro={site.visitHomeIntro}
          seconds={style.heroSeconds}
          mode={style.visitMode}
          view={style.visitView}
          wideView={style.visitWideView}
          size={style.visitSize}
          titleAlign={style.visitTitleAlign}
          titleFont={style.visitTitleFont}
          titleSize={style.visitTitleSize}
          introFont={style.visitIntroFont}
          introSize={style.visitIntroSize}
        />
      </SectionBox>
    ),
    gallery: on("gallery") && (
      <>
        {media.gallery.length > 0 && <span id="gallery" className="block" />}
        <FadeGallery images={media.gallery} seconds={style.gallerySeconds} autoplay={autoplay} credits={site.credits} />
      </>
    ),
  };

  const person = personLd(profile, site, socialsOf(blocks));
  const home = cleanUrl(profile.username, "/");

  return (
    <main>
      {person && home && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${home}#website`,
                url: home,
                name: profile.display_name,
                description: profile.bio ?? undefined,
                publisher: { "@id": person["@id"] },
              },
              person,
            ],
          }}
        />
      )}
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
      {style.order.map((id) => (
        <Fragment key={id}>{parts[id]}</Fragment>
      ))}
    </main>
  );
}
