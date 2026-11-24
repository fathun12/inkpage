import type { CSSProperties, ReactNode } from "react";
import { Credit } from "@/components/ui/Credit";
import { Img } from "@/components/ui/Img";
import { customPalette, plainBackground, type BackgroundView } from "@/config/background";
import { cardDefaults, type CardStyle } from "@/config/card";
import { customThemeDefaults, customThemePalette, type CustomTheme } from "@/config/custom-theme";
import { defaultFonts, fontStyle, type FontPair } from "@/config/font-choices";
import type { ThemeName } from "@/config/site";
import { isGifUrl } from "@/config/video";
import { cardVars } from "@/lib/card-style";
import { GlassDefs } from "./GlassDefs";

type Props = {
  theme: ThemeName;
  customTheme?: CustomTheme;
  background?: BackgroundView;
  fonts?: FontPair;
  card?: CardStyle;
  children: ReactNode;
};

// A color (the fade color, or the theme color) at a given strength (0 to 100).
function mix(color: string, percent: number) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return `color-mix(in srgb, ${color} ${p}%, transparent)`;
}

// Full page photo and video: it melts into the fade color (the theme color unless you picked
// one) at the top or the bottom. "Fade strength" (tint) sets how strong the fade is, "Fade reach"
// sets how much of the page it covers, counted from the faded end (100 = the whole page).
function fullFade(tint: number, fade: "top" | "bottom", fadeColor: string | null, reach: number) {
  const base = fadeColor ?? "var(--c-bg)";
  const r = Math.max(20, Math.min(100, reach));
  const start = 100 - r;
  const at = (share: number) => `${(start + r * share).toFixed(1)}%`;
  const clear = mix(base, tint * 0.15);
  const mid = mix(base, tint * 0.9);
  const end = mix(base, Math.min(100, 70 + tint * 0.5));
  const dir = fade === "bottom" ? "to bottom" : "to top";
  return `linear-gradient(${dir}, ${clear} 0%, ${clear} ${at(0)}, ${mid} ${at(0.4)}, ${end} ${at(0.88)})`;
}

export function PublicFrame({
  theme,
  customTheme = customThemeDefaults,
  background = plainBackground,
  fonts = defaultFonts,
  card = cardDefaults,
  children,
}: Props) {
  const { mode, fade, imageUrl, videoUrl, tint, gray, color, color2, angle, fadeColor, fadeReach } = background;
  const photo = gray ? "grayscale" : "";
  const full = mode === "full" && imageUrl;
  const banner = mode === "banner" && imageUrl;
  const frame = mode === "frame" && imageUrl;
  const video = mode === "video" && videoUrl;
  const fadeLayer = fullFade(tint, fade, fadeColor, fadeReach);

  // The "Custom" theme sets its colors here. Solid and Gradient backgrounds still override them.
  const themeStyle = theme === "custom" ? customThemePalette(customTheme) : undefined;

  let style: CSSProperties | undefined;
  if (mode === "solid") style = customPalette([color]);
  if (mode === "gradient") {
    style = {
      ...customPalette([color, color2]),
      backgroundImage: `linear-gradient(${angle}deg, ${color}, ${color2})`,
    };
  }

  return (
    <div
      data-theme={theme}
      data-card={card.kind}
      style={{ ...themeStyle, ...fontStyle(fonts), ...cardVars(card), ...style }}
      className="relative min-h-screen bg-bg font-body text-ink [font-synthesis-weight:none]"
    >
      <GlassDefs card={card} />
      {full && (
        <>
          <Img src={imageUrl} loading="eager" className={`fixed inset-0 size-full object-cover ${photo}`} />
          <div aria-hidden className="fixed inset-0" style={{ backgroundImage: fadeLayer }} />
        </>
      )}
      {video && (
        <>
          {isGifUrl(videoUrl) ? (
            <Img
              src={videoUrl}
              loading="eager"
              className={`fixed inset-0 size-full object-cover motion-reduce:hidden ${photo}`}
            />
          ) : (
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden
              className={`fixed inset-0 size-full object-cover motion-reduce:hidden ${photo}`}
            />
          )}
          <div aria-hidden className="fixed inset-0" style={{ backgroundImage: fadeLayer }} />
        </>
      )}
      {banner && (
        <Img
          src={imageUrl}
          loading="eager"
          className={`relative h-56 w-full rounded-b-lg object-cover sm:h-72 ${photo}`}
        />
      )}
      <main
        className={`relative mx-auto flex w-full max-w-xl flex-col gap-8 px-5 pb-16 ${banner ? "pt-10" : "pt-14"}`}
      >
        {frame && (
          <div className="relative mb-3 mr-3">
            <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rounded-lg bg-accent" />
            <Img
              src={imageUrl}
              loading="eager"
              className={`relative aspect-[4/3] w-full rounded-lg object-cover ${photo}`}
            />
          </div>
        )}
        {children}
        <footer className="pt-6 text-center text-xs text-ink-soft">
          <Credit />
        </footer>
      </main>
    </div>
  );
}