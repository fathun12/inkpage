"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Field } from "@/components/ui/Field";
import {
  aboutLayoutHints,
  aboutLayoutLabels,
  aboutLayouts,
  aboutPhotoHints,
  aboutPhotoLabels,
  aboutPhotoShapes,
  aboutSectionLabels,
  steamBackgroundHints,
  steamBackgroundLabels,
  steamBackgrounds,
  steamLayoutHints,
  steamLayoutLabels,
  steamLayouts,
  steamModeHints,
  steamModeLabels,
  steamModes,
  type AboutSectionId,
} from "@/config/about-style";
import {
  sectionSpace,
  sectionSurfaceHints,
  sectionSurfaceLabels,
  sectionSurfaces,
  type SectionSetting,
} from "@/config/layout";
import { routes } from "@/config/site";
import { styleRanges, type SiteStyle } from "@/config/site-style";
import { cn } from "@/lib/utils";

const pill =
  "ink-border cursor-pointer rounded-full px-3 py-1.5 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";
const resetButton =
  "self-start font-mono text-xs uppercase tracking-widest text-ink-soft underline underline-offset-4 hover:text-ink";

type Props = {
  style: SiteStyle;
  onStyle: (patch: Partial<SiteStyle>) => void;
  onSection: (id: AboutSectionId, patch: Partial<SectionSetting>) => void;
  onReset: () => void;
};

type Range = { min: number; max: number; step: number };

function Choice<T extends string>({
  legend,
  value,
  options,
  labels,
  hints,
  onChange,
}: {
  legend: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  hints?: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink-soft">{legend}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((m) => (
          <label key={m} className={pill}>
            <input
              type="radio"
              value={m}
              checked={value === m}
              onChange={() => onChange(m)}
              className="sr-only"
            />
            {labels[m]}
          </label>
        ))}
      </div>
      {hints && <p className="text-xs text-ink-soft">{hints[value]}</p>}
    </div>
  );
}

function Slider({
  id,
  label,
  value,
  range,
  format,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  range: Range;
  format?: (value: number) => string;
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={`${label}: ${format ? format(value) : value}`} htmlFor={id} hint={hint}>
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

function Row({
  id,
  index,
  count,
  setting,
  extra,
  hideSurface,
  onSection,
  onMove,
}: {
  id: AboutSectionId;
  index: number;
  count: number;
  setting: SectionSetting;
  extra: ReactNode;
  hideSurface: boolean;
  onSection: (id: AboutSectionId, patch: Partial<SectionSetting>) => void;
  onMove: (from: number, to: number) => void;
}) {
  const label = aboutSectionLabels[id];
  return (
    <li className="flex items-start gap-1">
      <details className="ink-border min-w-0 flex-1 rounded-md">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 [&::-webkit-details-marker]:hidden">
          <span className={cn("text-sm", setting.hidden && "text-ink-soft line-through")}>{label}</span>
          <label className="flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink-soft">
            <input
              type="checkbox"
              checked={!setting.hidden}
              onChange={(e) => onSection(id, { hidden: !e.target.checked })}
              className="accent-accent"
            />
            Show
          </label>
        </summary>
        <div className="flex flex-col gap-4 px-3 pb-3 pt-1">
          <div className="flex flex-col gap-4 border-b border-line pb-4">{extra}</div>
          <Slider
            id={`ui_about_${id}_top`}
            label="Space above"
            value={setting.top}
            range={sectionSpace}
            format={(v) => `${v} rem`}
            hint="0 keeps the Spacing choice as it is."
            onChange={(top) => onSection(id, { top })}
          />
          <Slider
            id={`ui_about_${id}_bottom`}
            label="Space below"
            value={setting.bottom}
            range={sectionSpace}
            format={(v) => `${v} rem`}
            onChange={(bottom) => onSection(id, { bottom })}
          />
          {!hideSurface && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink-soft">Background</span>
              <div className="flex flex-wrap gap-2">
                {sectionSurfaces.map((s) => (
                  <label key={s} className={pill}>
                    <input
                      type="radio"
                      value={s}
                      checked={setting.surface === s}
                      onChange={() => onSection(id, { surface: s })}
                      className="sr-only"
                    />
                    {sectionSurfaceLabels[s]}
                  </label>
                ))}
              </div>
              <p className="text-xs text-ink-soft">{sectionSurfaceHints[setting.surface]}</p>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={setting.line}
              onChange={(e) => onSection(id, { line: e.target.checked })}
              className="accent-accent"
            />
            Divider line above
          </label>
        </div>
      </details>
      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          aria-label={`Move ${label} up`}
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
          className="px-1.5 py-0.5 font-mono text-xs text-ink-soft hover:text-ink disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          aria-label={`Move ${label} down`}
          disabled={index === count - 1}
          onClick={() => onMove(index, index + 1)}
          className="px-1.5 py-0.5 font-mono text-xs text-ink-soft hover:text-ink disabled:opacity-30"
        >
          ↓
        </button>
      </div>
    </li>
  );
}

// The settings of the About page in the Customize studio. No control has a name: the studio sends them
// as hidden inputs.
export function AboutControls({ style, onStyle, onSection, onReset }: Props) {
  const order = style.aboutOrder;

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onStyle({ aboutOrder: next });
  }

  const extra: Record<AboutSectionId, ReactNode> = {
    profile: (
      <>
        <Choice
          legend="Layout"
          value={style.aboutLayout}
          options={aboutLayouts}
          labels={aboutLayoutLabels}
          hints={aboutLayoutHints}
          onChange={(aboutLayout) => onStyle({ aboutLayout })}
        />
        <Choice
          legend="Photo shape"
          value={style.aboutPhoto}
          options={aboutPhotoShapes}
          labels={aboutPhotoLabels}
          hints={aboutPhotoHints}
          onChange={(aboutPhoto) => onStyle({ aboutPhoto })}
        />
      </>
    ),
    steam: (
      <>
        <Choice
          legend="Mode"
          value={style.steamMode}
          options={steamModes}
          labels={steamModeLabels}
          hints={steamModeHints}
          onChange={(steamMode) => onStyle({ steamMode })}
        />
        <Choice
          legend="Layout"
          value={style.steamLayout}
          options={steamLayouts}
          labels={steamLayoutLabels}
          hints={steamLayoutHints}
          onChange={(steamLayout) => onStyle({ steamLayout })}
        />
        <Choice
          legend="Background"
          value={style.steamBackground}
          options={steamBackgrounds}
          labels={steamBackgroundLabels}
          hints={steamBackgroundHints}
          onChange={(steamBackground) => onStyle({ steamBackground })}
        />
        {style.steamBackground === "media" && (
          <>
            <Slider
              id="ui_steam_opacity"
              label="Media opacity"
              value={style.steamOpacity}
              range={styleRanges.steamOpacity}
              format={(v) => `${v}%`}
              hint="100% = the media as it is. Lower = it fades into the Secondary color, so the text stays easy to read."
              onChange={(steamOpacity) => onStyle({ steamOpacity })}
            />
            <Slider
              id="ui_steam_position"
              label="Media position"
              value={style.steamPosition}
              range={styleRanges.steamPosition}
              format={(v) => (v === 0 ? "Top" : v === 100 ? "Bottom" : v === 50 ? "Middle" : `${v}%`)}
              hint="Which part of the media shows when the section is wider than the media."
              onChange={(steamPosition) => onStyle({ steamPosition })}
            />
            <p className="text-xs text-ink-soft">
              The media is uploaded in{" "}
              <Link href={routes.pages} className="underline underline-offset-4">
                Pages
              </Link>
              , About tab, Steam. Nothing shows until you upload one.
            </p>
          </>
        )}
        <p className="text-xs text-ink-soft">
          The Steam section shows only when a Steam ID is saved in Pages, About tab, and the Steam profile is
          public.
        </p>
      </>
    ),
  };

  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      <p className="text-xs text-ink-soft">
        Order, space, background and layout of the sections of the About page. Use the arrows to change the
        order, untick Show to hide a section, and click a name to open its settings. The photo and the text
        are written in Pages, About tab.
      </p>
      <ul className="flex flex-col gap-2">
        {order.map((id, index) => (
          <Row
            key={id}
            id={id}
            index={index}
            count={order.length}
            setting={style.aboutSections[id]}
            extra={extra[id]}
            hideSurface={id === "steam"}
            onSection={onSection}
            onMove={move}
          />
        ))}
      </ul>
      <button type="button" onClick={onReset} className={resetButton}>
        Reset about page
      </button>
    </div>
  );
}