import { Field } from "@/components/ui/Field";
import { fontChoices, fontIds, type FontId } from "@/config/font-choices";
import {
  designIntroSizeLabels,
  designIntroSizes,
  designModeHints,
  designModeLabels,
  designModes,
  designTextFonts,
  designTitleAlignHints,
  designTitleAlignLabels,
  designTitleAligns,
  designTitleSizeLabels,
  designTitleSizes,
  githubViewHints,
  githubViewLabels,
  githubViews,
  githubWideViewHints,
  githubWideViewLabels,
  githubWideViews,
  type DesignFont,
} from "@/config/layout";
import type { SiteStyle } from "@/config/site-style";

const pill =
  "ink-border cursor-pointer rounded-full px-3 py-1.5 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";

function Choice<T extends string>({
  label,
  list,
  labels,
  value,
  hint,
  onPick,
}: {
  label: string;
  list: readonly T[];
  labels: Record<T, string>;
  value: T;
  hint?: string;
  onPick: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <div className="flex flex-wrap gap-2">
        {list.map((m) => (
          <label key={m} className={pill}>
            <input type="radio" value={m} checked={value === m} onChange={() => onPick(m)} className="sr-only" />
            {labels[m]}
          </label>
        ))}
      </div>
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

// The name of a font in the list: its label when it has one, otherwise its id.
function fontName(id: FontId): string {
  const choice: object = fontChoices[id];
  return "label" in choice && typeof choice.label === "string" ? choice.label : id;
}

function FontSelect({
  id,
  label,
  value,
  hint,
  onPick,
}: {
  id: string;
  label: string;
  value: DesignFont;
  hint: string;
  onPick: (value: DesignFont) => void;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <select
        id={id}
        value={value}
        onChange={(e) => onPick(designTextFonts.find((f) => f === e.target.value) ?? "default")}
        className="ink-border w-full rounded-md bg-bg px-3 py-2 text-sm"
      >
        <option value="default">Default</option>
        {fontIds.map((f) => (
          <option key={f} value={f}>
            {fontName(f)}
          </option>
        ))}
      </select>
    </Field>
  );
}

// The settings of the GitHub section, shown in Customize, Sections, GitHub.
// No Size, Ratio, Crop or Photo height: this section has no photos to crop.
export function GithubControls({
  style,
  onChange,
}: {
  style: SiteStyle;
  onChange: (patch: Partial<SiteStyle>) => void;
}) {
  const wide = style.githubMode === "full";
  return (
    <>
      <Choice
        label="Mode on Home"
        list={designModes}
        labels={designModeLabels}
        value={style.githubMode}
        hint={designModeHints[style.githubMode]}
        onPick={(githubMode) => onChange({ githubMode })}
      />
      {wide ? (
        <Choice
          label="Layout on Home"
          list={githubWideViews}
          labels={githubWideViewLabels}
          value={style.githubWideView}
          hint={githubWideViewHints[style.githubWideView]}
          onPick={(githubWideView) => onChange({ githubWideView })}
        />
      ) : (
        <Choice
          label="Layout on Home"
          list={githubViews}
          labels={githubViewLabels}
          value={style.githubView}
          hint={githubViewHints[style.githubView]}
          onPick={(githubView) => onChange({ githubView })}
        />
      )}
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <Choice
          label="Title place"
          list={designTitleAligns}
          labels={designTitleAlignLabels}
          value={style.githubTitleAlign}
          hint={designTitleAlignHints[style.githubTitleAlign]}
          onPick={(githubTitleAlign) => onChange({ githubTitleAlign })}
        />
        <FontSelect
          id="ui_github_title_font"
          label="Title font"
          value={style.githubTitleFont}
          hint="Default is the small label. Pick a font or a size to turn the title into a big heading."
          onPick={(githubTitleFont) => onChange({ githubTitleFont })}
        />
        <Choice
          label="Title size"
          list={designTitleSizes}
          labels={designTitleSizeLabels}
          value={style.githubTitleSize}
          onPick={(githubTitleSize) => onChange({ githubTitleSize })}
        />
      </div>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Text under the title</span>
        <FontSelect
          id="ui_github_intro_font"
          label="Font"
          value={style.githubIntroFont}
          hint="Default is the font of the site. The text itself is written in Pages, tab Home, Section titles."
          onPick={(githubIntroFont) => onChange({ githubIntroFont })}
        />
        <Choice
          label="Size"
          list={designIntroSizes}
          labels={designIntroSizeLabels}
          value={style.githubIntroSize}
          hint="Auto follows the size of the title."
          onPick={(githubIntroSize) => onChange({ githubIntroSize })}
        />
      </div>
    </>
  );
}