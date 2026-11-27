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
  linksViewHints,
  linksViewLabels,
  linksViews,
  linksWideViewHints,
  linksWideViewLabels,
  linksWideViews,
} from "@/config/layout";
import type { SiteStyle } from "@/config/site-style";
import { Choice, FontSelect } from "./GithubControls";

// The settings of the Links section, shown in Customize, Sections, Links.
// No Size, Ratio, Crop or Photo height: this section is a list of titles over one background media.
export function LinksControls({
  style,
  onChange,
}: {
  style: SiteStyle;
  onChange: (patch: Partial<SiteStyle>) => void;
}) {
  const wide = style.linksMode === "full";
  return (
    <>
      <Choice
        label="Mode on Home"
        list={designModes}
        labels={designModeLabels}
        value={style.linksMode}
        hint={designModeHints[style.linksMode]}
        onPick={(linksMode) => onChange({ linksMode })}
      />
      {wide ? (
        <Choice
          label="Layout on Home"
          list={linksWideViews}
          labels={linksWideViewLabels}
          value={style.linksWideView}
          hint={linksWideViewHints[style.linksWideView]}
          onPick={(linksWideView) => onChange({ linksWideView })}
        />
      ) : (
        <Choice
          label="Layout on Home"
          list={linksViews}
          labels={linksViewLabels}
          value={style.linksView}
          hint={linksViewHints[style.linksView]}
          onPick={(linksView) => onChange({ linksView })}
        />
      )}
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <Choice
          label="Title place"
          list={designTitleAligns}
          labels={designTitleAlignLabels}
          value={style.linksTitleAlign}
          hint={designTitleAlignHints[style.linksTitleAlign]}
          onPick={(linksTitleAlign) => onChange({ linksTitleAlign })}
        />
        <FontSelect
          id="ui_links_title_font"
          label="Title font"
          value={style.linksTitleFont}
          hint="The title shows only when the Links label is filled in Pages, tab Home. Empty = no title (the original). Pick a font or a size to turn it into a big heading."
          onPick={(linksTitleFont) => onChange({ linksTitleFont })}
        />
        <Choice
          label="Title size"
          list={designTitleSizes}
          labels={designTitleSizeLabels}
          value={style.linksTitleSize}
          onPick={(linksTitleSize) => onChange({ linksTitleSize })}
        />
      </div>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Text under the title</span>
        <FontSelect
          id="ui_links_intro_font"
          label="Font"
          value={style.linksIntroFont}
          hint="Default is the font of the site. The text itself is written in Pages, tab Home."
          onPick={(linksIntroFont) => onChange({ linksIntroFont })}
        />
        <Choice
          label="Size"
          list={designIntroSizes}
          labels={designIntroSizeLabels}
          value={style.linksIntroSize}
          hint="Auto follows the size of the title."
          onPick={(linksIntroSize) => onChange({ linksIntroSize })}
        />
      </div>
    </>
  );
}