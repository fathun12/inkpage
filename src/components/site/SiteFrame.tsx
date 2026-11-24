import type { CSSProperties, ReactNode } from "react";
import { defaultFonts, fontStyle, type FontPair } from "@/config/font-choices";
import { sitePalette, siteStyleDefaults, type SiteStyle } from "@/config/site-style";

type Props = {
  fonts?: FontPair;
  style?: SiteStyle;
  // Only the Customize preview sets this: the height that counts as "one screen".
  viewportHeight?: string;
  children: ReactNode;
};

// Colors, fonts and motion of the public website. No width limit: sections go edge to edge.
export function SiteFrame({
  fonts = defaultFonts,
  style = siteStyleDefaults,
  viewportHeight,
  children,
}: Props) {
  const vars = {
    ...sitePalette(style),
    "--site-hero-overlay": String(style.heroOverlay / 100),
    "--site-veil": `${style.indexVeil}%`,
    ...(viewportHeight ? { "--site-vh": viewportHeight } : {}),
  } as CSSProperties;

  return (
    <div
      data-motion={style.motion}
      style={{ ...fontStyle(fonts), ...vars }}
      className="min-h-screen bg-bg font-body text-ink [font-synthesis-weight:none]"
    >
      {children}
    </div>
  );
}