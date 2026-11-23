import type { ReactNode } from "react";
import { customThemeDefaults, customThemePalette, type CustomTheme } from "@/config/custom-theme";
import { defaultFonts, fontStyle, type FontPair } from "@/config/font-choices";
import type { ThemeName } from "@/config/site";

type Props = {
  theme: ThemeName;
  customTheme?: CustomTheme;
  fonts?: FontPair;
  children: ReactNode;
};

// Theme, colors and fonts of the public website. No width limit: sections go edge to edge.
export function SiteFrame({ theme, customTheme = customThemeDefaults, fonts = defaultFonts, children }: Props) {
  const themeStyle = theme === "custom" ? customThemePalette(customTheme) : undefined;
  return (
    <div
      data-theme={theme}
      style={{ ...themeStyle, ...fontStyle(fonts) }}
      className="min-h-screen bg-bg font-body text-ink [font-synthesis-weight:none]"
    >
      {children}
    </div>
  );
}