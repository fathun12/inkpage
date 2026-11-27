"use client";

import { GithubControls } from "@/components/admin/studio/GithubControls";
import { LinksControls } from "@/components/admin/studio/LinksControls";
import { VisitControls } from "@/components/admin/studio/VisitControls";
import { CountdownControls } from "@/components/admin/studio/CountdownControls";
import { ShopControls } from "@/components/admin/studio/ShopControls";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AboutControls } from "@/components/admin/studio/AboutControls";
import { SectionControls } from "@/components/admin/studio/SectionControls";
import type { AboutSectionId } from "@/config/about-style";
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
import {
  heroAnimLabels,
  heroAnims,
  heroBlockAnims,
  heroItemHints,
  heroItemIds,
  heroItemLabels,
  heroMotionDefaults,
  heroMotionRanges,
  type HeroItemId,
  type HeroItemMotion,
} from "@/config/intro";
import {
  countdownViewHints,
  countdownViewLabels,
  countdownViews,
  densityHints,
  densityLabels,
  densityModes,
  designIntroSizeLabels,
  designIntroSizes,
  designModeHints,
  designModeLabels,
  designModes,
  designSizeHints,
  designSizeLabels,
  designSizes,
  designTextFonts,
  designTitleAlignHints,
  designTitleAlignLabels,
  designTitleAligns,
  designTitleSizeLabels,
  designTitleSizes,
  designViewHints,
  designViewLabels,
  designViews,
  designWideViewHints,
  designWideViewLabels,
  designWideViews,
  projectSizeHints,
  projectSizeLabels,
  projectSizes,
  projectViewHints,
  projectViewLabels,
  projectViews,
  writingSizeHints,
  writingSizeLabels,
  writingSizes,
  writingViewHints,
  writingViewLabels,
  writingViews,
  writingWideViewHints,
  writingWideViewLabels,
  writingWideViews,
  articleViewHints,
  articleViewLabels,
  articleViews,
  articleWideViewHints,
  articleWideViewLabels,
  articleWideViews,
  projectWideViewHints,
  projectWideViewLabels,
  projectWideViews,
  bibliaSizeHints,
  bibliaViewHints,
  bibliaViewLabels,
  bibliaViews,
  bibliaWideViewHints,
  bibliaWideViewLabels,
  bibliaWideViews,
  showcaseSizeHints,
  showcaseSizeLabels,
  showcaseSizes,
  showcaseViewHints,
  showcaseViewLabels,
  showcaseViews,
  showcaseWideViewHints,
  showcaseWideViewLabels,
  showcaseWideViews,
  stackRatioHints,
  stackRatioLabels,
  stackRatios,
  type DesignFont,
  type SectionId,
  type SectionSetting,
} from "@/config/layout";
import { previewMessages, previewPath } from "@/config/preview";
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
import { cn } from "@/lib/utils";
import type { FormAction } from "@/types/form";

type Props = {
  action: FormAction;
  username: string;
  fonts: FontPair;
  style: SiteStyle;
  notice?: ReactNode;
};

type Draft = {
  fontHeading: FontId;
  fontBody: FontId;
  style: SiteStyle;
};

// Width (px) of the preview in Phone mode. Change this one number to make it wider or narrower.
const phoneWidth = 480;

// The pages whose settings the sidebar can show. Each page has its own settings.
const studioPages = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
] as const;
type StudioPage = (typeof studioPages)[number]["id"];

const pill =
  "ink-border cursor-pointer rounded-full px-3 py-1.5 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";
const colorInput = "ink-border h-10 w-20 cursor-pointer rounded-md bg-surface p-1";
const resetButton =
  "self-start font-mono text-xs uppercase tracking-widest text-ink-soft underline underline-offset-4 hover:text-ink";

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

// A short list of fonts for one piece of text. Default keeps the font the text already has.
function TextFontSelect({
  id,
  label,
  value,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: DesignFont;
  hint?: string;
  onChange: (value: DesignFont) => void;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as DesignFont)}
        className="ink-border w-full rounded-md bg-surface px-3 py-2 text-sm"
      >
        {designTextFonts.map((f) => (
          <option key={f} value={f}>
            {f === "default" ? "Default" : fontChoices[f].label}
          </option>
        ))}
      </select>
    </Field>
  );
}

// The entrance settings of one item of the top of Home (hero, name, tabs, intro lines, caption, contents).
function HeroMotionItem({
  id,
  value,
  onChange,
}: {
  id: HeroItemId;
  value: HeroItemMotion;
  onChange: (value: HeroItemMotion) => void;
}) {
  const d = heroMotionDefaults[id];
  const block = id === "hero";
  const anims = block ? heroBlockAnims : heroAnims;
  const changed = JSON.stringify(value) !== JSON.stringify(d);
  const patch = (p: Partial<HeroItemMotion>) => onChange({ ...value, ...p });
  return (
    <details className="ink-border rounded-md">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm [&::-webkit-details-marker]:hidden">
        <span>{heroItemLabels[id]}</span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
          {changed ? "Changed" : "Original"}
        </span>
      </summary>
      <div className="flex flex-col gap-4 px-3 pb-3">
        <p className="text-xs text-ink-soft">{heroItemHints[id]}</p>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Animation</span>
          <div className="flex flex-wrap gap-2">
            {anims.map((a) => (
              <label key={a} className={pill}>
                <input
                  type="radio"
                  value={a}
                  checked={value.anim === a}
                  onChange={() => patch({ anim: a })}
                  className="sr-only"
                />
                {heroAnimLabels[a]}
              </label>
            ))}
          </div>
        </div>
        <Slider
          id={`ui_hm_${id}_ms`}
          label="Time"
          unit=" ms"
          value={value.ms}
          range={heroMotionRanges.ms}
          hint="How long the motion takes."
          onChange={(ms) => patch({ ms })}
        />
        {!block && (
          <>
            <Slider
              id={`ui_hm_${id}_start`}
              label="Starts when the hero is at"
              unit="%"
              value={value.start}
              range={heroMotionRanges.start}
              hint="0% = the hero has just begun to fall, 100% = it has landed."
              onChange={(start) => patch({ start })}
            />
            <Slider
              id={`ui_hm_${id}_wait`}
              label="Then wait"
              unit=" ms"
              value={value.wait}
              range={heroMotionRanges.wait}
              onChange={(wait) => patch({ wait })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={value.bounce}
                onChange={(e) => patch({ bounce: e.target.checked })}
                className="accent-accent"
              />
              Bouncy (a little spring at the end)
            </label>
          </>
        )}
        {changed && (
          <button type="button" onClick={() => onChange(d)} className={resetButton}>
            Reset {heroItemLabels[id].toLowerCase()}
          </button>
        )}
      </div>
    </details>
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

export function CustomizeStudio({ action, username, fonts, style, notice }: Props) {
  const [initial] = useState<Draft>(() => ({
    fontHeading: fonts.heading,
    fontBody: fonts.body,
    style,
  }));
  const [draft, setDraft] = useState<Draft>(initial);
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  // The section selected by a click in the preview (the Sections panel opens its row).
  const [picked, setPicked] = useState<SectionId | null>(null);
  // True once the preview page is loaded and has said it is ready.
  const [loaded, setLoaded] = useState(false);
  // The page whose settings the sidebar shows.
  const [page, setPage] = useState<StudioPage>("home");

  // The preview is the page /admin/preview in a frame. The draft is sent to it with postMessage.
  const frameRef = useRef<HTMLIFrameElement>(null);
  const draftRef = useRef(draft);
  const pageRef = useRef<StudioPage>(page);

  const send = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: previewMessages.draft, draft: draftRef.current, page: pageRef.current },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    draftRef.current = draft;
    pageRef.current = page;
    send();
  }, [draft, page, send]);

  // Selects a section: opens the Sections panel and the row of that section, and scrolls to it.
  const pick = useCallback((id: SectionId) => {
    setPicked(id);
    const panel = document.getElementById("studio-sections");
    if (panel instanceof HTMLDetailsElement) panel.open = true;
    const row = document.getElementById(`studio-row-${id}`);
    const details = row?.querySelector("details");
    if (details) details.open = true;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row?.scrollIntoView({ block: "center", behavior: calm ? "auto" : "smooth" });
  }, []);

  // Messages from the preview: it is ready (send the draft), or a section was clicked.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      const data: unknown = event.data;
      if (typeof data !== "object" || data === null) return;
      const msg = data as { type?: unknown; id?: unknown };
      if (msg.type === previewMessages.ready) {
        setLoaded(true);
        send();
      } else if (msg.type === previewMessages.pick) {
        const id = draftRef.current.style.order.find((s) => s === msg.id);
        if (id) pick(id);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [pick, send]);

  function replayEntrance() {
    frameRef.current?.contentWindow?.postMessage({ type: previewMessages.replay }, window.location.origin);
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

  function setAboutSection(id: AboutSectionId, patch: Partial<SectionSetting>) {
    setDraft((d) => ({
      ...d,
      style: {
        ...d.style,
        aboutSections: { ...d.style.aboutSections, [id]: { ...d.style.aboutSections[id], ...patch } },
      },
    }));
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const base = routes.profile(username);
  const sec = draft.style.sections;

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
  const countdownStyleRadios = (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink-soft">Layout on Home</span>
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
  const countdownControls = (
    <CountdownControls style={draft.style} onChange={setStyle}>
      {countdownStyleRadios}
    </CountdownControls>
  );
  const designWide = draft.style.designMode === "full";
  const designControls = (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Mode on Home</span>
        <div className="flex flex-wrap gap-2">
          {designModes.map((m) => (
            <label key={m} className={pill}>
              <input
                type="radio"
                value={m}
                checked={draft.style.designMode === m}
                onChange={() => setStyle({ designMode: m })}
                className="sr-only"
              />
              {designModeLabels[m]}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">{designModeHints[draft.style.designMode]}</p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Layout on Home</span>
        <div className="flex flex-wrap gap-2">
          {designWide
            ? designWideViews.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.designWideView === m}
                    onChange={() => setStyle({ designWideView: m })}
                    className="sr-only"
                  />
                  {designWideViewLabels[m]}
                </label>
              ))
            : designViews.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.designView === m}
                    onChange={() => setStyle({ designView: m })}
                    className="sr-only"
                  />
                  {designViewLabels[m]}
                </label>
              ))}
        </div>
        <p className="text-xs text-ink-soft">
          {designWide
            ? designWideViewHints[draft.style.designWideView]
            : designViewHints[draft.style.designView]}
        </p>
      </div>
      {!designWide && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size on Home</span>
          <div className="flex flex-wrap gap-2">
            {designSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.designSize === m}
                  onChange={() => setStyle({ designSize: m })}
                  className="sr-only"
                />
                {designSizeLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{designSizeHints[draft.style.designSize]}</p>
        </div>
      )}
      <Slider
        id="ui_design_media"
        label="Cover photo height"
        value={draft.style.designMedia}
        range={styleRanges.designMedia}
        format={(v) => (v === 0 ? "Auto" : `${v} rem`)}
        hint={
          designWide
            ? "Height of the big photos. Auto uses the shape that suits the layout."
            : "Height of the big photo of each project. Auto keeps the 4:3 shape."
        }
        onChange={(designMedia) => setStyle({ designMedia })}
      />
      <Slider
        id="ui_design_count"
        label="Projects shown"
        value={draft.style.designCount}
        range={styleRanges.designCount}
        hint="Picked at random from House Showcase on each visit."
        onChange={(designCount) => setStyle({ designCount })}
      />
      {designWide && (draft.style.designWideView === "stack" || draft.style.designWideView === "stackslide") && (
        <div className="flex flex-col gap-4 border-t border-line pt-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Stack photo</span>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink-soft">Ratio</span>
            <div className="flex flex-wrap gap-2">
              {stackRatios.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.designStackRatio === m}
                    onChange={() => setStyle({ designStackRatio: m })}
                    className="sr-only"
                  />
                  {stackRatioLabels[m]}
                </label>
              ))}
            </div>
            <p className="text-xs text-ink-soft">{stackRatioHints[draft.style.designStackRatio]}</p>
          </div>
          {(draft.style.designStackRatio === "wide" || draft.style.designStackRatio === "ultra") && (
            <Slider
              id="ui_design_stack_crop"
              label="Crop position"
              value={draft.style.designStackCrop}
              range={styleRanges.stackCrop}
              format={(v) => (v === 0 ? "Top" : v === 100 ? "Bottom" : v === 50 ? "Middle" : `${v}%`)}
              hint="Which part of the photo shows: Top, Middle or Bottom."
              onChange={(designStackCrop) => setStyle({ designStackCrop })}
            />
          )}
        </div>
      )}
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Title</span>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Place</span>
          <div className="flex flex-wrap gap-2">
            {designTitleAligns.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.designTitleAlign === m}
                  onChange={() => setStyle({ designTitleAlign: m })}
                  className="sr-only"
                />
                {designTitleAlignLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{designTitleAlignHints[draft.style.designTitleAlign]}</p>
        </div>
        <TextFontSelect
          id="ui_design_title_font"
          label="Font"
          value={draft.style.designTitleFont}
          hint="Default is the small label. Pick a font or a size to turn the title into a big heading."
          onChange={(designTitleFont) => setStyle({ designTitleFont })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size</span>
          <div className="flex flex-wrap gap-2">
            {designTitleSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.designTitleSize === m}
                  onChange={() => setStyle({ designTitleSize: m })}
                  className="sr-only"
                />
                {designTitleSizeLabels[m]}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Text under the title</span>
        <TextFontSelect
          id="ui_design_intro_font"
          label="Font"
          value={draft.style.designIntroFont}
          hint="Default is the font of the site."
          onChange={(designIntroFont) => setStyle({ designIntroFont })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size</span>
          <div className="flex flex-wrap gap-2">
            {designIntroSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.designIntroSize === m}
                  onChange={() => setStyle({ designIntroSize: m })}
                  className="sr-only"
                />
                {designIntroSizeLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">Auto follows the size of the title.</p>
        </div>
        <p className="text-xs text-ink-soft">
          The text itself is written in{" "}
          <Link href={routes.pages} className="underline underline-offset-4">
            Pages
          </Link>
          , Home tab, Design projects. Nothing shows until you write it.
        </p>
      </div>
    </>
  );

  const writingWide = draft.style.writingMode === "full";
  const writingStack =
    writingWide && (draft.style.writingWideView === "stack" || draft.style.writingWideView === "stackslide");
  const writingControls = (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Mode on Home</span>
        <div className="flex flex-wrap gap-2">
          {designModes.map((m) => (
            <label key={m} className={pill}>
              <input
                type="radio"
                value={m}
                checked={draft.style.writingMode === m}
                onChange={() => setStyle({ writingMode: m })}
                className="sr-only"
              />
              {designModeLabels[m]}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">{designModeHints[draft.style.writingMode]}</p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Layout on Home</span>
        <div className="flex flex-wrap gap-2">
          {writingWide
            ? writingWideViews.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.writingWideView === m}
                    onChange={() => setStyle({ writingWideView: m })}
                    className="sr-only"
                  />
                  {writingWideViewLabels[m]}
                </label>
              ))
            : writingViews.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.writingView === m}
                    onChange={() => setStyle({ writingView: m })}
                    className="sr-only"
                  />
                  {writingViewLabels[m]}
                </label>
              ))}
        </div>
        <p className="text-xs text-ink-soft">
          {writingWide
            ? writingWideViewHints[draft.style.writingWideView]
            : writingViewHints[draft.style.writingView]}
        </p>
      </div>
      {!writingWide && draft.style.writingView === "grid" && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size on Home</span>
          <div className="flex flex-wrap gap-2">
            {writingSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.writingSize === m}
                  onChange={() => setStyle({ writingSize: m })}
                  className="sr-only"
                />
                {writingSizeLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{writingSizeHints[draft.style.writingSize]}</p>
        </div>
      )}
      {writingStack && (
        <div className="flex flex-col gap-4 border-t border-line pt-4">
          <Slider
            id="ui_writing_media"
            label="Photo height"
            value={draft.style.writingMedia}
            range={styleRanges.writingMedia}
            format={(v) => (v === 0 ? "Auto" : `${v} rem`)}
            hint="Height of the photo. Auto uses 16:9, or the Ratio below."
            onChange={(writingMedia) => setStyle({ writingMedia })}
          />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink-soft">Ratio</span>
            <div className="flex flex-wrap gap-2">
              {stackRatios.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.writingStackRatio === m}
                    onChange={() => setStyle({ writingStackRatio: m })}
                    className="sr-only"
                  />
                  {stackRatioLabels[m]}
                </label>
              ))}
            </div>
            <p className="text-xs text-ink-soft">{stackRatioHints[draft.style.writingStackRatio]}</p>
          </div>
          {(draft.style.writingStackRatio === "wide" || draft.style.writingStackRatio === "ultra") && (
            <Slider
              id="ui_writing_stack_crop"
              label="Crop position"
              value={draft.style.writingStackCrop}
              range={styleRanges.stackCrop}
              format={(v) => (v === 0 ? "Top" : v === 100 ? "Bottom" : v === 50 ? "Middle" : `${v}%`)}
              hint="Which part of the photo shows: Top, Middle or Bottom."
              onChange={(writingStackCrop) => setStyle({ writingStackCrop })}
            />
          )}
        </div>
      )}
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Title place</span>
          <div className="flex flex-wrap gap-2">
            {designTitleAligns.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.writingTitleAlign === m}
                  onChange={() => setStyle({ writingTitleAlign: m })}
                  className="sr-only"
                />
                {designTitleAlignLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{designTitleAlignHints[draft.style.writingTitleAlign]}</p>
        </div>
        <TextFontSelect
          id="ui_writing_title_font"
          label="Title font"
          value={draft.style.writingTitleFont}
          hint="Default is the small label. Pick a font or a size to turn the title into a big heading."
          onChange={(writingTitleFont) => setStyle({ writingTitleFont })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Title size</span>
          <div className="flex flex-wrap gap-2">
            {designTitleSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.writingTitleSize === m}
                  onChange={() => setStyle({ writingTitleSize: m })}
                  className="sr-only"
                />
                {designTitleSizeLabels[m]}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Text under the title</span>
        <TextFontSelect
          id="ui_writing_intro_font"
          label="Font"
          value={draft.style.writingIntroFont}
          hint="Default is the font of the site. The text itself is written in Pages, tab Home, Section titles."
          onChange={(writingIntroFont) => setStyle({ writingIntroFont })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size</span>
          <div className="flex flex-wrap gap-2">
            {designIntroSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.writingIntroSize === m}
                  onChange={() => setStyle({ writingIntroSize: m })}
                  className="sr-only"
                />
                {designIntroSizeLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">Auto follows the size of the title.</p>
        </div>
      </div>
    </>
  );
  const articlesWide = draft.style.articlesMode === "full";
  const articlesStack =
    articlesWide && (draft.style.articlesWideView === "stack" || draft.style.articlesWideView === "stackslide");
  const articlesControls = (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Mode on Home</span>
        <div className="flex flex-wrap gap-2">
          {designModes.map((m) => (
            <label key={m} className={pill}>
              <input
                type="radio"
                value={m}
                checked={draft.style.articlesMode === m}
                onChange={() => setStyle({ articlesMode: m })}
                className="sr-only"
              />
              {designModeLabels[m]}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">{designModeHints[draft.style.articlesMode]}</p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Layout on Home</span>
        <div className="flex flex-wrap gap-2">
          {articlesWide
            ? articleWideViews.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.articlesWideView === m}
                    onChange={() => setStyle({ articlesWideView: m })}
                    className="sr-only"
                  />
                  {articleWideViewLabels[m]}
                </label>
              ))
            : articleViews.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.articlesView === m}
                    onChange={() => setStyle({ articlesView: m })}
                    className="sr-only"
                  />
                  {articleViewLabels[m]}
                </label>
              ))}
        </div>
        <p className="text-xs text-ink-soft">
          {articlesWide
            ? articleWideViewHints[draft.style.articlesWideView]
            : articleViewHints[draft.style.articlesView]}
        </p>
      </div>
      {!articlesWide && draft.style.articlesView === "grid" && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size on Home</span>
          <div className="flex flex-wrap gap-2">
            {writingSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.articlesSize === m}
                  onChange={() => setStyle({ articlesSize: m })}
                  className="sr-only"
                />
                {writingSizeLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{writingSizeHints[draft.style.articlesSize]}</p>
        </div>
      )}
      {articlesStack && (
        <div className="flex flex-col gap-4 border-t border-line pt-4">
          <Slider
            id="ui_articles_media"
            label="Photo height"
            value={draft.style.articlesMedia}
            range={styleRanges.articlesMedia}
            format={(v) => (v === 0 ? "Auto" : `${v} rem`)}
            hint="Height of the photo. Auto uses 16:9, or the Ratio below."
            onChange={(articlesMedia) => setStyle({ articlesMedia })}
          />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink-soft">Ratio</span>
            <div className="flex flex-wrap gap-2">
              {stackRatios.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.articlesStackRatio === m}
                    onChange={() => setStyle({ articlesStackRatio: m })}
                    className="sr-only"
                  />
                  {stackRatioLabels[m]}
                </label>
              ))}
            </div>
            <p className="text-xs text-ink-soft">{stackRatioHints[draft.style.articlesStackRatio]}</p>
          </div>
          {(draft.style.articlesStackRatio === "wide" || draft.style.articlesStackRatio === "ultra") && (
            <Slider
              id="ui_articles_stack_crop"
              label="Crop position"
              value={draft.style.articlesStackCrop}
              range={styleRanges.stackCrop}
              format={(v) => (v === 0 ? "Top" : v === 100 ? "Bottom" : v === 50 ? "Middle" : `${v}%`)}
              hint="Which part of the photo shows: Top, Middle or Bottom."
              onChange={(articlesStackCrop) => setStyle({ articlesStackCrop })}
            />
          )}
        </div>
      )}
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Title place</span>
          <div className="flex flex-wrap gap-2">
            {designTitleAligns.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.articlesTitleAlign === m}
                  onChange={() => setStyle({ articlesTitleAlign: m })}
                  className="sr-only"
                />
                {designTitleAlignLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{designTitleAlignHints[draft.style.articlesTitleAlign]}</p>
        </div>
        <TextFontSelect
          id="ui_articles_title_font"
          label="Title font"
          value={draft.style.articlesTitleFont}
          hint="Default is the small label. Pick a font or a size to turn the title into a big heading."
          onChange={(articlesTitleFont) => setStyle({ articlesTitleFont })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Title size</span>
          <div className="flex flex-wrap gap-2">
            {designTitleSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.articlesTitleSize === m}
                  onChange={() => setStyle({ articlesTitleSize: m })}
                  className="sr-only"
                />
                {designTitleSizeLabels[m]}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Text under the title</span>
        <TextFontSelect
          id="ui_articles_intro_font"
          label="Font"
          value={draft.style.articlesIntroFont}
          hint="Default is the font of the site. The text itself is written in Pages, tab Home, Section titles."
          onChange={(articlesIntroFont) => setStyle({ articlesIntroFont })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size</span>
          <div className="flex flex-wrap gap-2">
            {designIntroSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.articlesIntroSize === m}
                  onChange={() => setStyle({ articlesIntroSize: m })}
                  className="sr-only"
                />
                {designIntroSizeLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">Auto follows the size of the title.</p>
        </div>
      </div>
    </>
  );
  const projectWide = draft.style.projectMode === "full";
  const projectStack =
    projectWide && (draft.style.projectWideView === "stack" || draft.style.projectWideView === "stackslide");
  const projectsAll = (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Mode on Home</span>
        <div className="flex flex-wrap gap-2">
          {designModes.map((m) => (
            <label key={m} className={pill}>
              <input
                type="radio"
                value={m}
                checked={draft.style.projectMode === m}
                onChange={() => setStyle({ projectMode: m })}
                className="sr-only"
              />
              {designModeLabels[m]}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">{designModeHints[draft.style.projectMode]}</p>
      </div>
      {projectWide && (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink-soft">Layout on Home</span>
            <div className="flex flex-wrap gap-2">
              {projectWideViews.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.projectWideView === m}
                    onChange={() => setStyle({ projectWideView: m })}
                    className="sr-only"
                  />
                  {projectWideViewLabels[m]}
                </label>
              ))}
            </div>
            <p className="text-xs text-ink-soft">{projectWideViewHints[draft.style.projectWideView]}</p>
          </div>
          <Slider
            id="ui_project_media_wide"
            label="Photo height"
            value={draft.style.projectMedia}
            range={styleRanges.projectMedia}
            format={(v) => (v === 0 ? "Auto" : `${v} rem`)}
            hint="Height of the big photos. Auto uses the shape that suits the layout."
            onChange={(projectMedia) => setStyle({ projectMedia })}
          />
        </>
      )}
      {projectStack && (
        <div className="flex flex-col gap-4 border-t border-line pt-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink-soft">Ratio</span>
            <div className="flex flex-wrap gap-2">
              {stackRatios.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.projectStackRatio === m}
                    onChange={() => setStyle({ projectStackRatio: m })}
                    className="sr-only"
                  />
                  {stackRatioLabels[m]}
                </label>
              ))}
            </div>
            <p className="text-xs text-ink-soft">{stackRatioHints[draft.style.projectStackRatio]}</p>
          </div>
          {(draft.style.projectStackRatio === "wide" || draft.style.projectStackRatio === "ultra") && (
            <Slider
              id="ui_project_stack_crop"
              label="Crop position"
              value={draft.style.projectStackCrop}
              range={styleRanges.stackCrop}
              format={(v) => (v === 0 ? "Top" : v === 100 ? "Bottom" : v === 50 ? "Middle" : `${v}%`)}
              hint="Which part of the photo shows: Top, Middle or Bottom."
              onChange={(projectStackCrop) => setStyle({ projectStackCrop })}
            />
          )}
        </div>
      )}
      <div className={projectWide ? "hidden" : "contents"}>{projectControls}</div>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Title place</span>
          <div className="flex flex-wrap gap-2">
            {designTitleAligns.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.projectTitleAlign === m}
                  onChange={() => setStyle({ projectTitleAlign: m })}
                  className="sr-only"
                />
                {designTitleAlignLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{designTitleAlignHints[draft.style.projectTitleAlign]}</p>
        </div>
        <TextFontSelect
          id="ui_project_title_font"
          label="Title font"
          value={draft.style.projectTitleFont}
          hint="Default is the small label. Pick a font or a size to turn the title into a big heading."
          onChange={(projectTitleFont) => setStyle({ projectTitleFont })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Title size</span>
          <div className="flex flex-wrap gap-2">
            {designTitleSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.projectTitleSize === m}
                  onChange={() => setStyle({ projectTitleSize: m })}
                  className="sr-only"
                />
                {designTitleSizeLabels[m]}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Text under the title</span>
        <TextFontSelect
          id="ui_project_intro_font"
          label="Font"
          value={draft.style.projectIntroFont}
          hint="Default is the font of the site. The text itself is written in Pages, tab Home, Section titles."
          onChange={(projectIntroFont) => setStyle({ projectIntroFont })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size</span>
          <div className="flex flex-wrap gap-2">
            {designIntroSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.projectIntroSize === m}
                  onChange={() => setStyle({ projectIntroSize: m })}
                  className="sr-only"
                />
                {designIntroSizeLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">Auto follows the size of the title.</p>
        </div>
      </div>
    </>
  );
  const bibliaWide = draft.style.bibliaMode === "full";
  const bibliaControls = (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Mode on Home</span>
        <div className="flex flex-wrap gap-2">
          {designModes.map((m) => (
            <label key={m} className={pill}>
              <input
                type="radio"
                value={m}
                checked={draft.style.bibliaMode === m}
                onChange={() => setStyle({ bibliaMode: m })}
                className="sr-only"
              />
              {designModeLabels[m]}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">{designModeHints[draft.style.bibliaMode]}</p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Layout on Home</span>
        <div className="flex flex-wrap gap-2">
          {bibliaWide
            ? bibliaWideViews.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.bibliaWideView === m}
                    onChange={() => setStyle({ bibliaWideView: m })}
                    className="sr-only"
                  />
                  {bibliaWideViewLabels[m]}
                </label>
              ))
            : bibliaViews.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.bibliaView === m}
                    onChange={() => setStyle({ bibliaView: m })}
                    className="sr-only"
                  />
                  {bibliaViewLabels[m]}
                </label>
              ))}
        </div>
        <p className="text-xs text-ink-soft">
          {bibliaWide
            ? bibliaWideViewHints[draft.style.bibliaWideView]
            : bibliaViewHints[draft.style.bibliaView]}
        </p>
      </div>
      {!bibliaWide && draft.style.bibliaView === "grid" && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size on Home</span>
          <div className="flex flex-wrap gap-2">
            {writingSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.bibliaSize === m}
                  onChange={() => setStyle({ bibliaSize: m })}
                  className="sr-only"
                />
                {writingSizeLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{bibliaSizeHints[draft.style.bibliaSize]}</p>
        </div>
      )}
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Title place</span>
          <div className="flex flex-wrap gap-2">
            {designTitleAligns.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.bibliaTitleAlign === m}
                  onChange={() => setStyle({ bibliaTitleAlign: m })}
                  className="sr-only"
                />
                {designTitleAlignLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{designTitleAlignHints[draft.style.bibliaTitleAlign]}</p>
        </div>
        <TextFontSelect
          id="ui_biblia_title_font"
          label="Title font"
          value={draft.style.bibliaTitleFont}
          hint="Default is the small label. Pick a font or a size to turn the title into a big heading."
          onChange={(bibliaTitleFont) => setStyle({ bibliaTitleFont })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Title size</span>
          <div className="flex flex-wrap gap-2">
            {designTitleSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.bibliaTitleSize === m}
                  onChange={() => setStyle({ bibliaTitleSize: m })}
                  className="sr-only"
                />
                {designTitleSizeLabels[m]}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Text under the title</span>
        <TextFontSelect
          id="ui_biblia_intro_font"
          label="Font"
          value={draft.style.bibliaIntroFont}
          hint="Default is the font of the site. The text itself is written in Pages, tab Home, Section titles."
          onChange={(bibliaIntroFont) => setStyle({ bibliaIntroFont })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size</span>
          <div className="flex flex-wrap gap-2">
            {designIntroSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.bibliaIntroSize === m}
                  onChange={() => setStyle({ bibliaIntroSize: m })}
                  className="sr-only"
                />
                {designIntroSizeLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">Auto follows the size of the title.</p>
        </div>
      </div>
    </>
  );
  const showcaseWide = draft.style.showcaseMode === "full";
  const showcaseControls = (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Mode on Home</span>
        <div className="flex flex-wrap gap-2">
          {designModes.map((m) => (
            <label key={m} className={pill}>
              <input
                type="radio"
                value={m}
                checked={draft.style.showcaseMode === m}
                onChange={() => setStyle({ showcaseMode: m })}
                className="sr-only"
              />
              {designModeLabels[m]}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">{designModeHints[draft.style.showcaseMode]}</p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Layout on Home</span>
        <div className="flex flex-wrap gap-2">
          {showcaseWide
            ? showcaseWideViews.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.showcaseWideView === m}
                    onChange={() => setStyle({ showcaseWideView: m })}
                    className="sr-only"
                  />
                  {showcaseWideViewLabels[m]}
                </label>
              ))
            : showcaseViews.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.showcaseView === m}
                    onChange={() => setStyle({ showcaseView: m })}
                    className="sr-only"
                  />
                  {showcaseViewLabels[m]}
                </label>
              ))}
        </div>
        <p className="text-xs text-ink-soft">
          {showcaseWide
            ? showcaseWideViewHints[draft.style.showcaseWideView]
            : showcaseViewHints[draft.style.showcaseView]}
        </p>
      </div>
      {!showcaseWide && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size on Home</span>
          <div className="flex flex-wrap gap-2">
            {showcaseSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.showcaseSize === m}
                  onChange={() => setStyle({ showcaseSize: m })}
                  className="sr-only"
                />
                {showcaseSizeLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{showcaseSizeHints[draft.style.showcaseSize]}</p>
        </div>
      )}
      <Slider
        id="ui_showcase_media"
        label="Main photo height"
        value={draft.style.showcaseMedia}
        range={styleRanges.showcaseMedia}
        format={(v) => (v === 0 ? "Auto" : `${v} rem`)}
        hint={
          showcaseWide
            ? "Height of the main photo or video. Auto uses the shape that suits the layout."
            : "Height of the main photo or video of each project. Auto keeps the shape of the file."
        }
        onChange={(showcaseMedia) => setStyle({ showcaseMedia })}
      />
      {showcaseWide && (draft.style.showcaseWideView === "stack" || draft.style.showcaseWideView === "stackslide") && (
        <div className="flex flex-col gap-4 border-t border-line pt-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Stack photo</span>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink-soft">Ratio</span>
            <div className="flex flex-wrap gap-2">
              {stackRatios.map((m) => (
                <label key={m} className={pill}>
                  <input
                    type="radio"
                    value={m}
                    checked={draft.style.showcaseStackRatio === m}
                    onChange={() => setStyle({ showcaseStackRatio: m })}
                    className="sr-only"
                  />
                  {stackRatioLabels[m]}
                </label>
              ))}
            </div>
            <p className="text-xs text-ink-soft">{stackRatioHints[draft.style.showcaseStackRatio]}</p>
          </div>
          {(draft.style.showcaseStackRatio === "wide" || draft.style.showcaseStackRatio === "ultra") && (
            <Slider
              id="ui_showcase_stack_crop"
              label="Crop position"
              value={draft.style.showcaseStackCrop}
              range={styleRanges.stackCrop}
              format={(v) => (v === 0 ? "Top" : v === 100 ? "Bottom" : v === 50 ? "Middle" : `${v}%`)}
              hint="Which part of the photo shows: Top, Middle or Bottom."
              onChange={(showcaseStackCrop) => setStyle({ showcaseStackCrop })}
            />
          )}
        </div>
      )}
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Title</span>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Place</span>
          <div className="flex flex-wrap gap-2">
            {designTitleAligns.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.showcaseTitleAlign === m}
                  onChange={() => setStyle({ showcaseTitleAlign: m })}
                  className="sr-only"
                />
                {designTitleAlignLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{designTitleAlignHints[draft.style.showcaseTitleAlign]}</p>
        </div>
        <TextFontSelect
          id="ui_showcase_title_font"
          label="Font"
          value={draft.style.showcaseTitleFont}
          hint="Default is the small label. Pick a font or a size to turn the title into a big heading."
          onChange={(showcaseTitleFont) => setStyle({ showcaseTitleFont })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size</span>
          <div className="flex flex-wrap gap-2">
            {designTitleSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.showcaseTitleSize === m}
                  onChange={() => setStyle({ showcaseTitleSize: m })}
                  className="sr-only"
                />
                {designTitleSizeLabels[m]}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Text under the title</span>
        <TextFontSelect
          id="ui_showcase_intro_font"
          label="Font"
          value={draft.style.showcaseIntroFont}
          hint="Default is the font of the site."
          onChange={(showcaseIntroFont) => setStyle({ showcaseIntroFont })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Size</span>
          <div className="flex flex-wrap gap-2">
            {designIntroSizes.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  value={m}
                  checked={draft.style.showcaseIntroSize === m}
                  onChange={() => setStyle({ showcaseIntroSize: m })}
                  className="sr-only"
                />
                {designIntroSizeLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">Auto follows the size of the title.</p>
        </div>
        <p className="text-xs text-ink-soft">
          The text itself is written in{" "}
          <Link href={routes.pages} className="underline underline-offset-4">
            Pages
          </Link>
          , Home tab, Section titles, under Showcase. Nothing shows until you write it.
        </p>
      </div>
    </>
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
      <input type="hidden" name="site_hero_motion" value={JSON.stringify(draft.style.heroMotion)} />
      <input type="hidden" name="site_project_size" value={draft.style.projectSize} />
      <input type="hidden" name="site_sections" value={JSON.stringify(draft.style.sections)} />
      <input type="hidden" name="site_order" value={JSON.stringify(draft.style.order)} />
      <input type="hidden" name="site_project_view" value={draft.style.projectView} />
      <input type="hidden" name="site_project_media" value={draft.style.projectMedia} />
      <input type="hidden" name="site_countdown_view" value={draft.style.countdownView} />
      <input type="hidden" name="site_countdown_mode" value={draft.style.countdownMode} />
      <input type="hidden" name="site_countdown_wide_view" value={draft.style.countdownWideView} />
      <input type="hidden" name="site_countdown_title_align" value={draft.style.countdownTitleAlign} />
      <input type="hidden" name="site_countdown_title_font" value={draft.style.countdownTitleFont} />
      <input type="hidden" name="site_countdown_title_size" value={draft.style.countdownTitleSize} />
      <input type="hidden" name="site_countdown_intro_font" value={draft.style.countdownIntroFont} />
      <input type="hidden" name="site_countdown_intro_size" value={draft.style.countdownIntroSize} />
      <input type="hidden" name="site_design_size" value={draft.style.designSize} />
      <input type="hidden" name="site_design_view" value={draft.style.designView} />
      <input type="hidden" name="site_design_media" value={draft.style.designMedia} />
      <input type="hidden" name="site_design_count" value={draft.style.designCount} />
      <input type="hidden" name="site_design_mode" value={draft.style.designMode} />
      <input type="hidden" name="site_design_wide_view" value={draft.style.designWideView} />
      <input type="hidden" name="site_design_title_align" value={draft.style.designTitleAlign} />
      <input type="hidden" name="site_design_title_font" value={draft.style.designTitleFont} />
      <input type="hidden" name="site_design_title_size" value={draft.style.designTitleSize} />
      <input type="hidden" name="site_design_intro_font" value={draft.style.designIntroFont} />
      <input type="hidden" name="site_design_intro_size" value={draft.style.designIntroSize} />
      <input type="hidden" name="site_showcase_size" value={draft.style.showcaseSize} />
      <input type="hidden" name="site_showcase_view" value={draft.style.showcaseView} />
      <input type="hidden" name="site_showcase_mode" value={draft.style.showcaseMode} />
      <input type="hidden" name="site_showcase_wide_view" value={draft.style.showcaseWideView} />
      <input type="hidden" name="site_showcase_media" value={draft.style.showcaseMedia} />
      <input type="hidden" name="site_showcase_title_align" value={draft.style.showcaseTitleAlign} />
      <input type="hidden" name="site_showcase_title_font" value={draft.style.showcaseTitleFont} />
      <input type="hidden" name="site_showcase_title_size" value={draft.style.showcaseTitleSize} />
      <input type="hidden" name="site_showcase_intro_font" value={draft.style.showcaseIntroFont} />
      <input type="hidden" name="site_showcase_intro_size" value={draft.style.showcaseIntroSize} />
      <input type="hidden" name="site_showcase_stack_ratio" value={draft.style.showcaseStackRatio} />
      <input type="hidden" name="site_showcase_stack_crop" value={draft.style.showcaseStackCrop} />
      <input type="hidden" name="site_writing_mode" value={draft.style.writingMode} />
      <input type="hidden" name="site_writing_view" value={draft.style.writingView} />
      <input type="hidden" name="site_writing_wide_view" value={draft.style.writingWideView} />
      <input type="hidden" name="site_writing_size" value={draft.style.writingSize} />
      <input type="hidden" name="site_writing_media" value={draft.style.writingMedia} />
      <input type="hidden" name="site_writing_title_align" value={draft.style.writingTitleAlign} />
      <input type="hidden" name="site_writing_title_font" value={draft.style.writingTitleFont} />
      <input type="hidden" name="site_writing_title_size" value={draft.style.writingTitleSize} />
      <input type="hidden" name="site_writing_intro_font" value={draft.style.writingIntroFont} />
      <input type="hidden" name="site_writing_intro_size" value={draft.style.writingIntroSize} />
      <input type="hidden" name="site_writing_stack_ratio" value={draft.style.writingStackRatio} />
      <input type="hidden" name="site_writing_stack_crop" value={draft.style.writingStackCrop} />
      <input type="hidden" name="site_articles_mode" value={draft.style.articlesMode} />
      <input type="hidden" name="site_articles_view" value={draft.style.articlesView} />
      <input type="hidden" name="site_articles_wide_view" value={draft.style.articlesWideView} />
      <input type="hidden" name="site_articles_size" value={draft.style.articlesSize} />
      <input type="hidden" name="site_articles_media" value={draft.style.articlesMedia} />
      <input type="hidden" name="site_articles_title_align" value={draft.style.articlesTitleAlign} />
      <input type="hidden" name="site_articles_title_font" value={draft.style.articlesTitleFont} />
      <input type="hidden" name="site_articles_title_size" value={draft.style.articlesTitleSize} />
      <input type="hidden" name="site_articles_intro_font" value={draft.style.articlesIntroFont} />
      <input type="hidden" name="site_articles_intro_size" value={draft.style.articlesIntroSize} />
      <input type="hidden" name="site_articles_stack_ratio" value={draft.style.articlesStackRatio} />
      <input type="hidden" name="site_articles_stack_crop" value={draft.style.articlesStackCrop} />
      <input type="hidden" name="site_project_mode" value={draft.style.projectMode} />
      <input type="hidden" name="site_project_wide_view" value={draft.style.projectWideView} />
      <input type="hidden" name="site_project_title_align" value={draft.style.projectTitleAlign} />
      <input type="hidden" name="site_project_title_font" value={draft.style.projectTitleFont} />
      <input type="hidden" name="site_project_title_size" value={draft.style.projectTitleSize} />
      <input type="hidden" name="site_project_intro_font" value={draft.style.projectIntroFont} />
      <input type="hidden" name="site_project_intro_size" value={draft.style.projectIntroSize} />
      <input type="hidden" name="site_project_stack_ratio" value={draft.style.projectStackRatio} />
      <input type="hidden" name="site_project_stack_crop" value={draft.style.projectStackCrop} />
      <input type="hidden" name="site_biblia_mode" value={draft.style.bibliaMode} />
      <input type="hidden" name="site_biblia_view" value={draft.style.bibliaView} />
      <input type="hidden" name="site_biblia_wide_view" value={draft.style.bibliaWideView} />
      <input type="hidden" name="site_biblia_size" value={draft.style.bibliaSize} />
      <input type="hidden" name="site_biblia_title_align" value={draft.style.bibliaTitleAlign} />
      <input type="hidden" name="site_biblia_title_font" value={draft.style.bibliaTitleFont} />
      <input type="hidden" name="site_biblia_title_size" value={draft.style.bibliaTitleSize} />
      <input type="hidden" name="site_biblia_intro_font" value={draft.style.bibliaIntroFont} />
      <input type="hidden" name="site_biblia_intro_size" value={draft.style.bibliaIntroSize} />
      <input type="hidden" name="site_github_mode" value={draft.style.githubMode} />
      <input type="hidden" name="site_github_view" value={draft.style.githubView} />
      <input type="hidden" name="site_github_wide_view" value={draft.style.githubWideView} />
      <input type="hidden" name="site_github_title_align" value={draft.style.githubTitleAlign} />
      <input type="hidden" name="site_github_title_font" value={draft.style.githubTitleFont} />
      <input type="hidden" name="site_github_title_size" value={draft.style.githubTitleSize} />
      <input type="hidden" name="site_github_intro_font" value={draft.style.githubIntroFont} />
      <input type="hidden" name="site_github_intro_size" value={draft.style.githubIntroSize} />
      <input type="hidden" name="site_links_mode" value={draft.style.linksMode} />
      <input type="hidden" name="site_links_view" value={draft.style.linksView} />
      <input type="hidden" name="site_links_wide_view" value={draft.style.linksWideView} />
      <input type="hidden" name="site_links_title_align" value={draft.style.linksTitleAlign} />
      <input type="hidden" name="site_links_title_font" value={draft.style.linksTitleFont} />
      <input type="hidden" name="site_links_title_size" value={draft.style.linksTitleSize} />
      <input type="hidden" name="site_links_intro_font" value={draft.style.linksIntroFont} />
      <input type="hidden" name="site_links_intro_size" value={draft.style.linksIntroSize} />
      <input type="hidden" name="site_visit_mode" value={draft.style.visitMode} />
      <input type="hidden" name="site_visit_view" value={draft.style.visitView} />
      <input type="hidden" name="site_visit_wide_view" value={draft.style.visitWideView} />
      <input type="hidden" name="site_visit_size" value={draft.style.visitSize} />
      <input type="hidden" name="site_visit_title_align" value={draft.style.visitTitleAlign} />
      <input type="hidden" name="site_visit_title_font" value={draft.style.visitTitleFont} />
      <input type="hidden" name="site_visit_title_size" value={draft.style.visitTitleSize} />
      <input type="hidden" name="site_visit_intro_font" value={draft.style.visitIntroFont} />
      <input type="hidden" name="site_visit_intro_size" value={draft.style.visitIntroSize} />
      <input type="hidden" name="site_shop_mode" value={draft.style.shopMode} />
      <input type="hidden" name="site_shop_view" value={draft.style.shopView} />
      <input type="hidden" name="site_shop_wide_view" value={draft.style.shopWideView} />
      <input type="hidden" name="site_shop_size" value={draft.style.shopSize} />
      <input type="hidden" name="site_shop_media" value={draft.style.shopMedia} />
      <input type="hidden" name="site_shop_title_align" value={draft.style.shopTitleAlign} />
      <input type="hidden" name="site_shop_title_font" value={draft.style.shopTitleFont} />
      <input type="hidden" name="site_shop_title_size" value={draft.style.shopTitleSize} />
      <input type="hidden" name="site_shop_intro_font" value={draft.style.shopIntroFont} />
      <input type="hidden" name="site_shop_intro_size" value={draft.style.shopIntroSize} />
      <input type="hidden" name="site_shop_stack_ratio" value={draft.style.shopStackRatio} />
      <input type="hidden" name="site_shop_stack_crop" value={draft.style.shopStackCrop} />
      <input type="hidden" name="site_design_stack_ratio" value={draft.style.designStackRatio} />
      <input type="hidden" name="site_design_stack_crop" value={draft.style.designStackCrop} />
      <input type="hidden" name="site_about_layout" value={draft.style.aboutLayout} />
      <input type="hidden" name="site_about_photo" value={draft.style.aboutPhoto} />
      <input type="hidden" name="site_steam_layout" value={draft.style.steamLayout} />
      <input type="hidden" name="site_steam_mode" value={draft.style.steamMode} />
      <input type="hidden" name="site_steam_background" value={draft.style.steamBackground} />
      <input type="hidden" name="site_steam_opacity" value={draft.style.steamOpacity} />
      <input type="hidden" name="site_steam_position" value={draft.style.steamPosition} />
      <input type="hidden" name="site_about_sections" value={JSON.stringify(draft.style.aboutSections)} />
      <input type="hidden" name="site_about_order" value={JSON.stringify(draft.style.aboutOrder)} />
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
        <aside className="relative order-2 min-h-0 flex-1 overflow-y-auto border-t border-line lg:order-1 lg:w-90 lg:flex-none lg:border-r lg:border-t-0">
          <div className="border-b border-line px-5 py-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Page</span>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Page">
              {studioPages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={page === p.id}
                  onClick={() => setPage(p.id)}
                  className={cn(
                    "ink-border rounded-md px-3 py-1.5 text-sm",
                    page === p.id ? "bg-ink text-bg" : "text-ink-soft hover:text-ink",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className={cn(page !== "home" && "hidden")}>
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
                countdownMode: siteStyleDefaults.countdownMode,
                countdownWideView: siteStyleDefaults.countdownWideView,
                countdownTitleAlign: siteStyleDefaults.countdownTitleAlign,
                countdownTitleFont: siteStyleDefaults.countdownTitleFont,
                countdownTitleSize: siteStyleDefaults.countdownTitleSize,
                countdownIntroFont: siteStyleDefaults.countdownIntroFont,
                countdownIntroSize: siteStyleDefaults.countdownIntroSize,
                designSize: siteStyleDefaults.designSize,
                designView: siteStyleDefaults.designView,
                designMedia: siteStyleDefaults.designMedia,
                designCount: siteStyleDefaults.designCount,
                designMode: siteStyleDefaults.designMode,
                designWideView: siteStyleDefaults.designWideView,
                designTitleAlign: siteStyleDefaults.designTitleAlign,
                designTitleFont: siteStyleDefaults.designTitleFont,
                designTitleSize: siteStyleDefaults.designTitleSize,
                designIntroFont: siteStyleDefaults.designIntroFont,
                designIntroSize: siteStyleDefaults.designIntroSize,
                showcaseSize: siteStyleDefaults.showcaseSize,
                showcaseView: siteStyleDefaults.showcaseView,
                showcaseMode: siteStyleDefaults.showcaseMode,
                showcaseWideView: siteStyleDefaults.showcaseWideView,
                showcaseMedia: siteStyleDefaults.showcaseMedia,
                showcaseTitleAlign: siteStyleDefaults.showcaseTitleAlign,
                showcaseTitleFont: siteStyleDefaults.showcaseTitleFont,
                showcaseTitleSize: siteStyleDefaults.showcaseTitleSize,
                showcaseIntroFont: siteStyleDefaults.showcaseIntroFont,
                showcaseIntroSize: siteStyleDefaults.showcaseIntroSize,
                showcaseStackRatio: siteStyleDefaults.showcaseStackRatio,
                showcaseStackCrop: siteStyleDefaults.showcaseStackCrop,
                writingMode: siteStyleDefaults.writingMode,
                writingView: siteStyleDefaults.writingView,
                writingWideView: siteStyleDefaults.writingWideView,
                writingSize: siteStyleDefaults.writingSize,
                writingMedia: siteStyleDefaults.writingMedia,
                writingTitleAlign: siteStyleDefaults.writingTitleAlign,
                writingTitleFont: siteStyleDefaults.writingTitleFont,
                writingTitleSize: siteStyleDefaults.writingTitleSize,
                writingIntroFont: siteStyleDefaults.writingIntroFont,
                writingIntroSize: siteStyleDefaults.writingIntroSize,
                writingStackRatio: siteStyleDefaults.writingStackRatio,
                writingStackCrop: siteStyleDefaults.writingStackCrop,
                articlesMode: siteStyleDefaults.articlesMode,
                articlesView: siteStyleDefaults.articlesView,
                articlesWideView: siteStyleDefaults.articlesWideView,
                articlesSize: siteStyleDefaults.articlesSize,
                articlesMedia: siteStyleDefaults.articlesMedia,
                articlesTitleAlign: siteStyleDefaults.articlesTitleAlign,
                articlesTitleFont: siteStyleDefaults.articlesTitleFont,
                articlesTitleSize: siteStyleDefaults.articlesTitleSize,
                articlesIntroFont: siteStyleDefaults.articlesIntroFont,
                articlesIntroSize: siteStyleDefaults.articlesIntroSize,
                articlesStackRatio: siteStyleDefaults.articlesStackRatio,
                articlesStackCrop: siteStyleDefaults.articlesStackCrop,
                projectMode: siteStyleDefaults.projectMode,
                projectWideView: siteStyleDefaults.projectWideView,
                projectTitleAlign: siteStyleDefaults.projectTitleAlign,
                projectTitleFont: siteStyleDefaults.projectTitleFont,
                projectTitleSize: siteStyleDefaults.projectTitleSize,
                projectIntroFont: siteStyleDefaults.projectIntroFont,
                projectIntroSize: siteStyleDefaults.projectIntroSize,
                projectStackRatio: siteStyleDefaults.projectStackRatio,
                projectStackCrop: siteStyleDefaults.projectStackCrop,
                bibliaMode: siteStyleDefaults.bibliaMode,
                bibliaView: siteStyleDefaults.bibliaView,
                bibliaWideView: siteStyleDefaults.bibliaWideView,
                bibliaSize: siteStyleDefaults.bibliaSize,
                bibliaTitleAlign: siteStyleDefaults.bibliaTitleAlign,
                bibliaTitleFont: siteStyleDefaults.bibliaTitleFont,
                bibliaTitleSize: siteStyleDefaults.bibliaTitleSize,
                bibliaIntroFont: siteStyleDefaults.bibliaIntroFont,
                bibliaIntroSize: siteStyleDefaults.bibliaIntroSize,
                githubMode: siteStyleDefaults.githubMode,
                githubView: siteStyleDefaults.githubView,
                githubWideView: siteStyleDefaults.githubWideView,
                githubTitleAlign: siteStyleDefaults.githubTitleAlign,
                githubTitleFont: siteStyleDefaults.githubTitleFont,
                githubTitleSize: siteStyleDefaults.githubTitleSize,
                githubIntroFont: siteStyleDefaults.githubIntroFont,
                githubIntroSize: siteStyleDefaults.githubIntroSize,
                linksMode: siteStyleDefaults.linksMode,
                linksView: siteStyleDefaults.linksView,
                linksWideView: siteStyleDefaults.linksWideView,
                linksTitleAlign: siteStyleDefaults.linksTitleAlign,
                linksTitleFont: siteStyleDefaults.linksTitleFont,
                linksTitleSize: siteStyleDefaults.linksTitleSize,
                linksIntroFont: siteStyleDefaults.linksIntroFont,
                linksIntroSize: siteStyleDefaults.linksIntroSize,
                visitMode: siteStyleDefaults.visitMode,
                visitView: siteStyleDefaults.visitView,
                visitWideView: siteStyleDefaults.visitWideView,
                visitSize: siteStyleDefaults.visitSize,
                visitTitleAlign: siteStyleDefaults.visitTitleAlign,
                visitTitleFont: siteStyleDefaults.visitTitleFont,
                visitTitleSize: siteStyleDefaults.visitTitleSize,
                visitIntroFont: siteStyleDefaults.visitIntroFont,
                visitIntroSize: siteStyleDefaults.visitIntroSize,
                shopMode: siteStyleDefaults.shopMode,
                shopView: siteStyleDefaults.shopView,
                shopWideView: siteStyleDefaults.shopWideView,
                shopSize: siteStyleDefaults.shopSize,
                shopMedia: siteStyleDefaults.shopMedia,
                shopTitleAlign: siteStyleDefaults.shopTitleAlign,
                shopTitleFont: siteStyleDefaults.shopTitleFont,
                shopTitleSize: siteStyleDefaults.shopTitleSize,
                shopIntroFont: siteStyleDefaults.shopIntroFont,
                shopIntroSize: siteStyleDefaults.shopIntroSize,
                shopStackRatio: siteStyleDefaults.shopStackRatio,
                shopStackCrop: siteStyleDefaults.shopStackCrop,
                designStackRatio: siteStyleDefaults.designStackRatio,
                designStackCrop: siteStyleDefaults.designStackCrop,
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
              extra={{
                projects: projectsAll,
                biblia: bibliaControls,
                github: <GithubControls style={draft.style} onChange={setStyle} />,
                links: <LinksControls style={draft.style} onChange={setStyle} />,
                visit: <VisitControls style={draft.style} onChange={setStyle} />,
                shop: <ShopControls style={draft.style} onChange={setStyle} />,
                countdown: countdownControls,
                writing: writingControls,
                articles: articlesControls,
                showcase: showcaseControls,
                designs: designControls,
              }}
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
                heroMotion: siteStyleDefaults.heroMotion,
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
            <div className="flex flex-col gap-3 border-t border-line pt-4">
              <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Entrance on Home</span>
              <p className="text-xs text-ink-soft">
                How the top of Home appears. Every item has its own motion, speed and moment to start. Original is
                how it has always been. The hero, name and tabs follow these settings only when Motion is Full.
              </p>
              <button
                type="button"
                onClick={replayEntrance}
                className="ink-border cursor-pointer self-start rounded-full px-3 py-1.5 text-sm"
              >
                ▶ Play the entrance in the preview
              </button>
              {heroItemIds.map((id) => (
                <HeroMotionItem
                  key={id}
                  id={id}
                  value={draft.style.heroMotion[id]}
                  onChange={(next) =>
                    setDraft((d) => ({
                      ...d,
                      style: { ...d.style, heroMotion: { ...d.style.heroMotion, [id]: next } },
                    }))
                  }
                />
              ))}
            </div>
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

          </div>
          <div className={cn(page !== "about" && "hidden")}>
            <AboutControls
              style={draft.style}
              onStyle={setStyle}
              onSection={setAboutSection}
              onReset={() =>
                setStyle({
                  aboutLayout: siteStyleDefaults.aboutLayout,
                  aboutPhoto: siteStyleDefaults.aboutPhoto,
                  steamLayout: siteStyleDefaults.steamLayout,
                  steamMode: siteStyleDefaults.steamMode,
                  steamBackground: siteStyleDefaults.steamBackground,
                  steamOpacity: siteStyleDefaults.steamOpacity,
                  steamPosition: siteStyleDefaults.steamPosition,
                  aboutSections: siteStyleDefaults.aboutSections,
                  aboutOrder: siteStyleDefaults.aboutOrder,
                })
              }
            />
          </div>
          <p className="px-5 py-4 text-xs text-ink-soft">
            Media, text and pages are set in <Link href={routes.pages} className="underline underline-offset-4">Pages</Link>.
          </p>
        </aside>

        <section
          aria-label="Preview"
          className="order-1 h-[45dvh] shrink-0 bg-highlight p-3 lg:order-2 lg:h-auto lg:min-w-0 lg:flex-1 lg:shrink lg:p-6"
        >
          {/* The preview is the real page /admin/preview in a frame: the frame is its screen, so the height,
              the width of a phone and the scroll behave like the website. */}
          <div
            className="relative mx-auto h-full overflow-hidden border border-line bg-bg"
            style={{ maxWidth: device === "phone" ? phoneWidth : undefined }}
          >
            <iframe
              ref={frameRef}
              src={previewPath}
              title="Preview of your website"
              className="absolute inset-0 size-full border-0"
            />
            {!loaded && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-ink-soft">
                Loading the preview...
              </p>
            )}
          </div>
        </section>
      </div>
    </form>
  );
}