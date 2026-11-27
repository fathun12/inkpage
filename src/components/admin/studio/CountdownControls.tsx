import type { ReactNode } from "react";
import {
  countdownWideViewHints,
  countdownWideViewLabels,
  countdownWideViews,
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
} from "@/config/layout";
import type { SiteStyle } from "@/config/site-style";
import { Choice, FontSelect } from "./GithubControls";

// The settings of the Countdown section, shown in Customize, Sections, Countdown.
// "children" is the Centered layout choice that was already there (Section, Strip, Clock).
// No Size, Ratio, Crop or Photo height: the countdown has no photos. It does not slide either.
export function CountdownControls({
  style,
  onChange,
  children,
}: {
  style: SiteStyle;
  onChange: (patch: Partial<SiteStyle>) => void;
  children: ReactNode;
}) {
  const wide = style.countdownMode === "full";
  const thin = wide ? style.countdownWideView === "edge" : style.countdownView === "strip";
  return (
    <>
      <Choice
        label="Mode on Home"
        list={designModes}
        labels={designModeLabels}
        value={style.countdownMode}
        hint={designModeHints[style.countdownMode]}
        onPick={(countdownMode) => onChange({ countdownMode })}
      />
      {wide ? (
        <Choice
          label="Layout on Home"
          list={countdownWideViews}
          labels={countdownWideViewLabels}
          value={style.countdownWideView}
          hint={countdownWideViewHints[style.countdownWideView]}
          onPick={(countdownWideView) => onChange({ countdownWideView })}
        />
      ) : (
        children
      )}
      {thin ? (
        <p className="border-t border-line pt-4 text-xs text-ink-soft">
          A thin line has no big title and no text under it, so Title and Text under the title show only for the
          other layouts.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4 border-t border-line pt-4">
            <Choice
              label="Title place"
              list={designTitleAligns}
              labels={designTitleAlignLabels}
              value={style.countdownTitleAlign}
              hint={designTitleAlignHints[style.countdownTitleAlign]}
              onPick={(countdownTitleAlign) => onChange({ countdownTitleAlign })}
            />
            <FontSelect
              id="ui_countdown_title_font"
              label="Title font"
              value={style.countdownTitleFont}
              hint="The title is the name of your countdown. Default is the big title as before."
              onPick={(countdownTitleFont) => onChange({ countdownTitleFont })}
            />
            <Choice
              label="Title size"
              list={designTitleSizes}
              labels={designTitleSizeLabels}
              value={style.countdownTitleSize}
              onPick={(countdownTitleSize) => onChange({ countdownTitleSize })}
            />
          </div>
          <div className="flex flex-col gap-4 border-t border-line pt-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Text under the title</span>
            <FontSelect
              id="ui_countdown_intro_font"
              label="Font"
              value={style.countdownIntroFont}
              hint="Default is the font of the site. The text itself is the description of your countdown."
              onPick={(countdownIntroFont) => onChange({ countdownIntroFont })}
            />
            <Choice
              label="Size"
              list={designIntroSizes}
              labels={designIntroSizeLabels}
              value={style.countdownIntroSize}
              hint="Auto follows the size of the title."
              onPick={(countdownIntroSize) => onChange({ countdownIntroSize })}
            />
          </div>
        </>
      )}
    </>
  );
}