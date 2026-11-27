"use client";

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
  steamLayoutHints,
  steamLayoutLabels,
  steamLayouts,
  type AboutLayout,
  type AboutPhotoShape,
  type AboutSectionId,
  type AboutSections,
  type SteamLayout,
} from "@/config/about-style";
import {
  sectionSpace,
  sectionSurfaceHints,
  sectionSurfaceLabels,
  sectionSurfaces,
  type SectionSetting,
} from "@/config/layout";
import { cn } from "@/lib/utils";

const pill =
  "ink-border cursor-pointer rounded-full px-3 py-1.5 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";
const resetButton =
  "self-start font-mono text-xs uppercase tracking-widest text-ink-soft underline underline-offset-4 hover:text-ink";

type Props = {
  layout: AboutLayout;
  photo: AboutPhotoShape;
  steamLayout: SteamLayout;
  sections: AboutSections;
  order: AboutSectionId[];
  onLayout: (value: AboutLayout) => void;
  onPhoto: (value: AboutPhotoShape) => void;
  onSteamLayout: (value: SteamLayout) => void;
  onSection: (id: AboutSectionId, patch: Partial<SectionSetting>) => void;
  onOrder: (order: AboutSectionId[]) => void;
  onReset: () => void;
};

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

function Space({
  id,
  label,
  value,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={`${label}: ${value} rem`} htmlFor={id} hint={hint}>
      <input
        id={id}
        type="range"
        min={sectionSpace.min}
        max={sectionSpace.max}
        step={sectionSpace.step}
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
  onSection,
  onMove,
}: {
  id: AboutSectionId;
  index: number;
  count: number;
  setting: SectionSetting;
  extra: ReactNode;
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
          <Space
            id={`ui_about_${id}_top`}
            label="Space above"
            value={setting.top}
            hint="0 keeps the Spacing choice as it is."
            onChange={(top) => onSection(id, { top })}
          />
          <Space
            id={`ui_about_${id}_bottom`}
            label="Space below"
            value={setting.bottom}
            onChange={(bottom) => onSection(id, { bottom })}
          />
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
export function AboutControls(p: Props) {
  function move(from: number, to: number) {
    if (to < 0 || to >= p.order.length) return;
    const next = [...p.order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    p.onOrder(next);
  }

  const extra: Record<AboutSectionId, ReactNode> = {
    profile: (
      <>
        <Choice
          legend="Layout"
          value={p.layout}
          options={aboutLayouts}
          labels={aboutLayoutLabels}
          hints={aboutLayoutHints}
          onChange={p.onLayout}
        />
        <Choice
          legend="Photo shape"
          value={p.photo}
          options={aboutPhotoShapes}
          labels={aboutPhotoLabels}
          hints={aboutPhotoHints}
          onChange={p.onPhoto}
        />
      </>
    ),
    steam: (
      <>
        <Choice
          legend="Layout"
          value={p.steamLayout}
          options={steamLayouts}
          labels={steamLayoutLabels}
          hints={steamLayoutHints}
          onChange={p.onSteamLayout}
        />
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
        {p.order.map((id, index) => (
          <Row
            key={id}
            id={id}
            index={index}
            count={p.order.length}
            setting={p.sections[id]}
            extra={extra[id]}
            onSection={p.onSection}
            onMove={move}
          />
        ))}
      </ul>
      <button type="button" onClick={p.onReset} className={resetButton}>
        Reset about page
      </button>
    </div>
  );
}