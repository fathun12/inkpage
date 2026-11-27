import { Img } from "@/components/ui/Img";
import type { AboutLayout, AboutPhotoShape } from "@/config/about-style";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type Props = {
  name?: string | null;
  bio?: string | null;
  body: string | null;
  photo: string | null;
  layout?: AboutLayout;
  shape?: AboutPhotoShape;
};

const shapeClass: Record<AboutPhotoShape, string> = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  landscape: "aspect-[3/2]",
};

// The photo and the text. Photo left is the original look. Customize can flip it, or put the photo on top.
export function AboutSection({ name, bio, body, photo, layout = "split", shape = "portrait" }: Props) {
  const hasText = Boolean(name || bio || body);
  const stack = layout === "stack";
  const columns = stack
    ? ""
    : layout === "flip"
      ? "md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
      : "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]";
  const textClass = stack ? "max-w-2xl" : photo ? "" : "max-w-2xl md:col-span-2";
  return (
    <section className={cn("mx-auto grid max-w-5xl gap-10 px-5 pb-24 pt-4 sm:px-8", columns)}>
      {photo && (
        <Reveal variant="still" className={layout === "flip" ? "md:order-2" : undefined}>
          <Img
            src={photo}
            className={cn(
              "site-media-reveal w-full object-cover",
              shapeClass[shape],
              stack && shape !== "landscape" && "max-w-md",
            )}
          />
        </Reveal>
      )}
      {hasText && (
        <Reveal delay={120} className={textClass}>
          {name && <h2 className="font-display text-3xl leading-tight sm:text-4xl">{name}</h2>}
          {bio && (
            <p className={`${name ? "mt-3" : ""} whitespace-pre-line text-ink-soft`}>{bio}</p>
          )}
          {body && (
            <p
              className={`${name || bio ? "mt-8" : ""} whitespace-pre-line text-lg leading-relaxed`}
            >
              {body}
            </p>
          )}
        </Reveal>
      )}
    </section>
  );
}