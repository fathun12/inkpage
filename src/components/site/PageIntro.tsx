import { Reveal } from "./Reveal";

export function PageIntro({ title, intro }: { title: string; intro: string | null }) {
  return (
    <header className="mx-auto max-w-5xl px-5 pb-10 pt-16 sm:px-8 sm:pt-24">
      <Reveal>
        <h1 className="font-voice text-5xl leading-none sm:text-7xl">{title}</h1>
      </Reveal>
      {intro && (
        <Reveal delay={100}>
          <p className="mt-6 max-w-xl whitespace-pre-line text-ink-soft">{intro}</p>
        </Reveal>
      )}
    </header>
  );
}