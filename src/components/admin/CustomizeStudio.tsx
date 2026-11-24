"use client";

import Link from "next/link";
import { useState, type MouseEvent, type ReactNode } from "react";
import { CardSlider } from "@/components/site/CardSlider";
import { FadeGallery } from "@/components/site/FadeGallery";
import { Hero } from "@/components/site/Hero";
import { Intro } from "@/components/site/Intro";
import { resolveGreetings } from "@/config/intro";
import { HomeProjects } from "@/components/site/HomeProjects";
import { HomeShowcase } from "@/components/site/HomeShowcase";
import { IndexSection } from "@/components/site/IndexSection";
import { NewsBar } from "@/components/site/NewsBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteFrame } from "@/components/site/SiteFrame";
import { SiteHeader } from "@/components/site/SiteHeader";
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
  cards: Block[];
  socials: SocialItem[];
  nav: { label: string; href: string }[];
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
  title,
  open,
  onReset,
  children,
}: {
  title: string;
  open?: boolean;
  onReset?: () => void;
  children: ReactNode;
}) {
  return (
    <details open={open} className="group border-b border-line">
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
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  range: { min: number; max: number; step: number };
  unit?: string;
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={`${label}: ${value}${unit}`} htmlFor={id} hint={hint}>
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
  cards,
  socials,
  nav,
  notice,
}: Props) {
  const [initial] = useState<Draft>(() => ({
    fontHeading: fonts.heading,
    fontBody: fonts.body,
    style,
  }));
  const [draft, setDraft] = useState<Draft>(initial);
  const [device, setDevice] = useState<"phone" | "desktop">("phone");

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function setStyle(patch: Partial<SiteStyle>) {
    setDraft((d) => ({ ...d, style: { ...d.style, ...patch } }));
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const previewRows = rows.length > 0 ? rows : sampleRows();
  const autoplay = draft.style.motion !== "off";
  const base = routes.profile(profile.username);

  // Links in the preview must not leave the studio.
  function stopLinks(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a")) event.preventDefault();
  }

  return (
    <form action={action} className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-bg">
      {/* The sidebar controls have no name. These hidden inputs are what the server receives. */}
      <input type="hidden" name="site_color_bg" value={draft.style.colorBg} />
      <input type="hidden" name="site_color_ink" value={draft.style.colorInk} />
      <input type="hidden" name="site_color_accent" value={draft.style.colorAccent} />
      <input type="hidden" name="font_heading" value={draft.fontHeading} />
      <input type="hidden" name="font_body" value={draft.fontBody} />
      <input type="hidden" name="site_motion" value={draft.style.motion} />
      <input type="hidden" name="site_hero_seconds" value={draft.style.heroSeconds} />
      <input type="hidden" name="site_gallery_seconds" value={draft.style.gallerySeconds} />
      <input type="hidden" name="site_hero_overlay" value={draft.style.heroOverlay} />
      <input type="hidden" name="site_index_veil" value={draft.style.indexVeil} />
      <input type="hidden" name="site_hero_zoom" value={draft.style.heroZoom} />
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
            title="Colors"
            open
            onReset={() =>
              setStyle({
                colorBg: siteStyleDefaults.colorBg,
                colorInk: siteStyleDefaults.colorInk,
                colorAccent: siteStyleDefaults.colorAccent,
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
            className="relative mx-auto h-full overflow-hidden border border-line [transform:translateZ(0)]"
            style={{ maxWidth: device === "phone" ? phoneWidth : undefined }}
          >
            <div className="absolute inset-0 overflow-y-auto" onClickCapture={stopLinks}>
              <SiteFrame
                fonts={{ heading: draft.fontHeading, body: draft.fontBody }}
                style={draft.style}
                viewportHeight={device === "phone" ? "620px" : "560px"}
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
                </Hero>
                {cards.length > 0 && (
                  <CardSlider
                    items={cards}
                    title={site.cardsTitle ?? site.writing.title ?? "Writing"}
                    seconds={draft.style.heroSeconds}
                    autoplay={autoplay}
                  />
                )}
                <HomeProjects items={projects} title={site.projects.title ?? "Projects"} />
                <IndexSection
                  blocks={previewRows}
                  mediaUrl={media.indexMedia}
                  credit={creditOf(site.credits, media.indexMedia)}
                />
                <HomeShowcase items={showcase} title={site.showcaseTitle ?? "Showcase"} />
                <FadeGallery
                  images={media.gallery}
                  seconds={draft.style.gallerySeconds}
                  autoplay={autoplay}
                  credits={site.credits}
                />
                <SiteFooter brand={profile.username} note={site.footerNote} socials={socials} />
              </SiteFrame>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}