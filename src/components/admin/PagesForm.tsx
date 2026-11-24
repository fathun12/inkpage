import type { ReactNode } from "react";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { PagesTab } from "@/config/item-data";
import { mediaConfig } from "@/config/media";
import { siteLimits, type PageText, type SiteSettings } from "@/config/site-content";
import type { FormAction } from "@/types/form";
import type { VideoSignAction } from "@/types/media";
import { SiteMediaInput } from "./SiteMediaInput";

type Base = { action: FormAction };
type WithMedia = Base & { sign: VideoSignAction; site: SiteSettings };

const mediaHint = `JPG, PNG, WebP, GIF, MP4 or WebM, up to ${mediaConfig.siteMedia.maxMb} MB each, kept in original quality. A file uploads as soon as you pick it, then press Save. Under each file you can write a credit or source: it shows small at the bottom right of the media.`;

function Section({
  title,
  hint,
  open,
  children,
}: {
  title: string;
  hint?: string;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={open} className="ink-border rounded-md bg-surface">
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 px-4 py-3">
        <span className="font-display text-lg font-bold">{title}</span>
        {hint && <span className="font-mono text-xs text-ink-soft">{hint}</span>}
      </summary>
      <div className="flex flex-col gap-5 border-t border-line p-4">{children}</div>
    </details>
  );
}

// Every tab form says which tab it is, so the server saves only that tab and keeps the rest.
function TabForm({ tab, action, label, children }: { tab: PagesTab; action: FormAction; label: string; children: ReactNode }) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="tab" value={tab} />
      {children}
      <div>
        <SubmitButton variant="accent">{label}</SubmitButton>
      </div>
    </form>
  );
}

export function HomeForm({ action, sign, site }: WithMedia) {
  return (
    <TabForm tab="home" action={action} label="Save Home">
      <Section title="News bar" hint="Short lines that slide at the very top." open>
        {Array.from({ length: siteLimits.news }, (_, i) => site.news[i]).map((item, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-2">
            <Field label={`Line ${i + 1}`} htmlFor={`news_text_${i}`} hint={i === 0 ? "Leave a row empty to skip it." : undefined}>
              <Input id={`news_text_${i}`} name={`news_text_${i}`} defaultValue={item?.text ?? ""} maxLength={siteLimits.newsText} />
            </Field>
            <Field label="Link" htmlFor={`news_url_${i}`} hint={i === 0 ? "Optional." : undefined}>
              <Input id={`news_url_${i}`} name={`news_url_${i}`} type="url" placeholder="https://" defaultValue={item?.url ?? ""} />
            </Field>
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="show_clock" defaultChecked={site.showClock} className="accent-accent" />
          Show a clock at the left of the bar (Jakarta time, 24 hours)
        </label>
      </Section>

      <Section title="Intro" hint="Greeting, date and big sentences under the hero.">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="intro_enabled" defaultChecked={site.intro.enabled} className="accent-accent" />
          Show the intro (it needs at least one big sentence)
        </label>
        {Array.from({ length: siteLimits.introHeadlines }, (_, i) => site.intro.headlines[i]).map((line, i) => (
          <Field
            key={i}
            label={`Big sentence ${i + 1}`}
            htmlFor={`intro_headline_${i}`}
            hint={i === 0 ? "With more than one, they swap by fading. Leave a row empty to skip it." : undefined}
          >
            <Input id={`intro_headline_${i}`} name={`intro_headline_${i}`} defaultValue={line ?? ""} maxLength={siteLimits.introHeadline} />
          </Field>
        ))}
        <Field label="Note after the date" htmlFor="intro_note" hint="Optional. Shown after &quot;Today is Tuesday, November 24.&quot;">
          <Input id="intro_note" name="intro_note" defaultValue={site.intro.note ?? ""} maxLength={siteLimits.introNote} />
        </Field>
        <p className="text-xs text-ink-soft">
          The greeting (good morning, afternoon, evening) and the date are automatic. They follow each visitor&apos;s clock.
        </p>
      </Section>

      <Section title="Hero" hint="The big media at the top of Home.">
        <Field label="Caption" htmlFor="hero_caption" hint="Optional. Empty uses your bio.">
          <Input id="hero_caption" name="hero_caption" defaultValue={site.heroCaption ?? ""} maxLength={siteLimits.caption} />
        </Field>
        <Field label={`Slides (up to ${siteLimits.hero})`} htmlFor="site-hero" hint={`Several items slide one after another. ${mediaHint}`}>
          <SiteMediaInput slot="hero" current={site.hero} max={siteLimits.hero} sign={sign} credits={site.credits} />
        </Field>
      </Section>

      <Section title="Section titles" hint="Small labels above the sections of Home. Empty = no label.">
        <Field label="Writing" htmlFor="cards_title" hint="Above the sliding Writing cards. Empty = the title of the Writing page.">
          <Input id="cards_title" name="cards_title" defaultValue={site.cardsTitle ?? ""} maxLength={siteLimits.title} />
        </Field>
        <Field label="Showcase" htmlFor="showcase_title" hint="Above the Showcase section.">
          <Input id="showcase_title" name="showcase_title" defaultValue={site.showcaseTitle ?? ""} maxLength={siteLimits.title} />
        </Field>
        <p className="text-xs text-ink-soft">The label of the Projects section is the title of the Projects page (Projects tab).</p>
      </Section>

      <Section title="Biblia" hint="Book covers from your Biblia library, shown below Projects.">
        <Field
          label="Biblia address"
          htmlFor="biblia_url"
          hint="For example https://biblia-gilt-eight.vercel.app . Empty = no Biblia section and no menu item."
        >
          <Input id="biblia_url" name="biblia_url" type="url" placeholder="https://" defaultValue={site.bibliaUrl ?? ""} />
        </Field>
        <Field label="Label" htmlFor="biblia_title" hint="Optional. Default: Biblia. Also the name in the menu.">
          <Input id="biblia_title" name="biblia_title" defaultValue={site.bibliaTitle ?? ""} maxLength={siteLimits.title} />
        </Field>
        <Field
          label="Text under the title"
          htmlFor="biblia_intro"
          hint="Shown at the top of the Biblia page. Empty = the default text. Up to 400 characters."
        >
          <Textarea id="biblia_intro" name="biblia_intro" defaultValue={site.bibliaIntro ?? ""} rows={3} maxLength={siteLimits.intro} />
        </Field>
      </Section>

      <Section title="Design projects" hint="Random cards from your House Showcase website, shown below Showcase.">
        <Field
          label="House Showcase address"
          htmlFor="designs_url"
          hint="For example https://house-showcase-six.vercel.app . Empty = no design section."
        >
          <Input id="designs_url" name="designs_url" type="url" placeholder="https://" defaultValue={site.designsUrl ?? ""} />
        </Field>
        <Field label="Label" htmlFor="designs_title" hint="Optional. Default: Design.">
          <Input id="designs_title" name="designs_title" defaultValue={site.designsTitle ?? ""} maxLength={siteLimits.title} />
        </Field>
      </Section>

      <Section title="GitHub" hint="Your profile, newest repositories and activity, shown below Biblia.">
        <Field label="GitHub username" htmlFor="github_user" hint="For example fathun12 . Empty = no GitHub section.">
          <Input id="github_user" name="github_user" defaultValue={site.githubUser ?? ""} maxLength={80} />
        </Field>
        <Field label="Label" htmlFor="github_title" hint="Optional. Default: GitHub.">
          <Input id="github_title" name="github_title" defaultValue={site.githubTitle ?? ""} maxLength={siteLimits.title} />
        </Field>
      </Section>

      <Section title="Music" hint="A small player in the bottom left corner of every page.">
        <Field
          label="YouTube or Spotify link"
          htmlFor="music_url"
          hint="A video, a song or a playlist. Empty = no player. A playlist plays one song after another."
        >
          <Input id="music_url" name="music_url" type="url" placeholder="https://" defaultValue={site.musicUrl ?? ""} />
        </Field>
        <p className="text-xs text-ink-soft">
          Visitors press play themselves: browsers block sound that starts alone. YouTube plays in full for everyone.
          Spotify plays full songs only for visitors logged in to Spotify. Others hear a 30 second preview.
        </p>
      </Section>

      <Section title="Link list" hint="The list of links over a big media.">
        <Field label="Media behind the list" htmlFor="site-index" hint={`One item. ${mediaHint}`}>
          <SiteMediaInput slot="index" current={site.indexMedia ? [site.indexMedia] : []} max={1} sign={sign} credits={site.credits} />
        </Field>
        <p className="text-xs text-ink-soft">
          The links themselves are added on the Links screen, with &quot;Show on page&quot; set to Home.
        </p>
      </Section>

      <Section title="Gallery" hint="Full width above the footer. Photos fade in and out. No title.">
        <Field label={`Media (up to ${siteLimits.gallery})`} htmlFor="site-gallery" hint={mediaHint}>
          <SiteMediaInput slot="gallery" current={site.gallery} max={siteLimits.gallery} sign={sign} credits={site.credits} />
        </Field>
      </Section>
    </TabForm>
  );
}

// Title and text of the Projects page or the Writing page. The items are right below this form.
export function PageTextForm({
  tab,
  name,
  value,
  action,
}: Base & { tab: "projects" | "writing"; name: string; value: PageText }) {
  return (
    <TabForm tab={tab} action={action} label={`Save ${name} page text`}>
      <Section title={`${name} page`} hint="Title and text at the top of the page." open>
        <Field label="Title" htmlFor={`${tab}_title`} hint={`Optional. Default: ${name}.`}>
          <Input id={`${tab}_title`} name={`${tab}_title`} defaultValue={value.title ?? ""} maxLength={siteLimits.title} />
        </Field>
        <Field label="Text under the title" htmlFor={`${tab}_intro`} hint="Optional.">
          <Textarea id={`${tab}_intro`} name={`${tab}_intro`} defaultValue={value.intro ?? ""} rows={3} maxLength={siteLimits.intro} />
        </Field>
      </Section>
    </TabForm>
  );
}

export function AboutForm({ action, sign, site }: WithMedia) {
  return (
    <TabForm tab="about" action={action} label="Save About">
      <Section title="About page" hint="Appears in the menu once it has text or a photo." open>
        <Field label="Title" htmlFor="about_title" hint="Optional. Default: About.">
          <Input id="about_title" name="about_title" defaultValue={site.about.title ?? ""} maxLength={siteLimits.title} />
        </Field>
        <Field label="Text" htmlFor="about_body">
          <Textarea id="about_body" name="about_body" defaultValue={site.about.body ?? ""} rows={8} maxLength={siteLimits.aboutBody} />
        </Field>
        <Field label="Photo" htmlFor="site-about" hint={`Optional. ${mediaHint}`}>
          <SiteMediaInput slot="about" current={site.about.photo ? [site.about.photo] : []} max={1} sign={sign} credits={site.credits} />
        </Field>
      </Section>
    </TabForm>
  );
}

export function FooterForm({ action, site }: Base & { site: SiteSettings }) {
  return (
    <TabForm tab="footer" action={action} label="Save Footer">
      <Section title="Footer" hint="Social links come from your Social links block under Links." open>
        <Field label="Note" htmlFor="footer_note" hint="Optional. For example an email address or a short line.">
          <Textarea id="footer_note" name="footer_note" defaultValue={site.footerNote ?? ""} rows={2} maxLength={siteLimits.footerNote} />
        </Field>
      </Section>
    </TabForm>
  );
}