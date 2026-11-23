import { Img } from "@/components/ui/Img";
import type { BackgroundView } from "@/config/background";
import { isGifUrl } from "@/config/video";

type Props = { background: BackgroundView; name: string; bio: string | null };

// Full width media (video, GIF or photo from the Customize background) with one small caption.
export function Hero({ background, name, bio }: Props) {
  const { mode, imageUrl, videoUrl, gray } = background;
  const video = mode === "video" && videoUrl ? videoUrl : null;
  const photo =
    !video && imageUrl && (mode === "full" || mode === "banner" || mode === "frame") ? imageUrl : null;
  const media = `site-hero-media absolute inset-0 size-full object-cover motion-reduce:hidden ${gray ? "grayscale" : ""}`;

  return (
    <section id="top" className="site-hero relative h-[calc(100svh-3.75rem)] min-h-[26rem] w-full overflow-hidden bg-ink">
      {video &&
        (isGifUrl(video) ? (
          <Img src={video} loading="eager" className={media} />
        ) : (
          <video src={video} autoPlay muted loop playsInline preload="auto" aria-hidden className={media} />
        ))}
      {photo && <Img src={photo} loading="eager" className={media} />}
      <div className="site-hero-caption absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 px-5 pb-8 text-center">
        <h1 className="font-display text-base font-medium">{name}</h1>
        {bio && <p className="max-w-md whitespace-pre-line text-sm opacity-80">{bio}</p>}
      </div>
    </section>
  );
}