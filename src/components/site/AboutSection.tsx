import { Img } from "@/components/ui/Img";
import { Reveal } from "./Reveal";

type Props = { name?: string | null; bio?: string | null; body: string | null; photo: string | null };

// Photo on the left. On the right: display name, bio, then the About text.
export function AboutSection({ name, bio, body, photo }: Props) {
  const hasText = Boolean(name || bio || body);
  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-5 pb-24 pt-4 sm:px-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {photo && (
        <Reveal variant="still">
          <Img src={photo} className="site-media-reveal aspect-[4/5] w-full object-cover" />
        </Reveal>
      )}
      {hasText && (
        <Reveal delay={120} className={photo ? "" : "max-w-2xl md:col-span-2"}>
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