import type { CSSProperties, ReactNode } from "react";
import { defaultFonts, fontStyle, type FontPair } from "@/config/font-choices";
import { sitePalette, siteDarkPalette, siteStyleDefaults, type SiteStyle } from "@/config/site-style";

type Props = {
  fonts?: FontPair;
  style?: SiteStyle;
  // Only the Customize preview sets this: the height that counts as "one screen".
  viewportHeight?: string;
  // Only the Customize preview sets this: dark mode then applies to this box only.
  mode?: "system" | "light" | "dark";
  children: ReactNode;
};

// Colors (light and dark), fonts and motion of the public website. No width limit: sections go edge to edge.
export function SiteFrame({
  fonts = defaultFonts,
  style = siteStyleDefaults,
  viewportHeight,
  mode,
  children,
}: Props) {
  const vars = {
    ...sitePalette(style),
    ...siteDarkPalette(style),
    "--site-hero-overlay": String(style.heroOverlay / 100),
    "--site-hero-zoom": String(style.heroZoom / 100),
    "--site-veil": `${style.indexVeil}%`,
    ...(viewportHeight ? { "--site-vh": viewportHeight } : {}),
  } as CSSProperties;

  return (
    <div
      data-motion={style.motion}
      data-mode={mode}
      style={{ ...fontStyle(fonts), ...vars }}
      className="site-root min-h-screen bg-bg font-body text-ink [font-synthesis-weight:none]"
    >
      {children}
    </div>
  );
}