"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { SectionControls } from "@/components/admin/studio/SectionControls";
import { HomeShop } from "@/components/shop/HomeShop";
import { CardSlider } from "@/components/site/CardSlider";
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
import { IndexSection } from "@/components/site/IndexSection";
import { Intro } from "@/components/site/Intro";
import { NewsBar } from "@/components/site/NewsBar";
import { SectionBox } from "@/components/site/SectionBox";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteFrame } from "@/components/site/SiteFrame";
import { SiteHeader } from "@/components/site/SiteHeader";
import type { Mode } from "@/components/site/ThemeSwitch";
import { VisitCards } from "@/components/site/VisitCards";
import { Field } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  defaultFont,
  fontChoices,
  fontGroups,
  fontIds,
  type FontId,
  type FontPair,
} from "@/config/font-choices";
import { resolveGreetings } from "@/config/intro";
import {
  countdownViewHints,
  countdownViewLabels,
  countdownViews,
  densityHints,
  densityLabels,
  densityModes,
  projectSizeHints,
  projectSizeLabels,
  projectSizes,
  projectViewHints,
  projectViewLabels,
  projectViews,
  sectionLabels,
  type SectionId,
  type SectionSetting,
} from "@/config/layout";
import type { SiteSettings } from "@/config/site-content";
import {
  motionHints,
  motionLabels,
  motionModes,
  siteStyleDefaults,
  styleRanges,
  type MotionMode,
  type SiteStyle,
} from "@/config/site-style";
import { routes } from "@/config/site";
import { creditOf, type HomeMedia } from "@/lib/site-view";
import { cn } from "@/lib/utils";
import type { Block, SocialItem } from "@/types/block";
import type { FormAction } from "@/types/form";

type Props = {
  action: FormAction;
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
  shopItems: ComponentProps<typeof HomeShop>["products"];
  shopOpen: boolean;
  shopTitle: string;
  shopBase: string;
  contents: ContentsItem[];
  notice?: ReactNode;
};

type Draft = {
  fontHeading: FontId;
  fontBody: FontId;
  style: SiteStyle;
};

// Width (px) of the preview in Phone mode. Change this one number to make it wider or narrower.
const phoneWidth = 480;

const pill =
  "ink-border cursor-pointer rounded-full px-3 py-1.5 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";
const colorInput = "ink-border h-10 w-20 cursor-pointer rounded-md bg-surface p-1";
const resetButton =
  "self-start font-mono text-xs uppercase tracking-widest text-ink-soft underline underline-offset-4 hover:text-ink";

// The area of one section in the preview: every box inside its marker (the marker itself has no box).
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

// Puts a highlight box over one section of the preview, or hides it.
function place(
  box: HTMLDivElement | null,
  tag: HTMLSpanElement | null,
  id: SectionId | null,
  scroll: HTMLElement,
  frame: HTMLElement,
) {
  if (!box) return;
  const marker = id ? scroll.querySelector(`[data-studio-section="${id}"]`) : null;
  const area = marker ? sectionArea(marker) : null;
  if (!id || !area) {
    box.style.display = "none";
    return;
  }
  const frameRect = frame.getBoundingClientRect();
  const scrollRect = scroll.getBoundingClientRect();
  box.style.display = "block";
  box.style.top = `${area.top - frameRect.top}px`;
  box.style.left = `${scrollRect.left - frameRect.left}px`;
  box.style.width = `${scroll.clientWidth}px`;
  box.style.height = `${area.bottom - area.top}px`;
  if (tag) tag.textContent = sectionLabels[id];
}

// Shown in the preview when no link is on Home yet.
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

function Section({
  id,
  title,
  open,
  onReset,
  children,
}: {
  id?: string;
  title: string;
  open?: boolean;
  onReset?: () => void;
  children: ReactNode;
}) {
  return (
    <details id={id} open={open} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="font-mono text-xs text-ink-soft transition-transform group-open:rotate-90">
          →
        </span>
      </summary>
      <div className="flex flex-col gap-5 px-5 pb-5">
        {children}
        {onReset && (
          <button type="button" onClick={onReset} className={resetButton}>
            Reset {title.toLowerCase()}
          </button>
        )}
      </div>
    </details>
  );
}

function Slider({
  id,
  label,
  value,
  range,
  unit = "",
  hint,
  format,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  range: { min: number; max: number; step: number };
  unit?: string;
  hint?: string;
  format?: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={`${label}: ${format ? format(value) : `${value}${unit}`}`} htmlFor={id} hint={hint}>
      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </Field>
  );
}

function FontPicker({
  legend,
  value,
  onChange,
}: {
  legend: string;
  value: FontId;
  onChange: (id: FontId) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-medium text-ink-soft">{legend}</legend>
      {fontGroups.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{group.label}</span>
          <div className="grid grid-cols-2 gap-2">
            {fontIds
              .filter((id) => fontChoices[id].group === group.id)
              .map((id) => (
                <label
                  key={id}
                  className="ink-border cursor-pointer rounded-md px-3 py-2 has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
                >
                  <input
                    type="radio"
                    value={id}
                    checked={id === value}
                    onChange={() => onChange(id)}
                    className="sr-only"
                  />
                  <span
                    className="block text-2xl leading-none"
                    style={{ fontFamily: `var(${fontChoices[id].cssVar}), system-ui, sans-serif` }}
                  >
                    Aa
                  </span>
                  <span className="mt-1 block text-xs">{fontChoices[id].label}</span>
                </label>
              ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}

export function CustomizeStudio({
  action,
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
  shopItems,
  shopOpen,
  shopTitle,
  shopBase,
  contents,
  notice,
}: Props) {
  const [initial] = useState<Draft>(() => ({
    fontHeading: fonts.heading,
    fontBody: fonts.body,
    style,
  }));
  const [draft, setDraft] = useState<Draft>(initial);
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  // System / Light / Dark inside the preview box only. Not saved.
  const [previewMode, setPreviewMode] = useState<Mode>("system");

  // Inspect mode in the preview, like the inspector of a browser: hover shows a section, click selects it.
  // The two highlight boxes are moved by hand (no state), so moving the mouse does not render the studio again.
  const [picked, setPicked] = useState<SectionId | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hoverBox = useRef<HTMLDivElement>(null);
  const hoverTag = useRef<HTMLSpanElement>(null);
  const pickBox = useRef<HTMLDivElement>(null);
  const hoverId = useRef<SectionId | null>(null);
  const pickedId = useRef<SectionId | null>(null);

  const paint = useCallback(() => {
    const frame = frameRef.current;
    const scroll = scrollRef.current;
    if (!frame || !scroll) return;
    const hover = hoverId.current === pickedId.current ? null : hoverId.current;
    place(hoverBox.current, hoverTag.current, hover, scroll, frame);
    place(pickBox.current, null, pickedId.current, scroll, frame);
  }, []);

  // Keeps the boxes on their sections when anything changes (settings, device, size of the page).
  useEffect(() => {
    paint();
  });
  useEffect(() => {
    const frame = frameRef.current;
    const page = scrollRef.current?.firstElementChild;
    if (!frame) return;
    const observer = new ResizeObserver(() => paint());
    observer.observe(frame);
    if (page) observer.observe(page);
    return () => observer.disconnect();
  }, [paint]);

  function sectionAt(target: EventTarget): SectionId | null {
    if (!(target instanceof Element)) return null;
    const id = target.closest("[data-studio-section]")?.getAttribute("data-studio-section");
    return draft.style.order.find((s) => s === id) ?? null;
  }
  function hoverMove(event: MouseEvent<HTMLDivElement>) {
    const id = sectionAt(event.target);
    if (id !== hoverId.current) {
      hoverId.current = id;
      paint();
    }
  }
  function hoverLeave() {
    hoverId.current = null;
    paint();
  }
  // Selects a section: opens the Sections panel and the row of that section, and scrolls to it.
  function pick(id: SectionId) {
    pickedId.current = id;
    setPicked(id);
    paint();
    const panel = document.getElementById("studio-sections");
    if (panel instanceof HTMLDetailsElement) panel.open = true;
    const row = document.getElementById(`studio-row-${id}`);
    const details = row?.querySelector("details");
    if (details) details.open = true;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row?.scrollIntoView({ block: "center", behavior: calm ? "auto" : "smooth" });
  }

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function setStyle(patch: Partial<SiteStyle>) {
    setDraft((d) => ({ ...d, style: { ...d.style, ...patch } }));
  }
  function setSection(id: SectionId, patch: Partial<SectionSetting>) {
    setDraft((d) => ({
      ...d,
      style: {
        ...d.style,
        sections: { ...d.style.sections, [id]: { ...d.style.sections[id], ...patch } },
      },
    }));
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
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

  // A click in the preview: links must not leave the studio, and the section under the mouse is selected.
  function previewClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a")) event.preventDefault();
    const id = sectionAt(event.target);
    if (id) pick(id);
  }

  // Each section of Home, ready to place. The order comes from the draft (Sections panel).
  const parts: Record<SectionId, ReactNode> = {
    countdown: countdown && on("countdown") && (
      <SectionBox setting={sec.countdown}>
        <HomeCountdown
          title={countdown.title}
          description={countdown.body}
          target={countdown.data.target ?? ""}
          start={countdown.created_at}
          variant={draft.style.countdownView}
        />
      </SectionBox>
    ),
    writing: cards.length > 0 && on("writing") && (
      <SectionBox setting={sec.writing}>
        <CardSlider
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
          mediaHeight={draft.style.projectMedia}
          slide={{ seconds: draft.style.heroSeconds, autoplay }}
        />
      </SectionBox>
    ),
    biblia: biblia && on("biblia") && (
      <SectionBox setting={sec.biblia}>
        <HomeBiblia data={biblia} title={site.bibliaTitle ?? "Biblia"} seeAll={`${base}/biblia`} />
      </SectionBox>
    ),
    github: github && on("github") && (
      <SectionBox setting={sec.github}>
        <HomeGithub data={github} title={site.githubTitle ?? "GitHub"} />
      </SectionBox>
    ),
    shop: on("shop") && (
      <SectionBox setting={sec.shop}>
        <HomeShop products={shopItems} open={shopOpen} title={shopTitle} base={shopBase} />
      </SectionBox>
    ),
    links: on("links") && (
      <SectionBox setting={sec.links}>
        <IndexSection
          blocks={previewRows}
          mediaUrl={media.indexMedia}
          credit={creditOf(site.credits, media.indexMedia)}
        />
      </SectionBox>
    ),
    showcase: on("showcase") && (
      <SectionBox setting={sec.showcase}>
        <HomeShowcase items={showcase} title={site.showcaseTitle ?? "Showcase"} />
      </SectionBox>
    ),
    designs: designs && on("designs") && (
      <SectionBox setting={sec.designs}>
        <HomeDesigns
          data={designs}
          title={site.designsTitle ?? "Design"}
          href={site.designsUrl}
          seconds={draft.style.gallerySeconds}
          autoplay={autoplay}
        />
      </SectionBox>
    ),
    visit: on("visit") && (
      <SectionBox setting={sec.visit}>
        <VisitCards items={site.visits} title={site.visitTitle ?? "Visit website"} />
      </SectionBox>
    ),
    gallery: on("gallery") && (
      <FadeGallery
        images={media.gallery}
        seconds={draft.style.gallerySeconds}
        autoplay={autoplay}
        credits={site.credits}
      />
    ),
  };

  // Settings that belong to one section only. They sit inside that section's row in the Sections panel.
  const projectControls = (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Size on Home</span>
        <div className="flex flex-wrap gap-2">
          {projectSizes.map((m) => (
            <label key={m} className={pill}>
              <input
                type="radio"
                value={m}
                checked={draft.style.projectSize === m}
                onChange={() => setStyle({ projectSize: m })}
                className="sr-only"
              />
              {projectSizeLabels[m]}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">{projectSizeHints[draft.style.projectSize]}</p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Layout on Home</span>
        <div className="flex flex-wrap gap-2">
          {projectViews.map((m) => (
            <label key={m} className={pill}>
              <input
                type="radio"
                value={m}
                checked={draft.style.projectView === m}
                onChange={() => setStyle({ projectView: m })}
                className="sr-only"
              />
              {projectViewLabels[m]}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">{projectViewHints[draft.style.projectView]}</p>
      </div>
      <Slider
        id="ui_project_media"
        label="Photo height"
        value={draft.style.projectMedia}
        range={styleRanges.projectMedia}
        format={(v) => (v === 0 ? "Auto" : `${v} rem`)}
        hint="Height of each photo on Home. Auto keeps the shape of each photo."
        onChange={(projectMedia) => setStyle({ projectMedia })}
      />
    </>
  );
  const countdownControls = (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink-soft">Style</span>
      <div className="flex flex-wrap gap-2">
        {countdownViews.map((m) => (
          <label key={m} className={pill}>
            <input
              type="radio"
              value={m}
              checked={draft.style.countdownView === m}
              onChange={() => setStyle({ countdownView: m })}
              className="sr-only"
            />
            {countdownViewLabels[m]}
          </label>
        ))}
      </div>
      <p className="text-xs text-ink-soft">{countdownViewHints[draft.style.countdownView]}</p>
    </div>
  );

  return (
    <form action={action} className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-bg">
      {/* The sidebar controls have no name. These hidden inputs are what the server receives. */}
      <input type="hidden" name="site_color_bg" value={draft.style.colorBg} />
      <input type="hidden" name="site_color_ink" value={draft.style.colorInk} />
      <input type="hidden" name="site_color_accent" value={draft.style.colorAccent} />
      <input type="hidden" name="site_color_band" value={draft.style.colorBand} />
      <input type="hidden" name="site_color_tertiary" value={draft.style.colorTertiary} />
      <input type="hidden" name="font_heading" value={draft.fontHeading} />
      <input type="hidden" name="font_body" value={draft.fontBody} />
      <input type="hidden" name="site_motion" value={draft.style.motion} />
      <input type="hidden" name="site_hero_seconds" value={draft.style.heroSeconds} />
      <input type="hidden" name="site_gallery_seconds" value={draft.style.gallerySeconds} />
      <input type="hidden" name="site_hero_overlay" value={draft.style.heroOverlay} />
      <input type="hidden" name="site_index_veil" value={draft.style.indexVeil} />
      <input type="hidden" name="site_hero_zoom" value={draft.style.heroZoom} />
      <input type="hidden" name="site_index_zoom" value={draft.style.indexZoom} />
      <input type="hidden" name="site_density" value={draft.style.density} />
      <input type="hidden" name="site_project_size" value={draft.style.projectSize} />
      <input type="hidden" name="site_sections" value={JSON.stringify(draft.style.sections)} />
      <input type="hidden" name="site_order" value={JSON.stringify(draft.style.order)} />
      <input type="hidden" name="site_project_view" value={draft.style.projectView} />
      <input type="hidden" name="site_project_media" value={draft.style.projectMedia} />
      <input type="hidden" name="site_countdown_view" value={draft.style.countdownView} />
      {draft.style.heroGray && <input type="hidden" name="site_hero_gray" value="on" />}

      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-5 py-3">
        <Link
          href={routes.admin}
          className="font-mono text-sm uppercase tracking-wider text-ink-soft hover:text-ink"
        >
          ← Back
        </Link>
        <span className="font-display text-lg font-medium">Customize</span>
        {dirty && <span className="font-mono text-xs text-accent">● Unsaved changes</span>}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden gap-1 lg:flex" role="group" aria-label="Preview size">
            {(["phone", "desktop"] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={device === d}
                onClick={() => setDevice(d)}
                className={cn(
                  "rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider",
                  device === d ? "bg-ink text-bg" : "text-ink-soft hover:text-ink",
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <Link href={routes.pages} className="font-mono text-sm underline underline-offset-4">
            Pages
          </Link>
          <a
            href={base}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm underline underline-offset-4"
          >
            View site
          </a>
          <SubmitButton variant="accent" size="sm">
            Save changes
          </SubmitButton>
        </div>
      </header>

      {notice && <div className="px-5 pt-3">{notice}</div>}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="relative order-2 min-h-0 flex-1 overflow-y-auto border-t border-line lg:order-1 lg:w-[360px] lg:flex-none lg:border-r lg:border-t-0">
          <Section
            title="Layout"
            open
            onReset={() => setStyle({ density: siteStyleDefaults.density })}
          >
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink-soft">Space between sections</span>
              <div className="flex flex-wrap gap-2">
                {densityModes.map((m) => (
                  <label key={m} className={pill}>
                    <input
                      type="radio"
                      value={m}
                      checked={draft.style.density === m}
                      onChange={() => setStyle({ density: m })}
                      className="sr-only"
                    />
                    {densityLabels[m]}
                  </label>
                ))}
              </div>
              <p className="text-xs text-ink-soft">{densityHints[draft.style.density]}</p>
            </div>
          </Section>
          <Section
            title="Sections"
            id="studio-sections"
            onReset={() =>
              setStyle({
                sections: siteStyleDefaults.sections,
                order: siteStyleDefaults.order,
                projectSize: siteStyleDefaults.projectSize,
                projectView: siteStyleDefaults.projectView,
                projectMedia: siteStyleDefaults.projectMedia,
                countdownView: siteStyleDefaults.countdownView,
              })
            }
          >
            <p className="text-xs text-ink-soft">
              Drag :: or use the arrows to change the order. Untick Show to hide a section. Click a name to open
              the settings of that section: its own options (size, layout...), its space (added to the Spacing
              choice above), its background and its divider line. A section with nothing to show stays hidden
              anyway. The hero is always first and the footer always last.
            </p>
            <SectionControls
              order={draft.style.order}
              sections={sec}
              selected={picked}
              extra={{ projects: projectControls, countdown: countdownControls }}
              onOrder={(order) => setStyle({ order })}
              onSection={setSection}
            />
          </Section>
          <Section
            title="Colors"
            open
            onReset={() =>
              setStyle({
                colorBg: siteStyleDefaults.colorBg,
                colorInk: siteStyleDefaults.colorInk,
                colorAccent: siteStyleDefaults.colorAccent,
                colorBand: siteStyleDefaults.colorBand,
                colorTertiary: siteStyleDefaults.colorTertiary,
              })
            }
          >
            <div className="grid grid-cols-3 gap-4">
              <Field label="Page" htmlFor="ui_color_bg" hint="Background of every page.">
                <input
                  id="ui_color_bg"
                  type="color"
                  value={draft.style.colorBg}
                  onChange={(e) => setStyle({ colorBg: e.target.value })}
                  className={colorInput}
                />
              </Field>
              <Field label="Text" htmlFor="ui_color_ink" hint="Text and thin lines.">
                <input
                  id="ui_color_ink"
                  type="color"
                  value={draft.style.colorInk}
                  onChange={(e) => setStyle({ colorInk: e.target.value })}
                  className={colorInput}
                />
              </Field>
              <Field label="Accent" htmlFor="ui_color_accent" hint="Numbers and the active menu item.">
                <input
                  id="ui_color_accent"
                  type="color"
                  value={draft.style.colorAccent}
                  onChange={(e) => setStyle({ colorAccent: e.target.value })}
                  className={colorInput}
                />
              </Field>
              <Field label="Secondary" htmlFor="ui_color_band" hint="Full-width bands: news bar, GitHub, footer bottom.">
                <input
                  id="ui_color_band"
                  type="color"
                  value={draft.style.colorBand}
                  onChange={(e) => setStyle({ colorBand: e.target.value })}
                  className={colorInput}
                />
              </Field>
              <Field label="Tertiary" htmlFor="ui_color_tertiary" hint="Top part of the footer.">
                <input
                  id="ui_color_tertiary"
                  type="color"
                  value={draft.style.colorTertiary}
                  onChange={(e) => setStyle({ colorTertiary: e.target.value })}
                  className={colorInput}
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Font"
            onReset={() => setDraft((d) => ({ ...d, fontHeading: defaultFont, fontBody: defaultFont }))}
          >
            <FontPicker
              legend="Heading font"
              value={draft.fontHeading}
              onChange={(id) => set("fontHeading", id)}
            />
            <FontPicker legend="Body font" value={draft.fontBody} onChange={(id) => set("fontBody", id)} />
          </Section>

          <Section
            title="Motion"
            onReset={() => setStyle({ motion: siteStyleDefaults.motion })}
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {motionModes.map((m) => (
                  <label key={m} className={pill}>
                    <input
                      type="radio"
                      value={m}
                      checked={draft.style.motion === m}
                      onChange={() => setStyle({ motion: m as MotionMode })}
                      className="sr-only"
                    />
                    {motionLabels[m]}
                  </label>
                ))}
              </div>
              <p className="text-xs text-ink-soft">{motionHints[draft.style.motion]}</p>
            </div>
          </Section>

          <Section
            title="Hero"
            onReset={() =>
              setStyle({
                heroSeconds: siteStyleDefaults.heroSeconds,
                heroOverlay: siteStyleDefaults.heroOverlay,
                heroZoom: siteStyleDefaults.heroZoom,
                indexZoom: siteStyleDefaults.indexZoom,
                heroGray: siteStyleDefaults.heroGray,
              })
            }
          >
            <Slider
              id="ui_hero_seconds"
              label="Time per slide"
              unit=" s"
              value={draft.style.heroSeconds}
              range={styleRanges.seconds}
              hint="Also the time per line of the news bar."
              onChange={(heroSeconds) => setStyle({ heroSeconds })}
            />
            <Slider
              id="ui_hero_overlay"
              label="Dark overlay"
              unit="%"
              value={draft.style.heroOverlay}
              range={styleRanges.heroOverlay}
              hint="Darkens the media so the caption stays readable."
              onChange={(heroOverlay) => setStyle({ heroOverlay })}
            />
            <Slider
              id="ui_hero_zoom"
              label="Scroll zoom"
              unit="%"
              value={draft.style.heroZoom}
              range={styleRanges.heroZoom}
              hint="How far the hero media zooms in while you scroll down. Seen in Chrome and Edge."
              onChange={(heroZoom) => setStyle({ heroZoom })}
            />
            <Slider
              id="ui_index_zoom"
              label="Link list zoom"
              unit="%"
              value={draft.style.indexZoom}
              range={styleRanges.indexZoom}
              hint="The media behind the link list is normal in the middle of the screen and zooms in this far when it moves up or down. Seen in Chrome and Edge."
              onChange={(indexZoom) => setStyle({ indexZoom })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.style.heroGray}
                onChange={(e) => setStyle({ heroGray: e.target.checked })}
                className="accent-accent"
              />
              Show the hero in black and white
            </label>
          </Section>

          <Section
            title="List and gallery"
            onReset={() =>
              setStyle({
                indexVeil: siteStyleDefaults.indexVeil,
                gallerySeconds: siteStyleDefaults.gallerySeconds,
              })
            }
          >
            <Slider
              id="ui_index_veil"
              label="List overlay"
              unit="%"
              value={draft.style.indexVeil}
              range={styleRanges.indexVeil}
              hint="How much the media behind the list is covered, so the titles stay readable."
              onChange={(indexVeil) => setStyle({ indexVeil })}
            />
            <Slider
              id="ui_gallery_seconds"
              label="Gallery time per photo"
              unit=" s"
              value={draft.style.gallerySeconds}
              range={styleRanges.seconds}
              onChange={(gallerySeconds) => setStyle({ gallerySeconds })}
            />
          </Section>

          <p className="px-5 py-4 text-xs text-ink-soft">
            Media, text and pages are set in <Link href={routes.pages} className="underline underline-offset-4">Pages</Link>.
          </p>
        </aside>

        <section
          aria-label="Preview"
          className="order-1 h-[45dvh] shrink-0 bg-highlight p-3 lg:order-2 lg:h-auto lg:min-w-0 lg:flex-1 lg:shrink lg:p-6"
        >
          {/* translateZ(0) keeps everything of the page inside this box. */}
          <div
            ref={frameRef}
            className="relative mx-auto h-full overflow-hidden border border-line [transform:translateZ(0)]"
            style={{ maxWidth: device === "phone" ? phoneWidth : undefined }}
          >
            <div
              ref={scrollRef}
              className="absolute inset-0 overflow-y-auto"
              onClickCapture={previewClick}
              onMouseMove={hoverMove}
              onMouseLeave={hoverLeave}
              onScroll={paint}
            >
              <SiteFrame
                fonts={{ heading: draft.fontHeading, body: draft.fontBody }}
                style={draft.style}
                viewportHeight={device === "phone" ? "620px" : "560px"}
                mode={previewMode}
              >
                <NewsBar items={site.news} seconds={draft.style.heroSeconds} autoplay={autoplay} showClock={site.showClock} />
                <SiteHeader brand={profile.username} home={base} items={nav} overlay />
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
                <SiteFooter
                  brand={profile.username}
                  note={site.footerNote}
                  socials={socials}
                  contactEmail={site.contactEmail}
                  whatsapp={site.whatsapp}
                  nav={nav}
                  modeControl={{ value: previewMode, onChange: setPreviewMode }}
                  news={{
                    items: site.news,
                    seconds: draft.style.heroSeconds,
                    autoplay,
                    showClock: site.showClock,
                    countdown: null,
                  }}
                />
              </SiteFrame>
            </div>
            <div
              ref={pickBox}
              aria-hidden
              className="pointer-events-none absolute z-10 hidden border-2 border-accent"
            />
            <div
              ref={hoverBox}
              aria-hidden
              className="pointer-events-none absolute z-20 hidden border border-accent bg-accent/15"
            >
              <span
                ref={hoverTag}
                className="absolute left-0 top-0 bg-accent px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-ink"
              />
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}