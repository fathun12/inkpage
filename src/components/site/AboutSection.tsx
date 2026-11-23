import { Img } from "@/components/ui/Img";
import { Reveal } from "./Reveal";

type Props = { body: string | null; photo: string | null };

export function AboutSection({ body, photo }: Props) {
  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-5 pb-24 pt-4 sm:px-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {photo && (
        <Reveal variant="still">
          <Img src={photo} className="site-media-reveal aspect-[4/5] w-full object-cover" />
        </Reveal>
      )}
      {body && (
        <Reveal delay={120} className={photo ? "" : "max-w-2xl md:col-span-2"}>
          <p className="whitespace-pre-line text-lg leading-relaxed">{body}</p>
        </Reveal>
      )}
    </section>
  );
}