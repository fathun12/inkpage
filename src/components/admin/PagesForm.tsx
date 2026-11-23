import type { ReactNode } from "react";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { mediaConfig } from "@/config/media";
import { siteLimits, type PageText, type SiteSettings } from "@/config/site-content";
import type { FormAction } from "@/types/form";
import type { VideoSignAction } from "@/types/media";
import { SiteMediaInput } from "./SiteMediaInput";

type Props = { action: FormAction; sign: VideoSignAction; site: SiteSettings };

const mediaHint = `JPG, PNG, WebP, GIF, MP4 or WebM, up to ${mediaConfig.siteMedia.maxMb} MB each, kept in original quality. A file uploads as soon as you pick it, then press Save changes.`;

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

function PageTextFields({ prefix, name, value }: { prefix: "projects" | "writing"; name: string; value: PageText }) {
  return (
    <>
      <Field label="Title" htmlFor={`${prefix}_title`} hint={`Optional. Default: ${name}.`}>
        <Input id={`${prefix}_title`} name={`${prefix}_title`} defaultValue={value.title ?? ""} maxLength={siteLimits.title} />
      </Field>
      <Field label="Text under the title" htmlFor={`${prefix}_intro`} hint="Optional.">
        <Textarea id={`${prefix}_intro`} name={`${prefix}_intro`} defaultValue={value.intro ?? ""} rows={3} maxLength={siteLimits.intro} />
      </Field>
      <p className="text-xs text-ink-soft">
        What shows on this page is set under Links, with &quot;Show on page&quot;. The page appears in the menu once it has an item.
      </p>
    </>
  );
}

export function PagesForm({ action, sign, site }: Props) {
  return (
    <form action={action} className="flex flex-col gap-4">
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
      </Section>

      <Section title="Hero" hint="The big media at the top of Home." open>
        <Field label="Caption" htmlFor="hero_caption" hint="Optional. Empty uses your bio.">
          <Input id="hero_caption" name="hero_caption" defaultValue={site.heroCaption ?? ""} maxLength={siteLimits.caption} />
        </Field>
        <Field label={`Slides (up to ${siteLimits.hero})`} htmlFor="site-hero" hint={`Several items slide one after another. ${mediaHint}`}>
          <SiteMediaInput slot="hero" current={site.hero} max={siteLimits.hero} sign={sign} />
        </Field>
      </Section>

      <Section title="List background" hint="Media behind the list of projects, articles and downloads on Home.">
        <Field label="Media" htmlFor="site-index" hint={`One item. Add the list items under Links. ${mediaHint}`}>
          <SiteMediaInput slot="index" current={site.indexMedia ? [site.indexMedia] : []} max={1} sign={sign} />
        </Field>
      </Section>

      <Section title="Gallery" hint="Full width above the footer. Photos fade in and out. No title.">
        <Field label={`Media (up to ${siteLimits.gallery})`} htmlFor="site-gallery" hint={mediaHint}>
          <SiteMediaInput slot="gallery" current={site.gallery} max={siteLimits.gallery} sign={sign} />
        </Field>
      </Section>

      <Section title="Projects page">
        <PageTextFields prefix="projects" name="Projects" value={site.projects} />
      </Section>

      <Section title="Writing page">
        <PageTextFields prefix="writing" name="Writing" value={site.writing} />
      </Section>

      <Section title="About page" hint="Appears in the menu once it has text or a photo.">
        <Field label="Title" htmlFor="about_title" hint="Optional. Default: About.">
          <Input id="about_title" name="about_title" defaultValue={site.about.title ?? ""} maxLength={siteLimits.title} />
        </Field>
        <Field label="Text" htmlFor="about_body">
          <Textarea id="about_body" name="about_body" defaultValue={site.about.body ?? ""} rows={8} maxLength={siteLimits.aboutBody} />
        </Field>
        <Field label="Photo" htmlFor="site-about" hint={`Optional. ${mediaHint}`}>
          <SiteMediaInput slot="about" current={site.about.photo ? [site.about.photo] : []} max={1} sign={sign} />
        </Field>
      </Section>

      <Section title="Footer" hint="Social links come from your Social links block under Links.">
        <Field label="Note" htmlFor="footer_note" hint="Optional. For example an email address or a short line.">
          <Textarea id="footer_note" name="footer_note" defaultValue={site.footerNote ?? ""} rows={2} maxLength={siteLimits.footerNote} />
        </Field>
      </Section>

      <div>
        <SubmitButton variant="accent">Save changes</SubmitButton>
      </div>
    </form>
  );
}