import type { ReactNode } from "react";
import { Img } from "@/components/ui/Img";
import { plainBackground, type BackgroundView } from "@/config/background";
import { siteConfig, type ThemeName } from "@/config/site";

type Props = { theme: ThemeName; background?: BackgroundView; children: ReactNode };

export function PublicFrame({ theme, background = plainBackground, children }: Props) {
  const { mode, imageUrl, tint, gray } = background;
  const photo = gray ? "grayscale" : "";
  const full = mode === "full" && imageUrl;
  const banner = mode === "banner" && imageUrl;
  const frame = mode === "frame" && imageUrl;

  return (
    <div data-theme={theme} className="relative min-h-screen bg-bg text-ink">
      {full && (
        <>
          <Img src={imageUrl} loading="eager" className={`fixed inset-0 size-full object-cover ${photo}`} />
          <div
            aria-hidden
            className="fixed inset-0"
            style={{ backgroundColor: `color-mix(in srgb, var(--c-bg) ${tint}%, transparent)` }}
          />
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