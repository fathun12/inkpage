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
  visitSizeHints,
  visitSizeLabels,
  visitSizes,
  visitViewHints,
  visitViewLabels,
  visitViews,
  visitWideViewHints,
  visitWideViewLabels,
  visitWideViews,
} from "@/config/layout";
import type { SiteStyle } from "@/config/site-style";
import { Choice, FontSelect } from "./GithubControls";

// The settings of the Visit website section, shown in Customize, Sections, Visit website.
// No Ratio, Crop or Photo height: the cards have no photos. Size shows only for Centered + Grid.
export function VisitControls({
  style,
  onChange,
}: {
  style: SiteStyle;
  onChange: (patch: Partial<SiteStyle>) => void;
}) {
  const wide = style.visitMode === "full";
  return (
    <>
      <Choice
        label="Mode on Home"
        list={designModes}
        labels={designModeLabels}
        value={style.visitMode}
        hint={designModeHints[style.visitMode]}
        onPick={(visitMode) => onChange({ visitMode })}
      />
      {wide ? (
        <Choice
          label="Layout on Home"
          list={visitWideViews}
          labels={visitWideViewLabels}
          value={style.visitWideView}
          hint={visitWideViewHints[style.visitWideView]}
          onPick={(visitWideView) => onChange({ visitWideView })}
        />
      ) : (
        <Choice
          label="Layout on Home"
          list={visitViews}
          labels={visitViewLabels}
          value={style.visitView}
          hint={visitViewHints[style.visitView]}
          onPick={(visitView) => onChange({ visitView })}
        />
      )}
      {!wide && style.visitView === "grid" && (
        <Choice
          label="Size on Home"
          list={visitSizes}
          labels={visitSizeLabels}
          value={style.visitSize}
          hint={visitSizeHints[style.visitSize]}
          onPick={(visitSize) => onChange({ visitSize })}
        />
      )}
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <Choice
          label="Title place"
          list={designTitleAligns}
          labels={designTitleAlignLabels}
          value={style.visitTitleAlign}
          hint={designTitleAlignHints[style.visitTitleAlign]}
          onPick={(visitTitleAlign) => onChange({ visitTitleAlign })}
        />
        <FontSelect
          id="ui_visit_title_font"
          label="Title font"
          value={style.visitTitleFont}
          hint="Default is the small label. Pick a font or a size to turn the title into a big heading."
          onPick={(visitTitleFont) => onChange({ visitTitleFont })}
        />
        <Choice
          label="Title size"
          list={designTitleSizes}
          labels={designTitleSizeLabels}
          value={style.visitTitleSize}
          onPick={(visitTitleSize) => onChange({ visitTitleSize })}
        />
      </div>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Text under the title</span>
        <FontSelect
          id="ui_visit_intro_font"
          label="Font"
          value={style.visitIntroFont}
          hint="Default is the font of the site. The text itself is written in Pages, tab Home."
          onPick={(visitIntroFont) => onChange({ visitIntroFont })}
        />
        <Choice
          label="Size"
          list={designIntroSizes}
          labels={designIntroSizeLabels}
          value={style.visitIntroSize}
          hint="Auto follows the size of the title."
          onPick={(visitIntroSize) => onChange({ visitIntroSize })}
        />
      </div>
    </>
  );
}