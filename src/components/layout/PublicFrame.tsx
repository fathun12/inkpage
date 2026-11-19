import type { CSSProperties, ReactNode } from "react";
import { Img } from "@/components/ui/Img";
import { customPalette, plainBackground, type BackgroundView } from "@/config/background";
import { siteConfig, type ThemeName } from "@/config/site";

type Props = { theme: ThemeName; background?: BackgroundView; children: ReactNode };

// Theme color at a given strength (0 to 100), so the fade follows the chosen theme.
function mix(percent: number) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return `color-mix(in srgb, var(--c-bg) ${p}%, transparent)`;
}

// Full page photo: it melts into the theme color at the top or the bottom.
// "Photo overlay" sets how strong the fade is.
function fullFade(tint: number, fade: "top" | "bottom") {
  const clear = mix(tint * 0.15);
  const mid = mix(tint * 0.9);
  const end = mix(Math.min(100, 70 + tint * 0.5));
  const dir = fade === "bottom" ? "to bottom" : "to top";
  return `linear-gradient(${dir}, ${clear} 0%, ${mid} 40%, ${end} 88%)`;
}

export function PublicFrame({ theme, background = plainBackground, children }: Props) {
  const { mode, fade, imageUrl, tint, gray, color, color2, angle } = background;
  const photo = gray ? "grayscale" : "";
  const full = mode === "full" && imageUrl;
  const banner = mode === "banner" && imageUrl;
  const frame = mode === "frame" && imageUrl;

  let style: CSSProperties | undefined;
  if (mode === "solid") style = customPalette([color]);
  if (mode === "gradient") {
    style = {
      ...customPalette([color, color2]),
      backgroundImage: `linear-gradient(${angle}deg, ${color}, ${color2})`,
    };
  }

  return (
    <div data-theme={theme} style={style} className="relative min-h-screen bg-bg text-ink">
      {full && (
        <>
          <Img src={imageUrl} loading="eager" className={`fixed inset-0 size-full object-cover ${photo}`} />
          <div aria-hidden className="fixed inset-0" style={{ backgroundImage: fullFade(tint, fade) }} />
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
        <footer className="pt-6 text-center text-xs text-ink-soft">Made with {siteConfig.name}</footer>
      </main>
    </div>
  );
}