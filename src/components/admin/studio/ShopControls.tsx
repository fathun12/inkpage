import { Choice, FontSelect } from "@/components/admin/studio/GithubControls";
import { Field } from "@/components/ui/Field";
import {
  designIntroSizeLabels,
  designIntroSizes,
  designModeHints,
  designModeLabels,
  designModes,
  designTitleAlignHints,
  designTitleAlignLabels,
  designTitleAligns,
  designTitleSizeLabels,
  designTitleSizes,
  shopSizeHints,
  shopViewHints,
  shopViewLabels,
  shopViews,
  shopWideViewHints,
  shopWideViewLabels,
  shopWideViews,
  stackRatioHints,
  stackRatioLabels,
  stackRatios,
  writingSizeLabels,
  writingSizes,
} from "@/config/layout";
import { styleRanges, type SiteStyle } from "@/config/site-style";

function Range({
  id,
  label,
  value,
  range,
  format,
  hint,
  onPick,
}: {
  id: string;
  label: string;
  value: number;
  range: { min: number; max: number; step: number };
  format: (value: number) => string;
  hint?: string;
  onPick: (value: number) => void;
}) {
  return (
    <Field label={`${label}: ${format(value)}`} htmlFor={id} hint={hint}>
      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onPick(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </Field>
  );
}

// The settings of the Shop section, shown in Customize, Sections, Shop.
// Size shows only for Centered + Grid. The Stack photo block shows only for Full width + Stack or Stack slide.
export function ShopControls({
  style,
  onChange,
}: {
  style: SiteStyle;
  onChange: (patch: Partial<SiteStyle>) => void;
}) {
  const wide = style.shopMode === "full";
  const stacked = wide && (style.shopWideView === "stack" || style.shopWideView === "stackslide");
  const cropped = style.shopStackRatio === "wide" || style.shopStackRatio === "ultra";
  return (
    <>
      <Choice
        label="Mode on Home"
        list={designModes}
        labels={designModeLabels}
        value={style.shopMode}
        hint={designModeHints[style.shopMode]}
        onPick={(shopMode) => onChange({ shopMode })}
      />
      {wide ? (
        <Choice
          label="Layout on Home"
          list={shopWideViews}
          labels={shopWideViewLabels}
          value={style.shopWideView}
          hint={shopWideViewHints[style.shopWideView]}
          onPick={(shopWideView) => onChange({ shopWideView })}
        />
      ) : (
        <Choice
          label="Layout on Home"
          list={shopViews}
          labels={shopViewLabels}
          value={style.shopView}
          hint={shopViewHints[style.shopView]}
          onPick={(shopView) => onChange({ shopView })}
        />
      )}
      {!wide && style.shopView === "grid" && (
        <Choice
          label="Size on Home"
          list={writingSizes}
          labels={writingSizeLabels}
          value={style.shopSize}
          hint={shopSizeHints[style.shopSize]}
          onPick={(shopSize) => onChange({ shopSize })}
        />
      )}
      {stacked && (
        <div className="flex flex-col gap-4 border-t border-line pt-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Stack photo</span>
          <Range
            id="ui_shop_media"
            label="Photo height"
            value={style.shopMedia}
            range={styleRanges.shopMedia}
            format={(v) => (v === 0 ? "Auto" : `${v} rem`)}
            hint="Height of the photo. Auto is 16:9."
            onPick={(shopMedia) => onChange({ shopMedia })}
          />
          <Choice
            label="Ratio"
            list={stackRatios}
            labels={stackRatioLabels}
            value={style.shopStackRatio}
            hint={stackRatioHints[style.shopStackRatio]}
            onPick={(shopStackRatio) => onChange({ shopStackRatio })}
          />
          {cropped && (
            <Range
              id="ui_shop_stack_crop"
              label="Crop position"
              value={style.shopStackCrop}
              range={styleRanges.stackCrop}
              format={(v) => `${v}`}
              hint="Which part of the photo shows. 0 is the top, 100 is the bottom."
              onPick={(shopStackCrop) => onChange({ shopStackCrop })}
            />
          )}
        </div>
      )}
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <Choice
          label="Title place"
          list={designTitleAligns}
          labels={designTitleAlignLabels}
          value={style.shopTitleAlign}
          hint={designTitleAlignHints[style.shopTitleAlign]}
          onPick={(shopTitleAlign) => onChange({ shopTitleAlign })}
        />
        <FontSelect
          id="ui_shop_title_font"
          label="Title font"
          value={style.shopTitleFont}
          hint="Default is the small label. Pick a font or a size to turn the title into a big heading."
          onPick={(shopTitleFont) => onChange({ shopTitleFont })}
        />
        <Choice
          label="Title size"
          list={designTitleSizes}
          labels={designTitleSizeLabels}
          value={style.shopTitleSize}
          onPick={(shopTitleSize) => onChange({ shopTitleSize })}
        />
      </div>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Text under the title</span>
        <FontSelect
          id="ui_shop_intro_font"
          label="Font"
          value={style.shopIntroFont}
          hint="Default is the font of the site. The text itself is written in Pages, tab Home, Section titles."
          onPick={(shopIntroFont) => onChange({ shopIntroFont })}
        />
        <Choice
          label="Size"
          list={designIntroSizes}
          labels={designIntroSizeLabels}
          value={style.shopIntroSize}
          hint="Auto follows the size of the title."
          onPick={(shopIntroSize) => onChange({ shopIntroSize })}
        />
      </div>
    </>
  );
}