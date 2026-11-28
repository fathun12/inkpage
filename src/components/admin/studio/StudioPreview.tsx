"use client";

import { useCallback, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { HomeShop } from "@/components/shop/HomeShop";
import { AboutContent } from "@/components/site/AboutContent";
import { HomeWriting } from "@/components/site/HomeWriting";
import { FadeGallery } from "@/components/site/FadeGallery";
import { Hero } from "@/components/site/Hero";
import { HeroContents, type ContentsItem } from "@/components/site/HeroContents";
import { HomeArticles } from "@/components/site/HomeArticles";
import { HomeBiblia } from "@/components/site/HomeBiblia";
import { HomeCountdown } from "@/components/site/HomeCountdown";
import { HomeDesigns } from "@/components/site/HomeDesigns";
import { HomeGithub } from "@/components/site/HomeGithub";
import { HomeProjects } from "@/components/site/HomeProjects";
import { HomeShowcase } from "@/components/site/HomeShowcase";
import { HomeLinks } from "@/components/site/HomeLinks";
import { Intro } from "@/components/site/Intro";
import { NewsBar } from "@/components/site/NewsBar";
import { Reveal } from "@/components/site/Reveal";
import { SectionBox } from "@/components/site/SectionBox";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteFrame } from "@/components/site/SiteFrame";
import { SiteHeader } from "@/components/site/SiteHeader";
import type { Mode } from "@/components/site/ThemeSwitch";
import { HomeVisit } from "@/components/site/HomeVisit";
import { fontIds, type FontId, type FontPair } from "@/config/font-choices";
import { resolveGreetings } from "@/config/intro";
import { sectionLabels, type SectionId } from "@/config/layout";
import { previewMessages } from "@/config/preview";
import type { SiteSettings } from "@/config/site-content";
import type { SiteStyle } from "@/config/site-style";
import { routes } from "@/config/site";
import { creditOf, type HomeMedia } from "@/lib/site-view";
import type { Block, SocialItem } from "@/types/block";
import type { SteamData } from "@/types/steam";

type Props = {
  profile: { username: string; displayName: string; bio: string | null };
  fonts: FontPair;
  style: SiteStyle;
  site: SiteSettings;
  media: HomeMedia;
  rows: Block[];
  projects: Block[];
  showcase: Block[];
  countdown: Block | null;
  articles: ComponentProps<typeof HomeArticles>["articles"];
  cards: Block[];
  socials: SocialItem[];
  nav: { label: string; href: string }[];
  biblia: ComponentProps<typeof HomeBiblia>["data"] | null;
  designs: ComponentProps<typeof HomeDesigns>["data"] | null;
  github: ComponentProps<typeof HomeGithub>["data"] | null;
  steam: SteamData | null;
  steam2?: SteamData | null;
  shopItems: ComponentProps<typeof HomeShop>["products"];
  shopOpen: boolean;
  shopTitle: string;
  shopBase: string;
  contents: ContentsItem[];
};

type Draft = {
  fontHeading: FontId;
  fontBody: FontId;
  style: SiteStyle;
};

// The area of one section: every box inside its marker (the marker itself has no box).
function sectionArea(marker: Element) {
  const area = { top: Infinity, bottom: -Infinity };
  const walk = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      if (getComputedStyle(child).display === "contents") {
        walk(child);
        continue;
      }
      const rect = child.getBoundingClientRect();
      if (rect.height < 1) continue;
      area.top = Math.min(area.top, rect.top);
      area.bottom = Math.max(area.bottom, rect.bottom);
    }
  };
  walk(marker);
  return Number.isFinite(area.top) ? area : null;
}

// Puts a highlight box over one section, or hides it. The boxes live in the page itself (position absolute),
// so they scroll together with the page.
function place(box: HTMLDivElement | null, tag: HTMLSpanElement | null, id: SectionId | null) {
  if (!box) return;
  const marker = id ? document.querySelector(`[data-studio-section="${id}"]`) : null;
  const area = marker ? sectionArea(marker) : null;
  if (!id || !area) {
    box.style.display = "none";
    return;
  }
  box.style.display = "block";
  box.style.top = `${area.top + window.scrollY}px`;
  box.style.left = "0px";
  box.style.width = `${document.documentElement.clientWidth}px`;
  box.style.height = `${area.bottom - area.top}px`;
  if (tag) tag.textContent = sectionLabels[id];
}

// Shown when no link is on Home yet.
function sampleRows(): Block[] {
  return ["Your first project", "An article you wrote", "A download"].map(
    (title, index): Block => ({
      id: `sample-${index}`,
      user_id: "",
      type: "link",
      title,
      url: "https://example.com",
      body: null,
      image_url: null,
      data: {},
      position: index,
      page: "home",
      is_visible: true,
      is_pinned: false,
      publish_at: null,
      expire_at: null,
      created_at: "",
    }),
  );
}

// Home as a visitor sees it, inside the frame of the Customize studio. This page runs in its own window, so the
// screen height, the width of a phone, the scroll and the scroll motion are real. The studio sends the draft
// (unsaved settings); this page also sends back which section was clicked.
export function StudioPreview({
  profile,
  fonts,
  style,
  site,
  media,
  rows,
  projects,
  showcase,
  countdown,
  articles,
  cards,
  socials,
  nav,
  biblia,
  designs,
  github,
  steam,
  steam2 = null,
  shopItems,
  shopOpen,
  shopTitle,
  shopBase,
  contents,
}: Props) {
  const [draft, setDraft] = useState<Draft>(() => ({ fontHeading: fonts.heading, fontBody: fonts.body, style }));
  // System / Light / Dark of the footer switch, inside the preview only. Not saved.
  const [mode, setMode] = useState<Mode>("system");
  // Counts up to play the entrance of the top of Home again.
  const [replay, setReplay] = useState(0);
  // The page the studio is editing: Home or the About page.
  const [page, setPage] = useState<"home" | "about" | "footer">("home");
  useEffect(() => {
    window.scrollTo(0, page === "footer" ? document.body.scrollHeight : 0);
  }, [page]);

  const hoverBox = useRef<HTMLDivElement>(null);
  const hoverTag = useRef<HTMLSpanElement>(null);
  const pickBox = useRef<HTMLDivElement>(null);
  const hoverId = useRef<SectionId | null>(null);
  const pickedId = useRef<SectionId | null>(null);
  const orderRef = useRef<SectionId[]>(draft.style.order);

  const paint = useCallback(() => {
    const hover = hoverId.current === pickedId.current ? null : hoverId.current;
    place(hoverBox.current, hoverTag.current, hover);
    place(pickBox.current, null, pickedId.current);
  }, []);

  useEffect(() => {
    orderRef.current = draft.style.order;
  });
  // Keeps the boxes on their sections when anything changes.
  useEffect(() => {
    paint();
  });
  useEffect(() => {
    const observer = new ResizeObserver(() => paint());
    observer.observe(document.body);
    window.addEventListener("resize", paint);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", paint);
    };
  }, [paint]);

  // Messages from the studio: the draft, and "play the entrance again". Then tell the studio this page is ready.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const data: unknown = event.data;
      if (typeof data !== "object" || data === null) return;
      const msg = data as { type?: unknown; draft?: unknown; page?: unknown };
      if (msg.type === previewMessages.draft && typeof msg.draft === "object" && msg.draft !== null) {
        if (msg.page === "home" || msg.page === "about" || msg.page === "footer") setPage(msg.page);
        const raw = msg.draft as { fontHeading?: unknown; fontBody?: unknown; style?: unknown };
        if (typeof raw.style !== "object" || raw.style === null) return;
        setDraft((d) => ({
          fontHeading: fontIds.find((id) => id === raw.fontHeading) ?? d.fontHeading,
          fontBody: fontIds.find((id) => id === raw.fontBody) ?? d.fontBody,
          style: raw.style as SiteStyle,
        }));
      } else if (msg.type === previewMessages.replay) {
        window.scrollTo(0, 0);
        setReplay((n) => n + 1);
      }
    }
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: previewMessages.ready }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Inspect mode, like the inspector of a browser: hover shows a section, click selects it (and tells the studio).
  useEffect(() => {
    const sectionAt = (target: EventTarget | null): SectionId | null => {
      if (!(target instanceof Element)) return null;
      const id = target.closest("[data-studio-section]")?.getAttribute("data-studio-section");
      return orderRef.current.find((s) => s === id) ?? null;
    };
    const move = (event: MouseEvent) => {
      const id = sectionAt(event.target);
      if (id !== hoverId.current) {
        hoverId.current = id;
        paint();
      }
    };
    const leave = () => {
      hoverId.current = null;
      paint();
    };
    // Links must not leave the preview, and the section under the mouse is selected.
    const click = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a")) event.preventDefault();
      const id = sectionAt(event.target);
      if (!id) return;
      pickedId.current = id;
      paint();
      window.parent.postMessage({ type: previewMessages.pick, id }, window.location.origin);
    };
    document.addEventListener("mousemove", move);
    document.documentElement.addEventListener("mouseleave", leave);
    document.addEventListener("click", click, true);
    return () => {
      document.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.removeEventListener("click", click, true);
    };
  }, [paint]);

  const previewRows = rows.length > 0 ? rows : sampleRows();
  const autoplay = draft.style.motion !== "off";
  const base = routes.profile(profile.username);
  const sec = draft.style.sections;
  const on = (id: SectionId) => !sec[id].hidden;
  // Sections that have something to show and are not hidden, in the order of the draft.
  const withData = new Set(contents.map((item) => item.id));
  const sequence = draft.style.order.filter((id) => on(id) && withData.has(id));
  const shownContents = sequence
    .map((id) => contents.find((item) => item.id === id))
    .filter((item): item is ContentsItem => Boolean(item));
  // Writing and Articles touch only when Articles comes right after Writing.
  const writingAt = sequence.indexOf("writing");
  const joined = writingAt >= 0 && sequence[writingAt + 1] === "articles";
  // The same countdown as the news bar of the real page.
  const newsCountdown =
    countdown && countdown.data.target ? { title: countdown.title, target: countdown.data.target } : null;

  // Each section of Home, ready to place. The order comes from the draft (Sections panel).
  const parts: Record<SectionId, ReactNode> = {
    countdown: countdown && on("countdown") && (
      <SectionBox setting={sec.countdown}>
        <Reveal variant="still">
          <HomeCountdown
            title={countdown.title}
            description={countdown.body}
            target={countdown.data.target ?? ""}
            start={countdown.created_at}
            mode={draft.style.countdownMode}
            view={draft.style.countdownView}
            wideView={draft.style.countdownWideView}
            titleAlign={draft.style.countdownTitleAlign}
            titleFont={draft.style.countdownTitleFont}
            titleSize={draft.style.countdownTitleSize}
            introFont={draft.style.countdownIntroFont}
            introSize={draft.style.countdownIntroSize}
          />
        </Reveal>
      </SectionBox>
    ),
    writing: cards.length > 0 && on("writing") && (
      <SectionBox setting={sec.writing}>
        <span id="writing" className="block" />
        <HomeWriting
          mode={draft.style.writingMode}
          view={draft.style.writingView}
          wideView={draft.style.writingWideView}
          size={draft.style.writingSize}
          mediaHeight={draft.style.writingMedia}
          stackRatio={draft.style.writingStackRatio}
          stackCrop={draft.style.writingStackCrop}
          titleAlign={draft.style.writingTitleAlign}
          titleFont={draft.style.writingTitleFont}
          titleSize={draft.style.writingTitleSize}
          introFont={draft.style.writingIntroFont}
          introSize={draft.style.writingIntroSize}
          intro={site.cardsIntro}
          items={cards}
          title={site.cardsTitle ?? site.writing.title ?? "Writing"}
          seconds={draft.style.heroSeconds}
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
          mode={draft.style.articlesMode}
          view={draft.style.articlesView}
          wideView={draft.style.articlesWideView}
          size={draft.style.articlesSize}
          mediaHeight={draft.style.articlesMedia}
          stackRatio={draft.style.articlesStackRatio}
          stackCrop={draft.style.articlesStackCrop}
          leadRows={draft.style.articlesLeadRows}
          leadStep={draft.style.articlesLeadStep}
          leadMotion={draft.style.articlesLeadMotion}
          leadTop={draft.style.articlesLeadTop}
          leadBottom={draft.style.articlesLeadBottom}
          seconds={draft.style.heroSeconds}
          intro={site.articlesHomeIntro}
          titleAlign={draft.style.articlesTitleAlign}
          titleFont={draft.style.articlesTitleFont}
          titleSize={draft.style.articlesTitleSize}
          introFont={draft.style.articlesIntroFont}
          introSize={draft.style.articlesIntroSize}
        />
      </SectionBox>
    ),
    projects: on("projects") && (
      <SectionBox setting={sec.projects}>
        <HomeProjects
          items={projects}
          title={site.projects.title ?? "Projects"}
          seeAll={routes.section(profile.username, "projects")}
          view={draft.style.projectView}
          mode={draft.style.projectMode}
          wideView={draft.style.projectWideView}
          stackRatio={draft.style.projectStackRatio}
          stackCrop={draft.style.projectStackCrop}
          intro={site.projectsHomeIntro}
          titleAlign={draft.style.projectTitleAlign}
          titleFont={draft.style.projectTitleFont}
          titleSize={draft.style.projectTitleSize}
          introFont={draft.style.projectIntroFont}
          introSize={draft.style.projectIntroSize}
          mediaHeight={draft.style.projectMedia}
          slide={{ seconds: draft.style.heroSeconds, autoplay }}
        />
      </SectionBox>
    ),
    biblia: biblia && on("biblia") && (
      <SectionBox setting={sec.biblia}>
        <HomeBiblia
          data={biblia}
          title={site.bibliaTitle ?? "Biblia"}
          seeAll={`${base}/biblia`}
          seconds={draft.style.heroSeconds}
          mode={draft.style.bibliaMode}
          view={draft.style.bibliaView}
          wideView={draft.style.bibliaWideView}
          size={draft.style.bibliaSize}
          intro={site.bibliaHomeIntro}
          titleAlign={draft.style.bibliaTitleAlign}
          titleFont={draft.style.bibliaTitleFont}
          titleSize={draft.style.bibliaTitleSize}
          introFont={draft.style.bibliaIntroFont}
          introSize={draft.style.bibliaIntroSize}
        />
      </SectionBox>
    ),
    github: github && on("github") && (
      <SectionBox setting={sec.github}>
        <HomeGithub
          data={github}
          title={site.githubTitle ?? "GitHub"}
          seconds={draft.style.heroSeconds}
          mode={draft.style.githubMode}
          view={draft.style.githubView}
          wideView={draft.style.githubWideView}
          intro={site.githubHomeIntro}
          titleAlign={draft.style.githubTitleAlign}
          titleFont={draft.style.githubTitleFont}
          titleSize={draft.style.githubTitleSize}
          introFont={draft.style.githubIntroFont}
          introSize={draft.style.githubIntroSize}
        />
      </SectionBox>
    ),
    shop: on("shop") && (
      <SectionBox setting={sec.shop}>
        <HomeShop
          products={shopItems}
          open={shopOpen}
          title={shopTitle}
          base={shopBase}
          seconds={draft.style.heroSeconds}
          mode={draft.style.shopMode}
          view={draft.style.shopView}
          wideView={draft.style.shopWideView}
          size={draft.style.shopSize}
          mediaHeight={draft.style.shopMedia}
          stackRatio={draft.style.shopStackRatio}
          stackCrop={draft.style.shopStackCrop}
          intro={site.shopHomeIntro}
          titleAlign={draft.style.shopTitleAlign}
          titleFont={draft.style.shopTitleFont}
          titleSize={draft.style.shopTitleSize}
          introFont={draft.style.shopIntroFont}
          introSize={draft.style.shopIntroSize}
        />
      </SectionBox>
    ),
    links: on("links") && (
      <SectionBox setting={sec.links}>
        <span id="links" className="block" />
        <HomeLinks
          blocks={previewRows}
          mediaUrl={media.indexMedia}
          credit={creditOf(site.credits, media.indexMedia)}
          title={site.linksTitle}
          intro={site.linksHomeIntro}
          seconds={draft.style.heroSeconds}
          mode={draft.style.linksMode}
          view={draft.style.linksView}
          wideView={draft.style.linksWideView}
          titleAlign={draft.style.linksTitleAlign}
          titleFont={draft.style.linksTitleFont}
          titleSize={draft.style.linksTitleSize}
          introFont={draft.style.linksIntroFont}
          introSize={draft.style.linksIntroSize}
        />
      </SectionBox>
    ),
    showcase: on("showcase") && (
      <SectionBox setting={sec.showcase}>
        {showcase.length > 0 && <span id="showcase" className="block" />}
        <HomeShowcase
          items={showcase}
          title={site.showcaseTitle ?? "Showcase"}
          mode={draft.style.showcaseMode}
          view={draft.style.showcaseView}
          wideView={draft.style.showcaseWideView}
          size={draft.style.showcaseSize}
          mediaHeight={draft.style.showcaseMedia}
          slide={{ seconds: draft.style.heroSeconds, autoplay }}
          intro={site.showcaseIntro}
          stackRatio={draft.style.showcaseStackRatio}
          stackCrop={draft.style.showcaseStackCrop}
          titleAlign={draft.style.showcaseTitleAlign}
          titleFont={draft.style.showcaseTitleFont}
          titleSize={draft.style.showcaseTitleSize}
          introFont={draft.style.showcaseIntroFont}
          introSize={draft.style.showcaseIntroSize}
        />
      </SectionBox>
    ),
    designs: designs && on("designs") && (
      <SectionBox setting={sec.designs}>
        <HomeDesigns
          data={{ ...designs, projects: designs.projects.slice(0, draft.style.designCount) }}
          title={site.designsTitle ?? "Design"}
          href={site.designsUrl}
          seconds={draft.style.gallerySeconds}
          autoplay={autoplay}
          mode={draft.style.designMode}
          view={draft.style.designView}
          wideView={draft.style.designWideView}
          intro={site.designsIntro}
          stackRatio={draft.style.designStackRatio}
          stackCrop={draft.style.designStackCrop}
          titleAlign={draft.style.designTitleAlign}
          titleFont={draft.style.designTitleFont}
          titleSize={draft.style.designTitleSize}
          introFont={draft.style.designIntroFont}
          introSize={draft.style.designIntroSize}
          size={draft.style.designSize}
          mediaHeight={draft.style.designMedia}
          slide={{ seconds: draft.style.heroSeconds, autoplay }}
        />
      </SectionBox>
    ),
    visit: on("visit") && (
      <SectionBox setting={sec.visit}>
        <HomeVisit
          items={site.visits}
          title={site.visitTitle ?? "Visit website"}
          intro={site.visitHomeIntro}
          seconds={draft.style.heroSeconds}
          mode={draft.style.visitMode}
          view={draft.style.visitView}
          wideView={draft.style.visitWideView}
          size={draft.style.visitSize}
          titleAlign={draft.style.visitTitleAlign}
          titleFont={draft.style.visitTitleFont}
          titleSize={draft.style.visitTitleSize}
          introFont={draft.style.visitIntroFont}
          introSize={draft.style.visitIntroSize}
        />
      </SectionBox>
    ),
    gallery: on("gallery") && (
      <>
        {media.gallery.length > 0 && <span id="gallery" className="block" />}
        <FadeGallery
          images={media.gallery}
          seconds={draft.style.gallerySeconds}
          autoplay={autoplay}
          credits={site.credits}
        />
      </>
    ),
  };

  return (
    <>
      <SiteFrame
        key={replay}
        fonts={{ heading: draft.fontHeading, body: draft.fontBody }}
        style={draft.style}
        mode={mode}
      >
        <NewsBar
          items={site.news}
          seconds={draft.style.heroSeconds}
          autoplay={autoplay}
          showClock={site.showClock}
          countdown={newsCountdown}
          layout={draft.style.topBar}
        />
        <SiteHeader brand={profile.username} home={base} items={nav} overlay={page === "home"} />
        <main>
          {page === "footer" ? (
            <div aria-hidden className="h-[30svh]" />
          ) : page === "about" ? (
            <AboutContent
              title={site.about.title ?? "About"}
              name={profile.displayName}
              bio={profile.bio}
              body={site.about.body}
              photo={site.about.photo}
              steam={steam}
              steam2={steam2}
              steamMedia={site.steamMedia}
              steamCredit={creditOf(site.credits, site.steamMedia)}
              style={draft.style}
            />
          ) : (
          <>
          <Hero
            slides={media.hero}
            name={profile.displayName}
            caption={site.heroCaption ?? profile.bio}
            seconds={draft.style.heroSeconds}
            autoplay={autoplay}
            gray={draft.style.heroGray}
            credits={site.credits}
          >
            {site.intro.enabled && site.intro.headlines.length > 0 && (
              <Intro
                greetings={resolveGreetings(site.intro.greetings)}
                note={site.intro.note}
                headlines={site.intro.headlines}
                seconds={draft.style.heroSeconds}
                autoplay={autoplay}
              />
            )}
            <HeroContents items={shownContents} />
          </Hero>
          {draft.style.order.map((id) =>
            parts[id] ? (
              <div key={id} data-studio-section={id} className="contents">
                {parts[id]}
              </div>
            ) : null,
          )}
          </>
          )}
        </main>
        <SiteFooter
          brand={profile.username}
          name={profile.displayName}
          bio={profile.bio}
          note={site.footerNote}
          socials={socials}
          contactEmail={site.contactEmail}
          whatsapp={site.whatsapp}
          nav={nav}
          modeControl={{ value: mode, onChange: setMode }}
          layout={draft.style.footer}
          news={{
            items: site.news,
            seconds: draft.style.heroSeconds,
            autoplay,
            showClock: site.showClock,
            countdown: newsCountdown,
          }}
        />
      </SiteFrame>
      <div ref={pickBox} aria-hidden className="pointer-events-none absolute z-50 hidden border-2 border-accent" />
      <div
        ref={hoverBox}
        aria-hidden
        className="pointer-events-none absolute z-60 hidden border border-accent bg-accent/15"
      >
        <span
          ref={hoverTag}
          className="absolute left-0 top-0 bg-accent px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-ink"
        />
      </div>
    </>
  );
}