import type { CSSProperties, ReactNode } from "react";
import { customThemeDefaults, customThemePalette, type CustomTheme } from "@/config/custom-theme";
import { defaultFonts, fontStyle, type FontPair } from "@/config/font-choices";
import type { ThemeName } from "@/config/site";
import { siteStyleDefaults, type SiteStyle } from "@/config/site-style";

type Props = {
  theme: ThemeName;
  customTheme?: CustomTheme;
  fonts?: FontPair;
  style?: SiteStyle;
  // Only the Customize preview sets this: the height that counts as "one screen".
  viewportHeight?: string;
  children: ReactNode;
};

// Theme, colors, fonts and motion of the public website. No width limit: sections go edge to edge.
export function SiteFrame({
  theme,
  customTheme = customThemeDefaults,
  fonts = defaultFonts,
  style = siteStyleDefaults,
  viewportHeight,
  children,
}: Props) {
  const themeStyle = theme === "custom" ? customThemePalette(customTheme) : undefined;
  const vars = {
    "--site-hero-overlay": String(style.heroOverlay / 100),
    "--site-veil": `${style.indexVeil}%`,
    ...(viewportHeight ? { "--site-vh": viewportHeight } : {}),
  } as CSSProperties;

  return (
    <div
      data-theme={theme}
      data-motion={style.motion}
      style={{ ...themeStyle, ...fontStyle(fonts), ...vars }}
      className="min-h-screen bg-bg font-body text-ink [font-synthesis-weight:none]"
    >
      {children}
    </div>
  );
}