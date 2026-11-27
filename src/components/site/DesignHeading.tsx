import type { CSSProperties } from "react";
import { fontChoices } from "@/config/font-choices";
import type { DesignFont, DesignIntroSize, DesignTitleAlign, DesignTitleSize } from "@/config/layout";
import { Reveal } from "./Reveal";

// Size of the title when it is a heading. The clamp shrinks it on a phone so a big title never runs off the screen.
const titleSizes: Record<Exclude<DesignTitleSize, "auto">, string> = {
  small: "clamp(1.25rem, 3.5vw, 1.75rem)",
  medium: "clamp(1.75rem, 5vw, 2.75rem)",
  large: "clamp(2.25rem, 8vw, 4.5rem)",
  huge: "clamp(3rem, 12vw, 7rem)",
  giant: "clamp(3.5rem, 17vw, 11rem)",
};

// The text under the title at Auto size follows the size of the title, so the two always go together.
const introAuto: Record<DesignTitleSize, string> = {
  auto: "1rem",
  small: "0.9375rem",
  medium: "1rem",
  large: "1.125rem",
  huge: "1.25rem",
  giant: "1.5rem",
};

const introSizes: Record<Exclude<DesignIntroSize, "auto">, string> = {
  small: "0.875rem",
  medium: "1.125rem",
  large: "clamp(1.25rem, 2.4vw, 1.75rem)",
};

// A chosen font. "default" gives nothing, so the text keeps the font it already has.
function family(font: DesignFont): string | undefined {
  return font === "default" ? undefined : `var(${fontChoices[font].cssVar}), system-ui, sans-serif`;
}

type Props = {
  title: string;
  href: string | null;
  intro: string | null;
  align: DesignTitleAlign;
  font: DesignFont;
  size: DesignTitleSize;
  introFont: DesignFont;
  introSize: DesignIntroSize;
  // "band": the section sits on the Secondary color, so the text uses the color of the band.
  tone?: "page" | "band";
};

// The title of the Design projects section, the text under it and the "Visit website" link.
// Default (Centered, Default font, Auto size) = the small label inside the page margins, as before.
// Left edge, Right edge and Full stick to the edges of the screen, like the hero and the footer.
export function DesignHeading({ title, href, intro, align, font, size, introFont, introSize, tone = "page" }: Props) {
  const styled = font !== "default" || size !== "auto";
  const titleStyle: CSSProperties | undefined = styled
    ? { fontFamily: family(font), fontSize: titleSizes[size === "auto" ? "medium" : size] }
    : undefined;
  const titleClass = styled
    ? `${font === "default" ? "font-display " : ""}break-words leading-[1.05] tracking-tight`
    : "font-mono text-xs uppercase tracking-widest opacity-70";
  const textStyle: CSSProperties = {
    fontFamily: family(introFont),
    fontSize: introSize === "auto" ? introAuto[size] : introSizes[introSize],
  };

  const titleEl = (
    <Reveal>
      <h2 className={titleClass} style={titleStyle}>
        {title}
      </h2>
    </Reveal>
  );

  const introEl = intro ? (
    <Reveal>
      <p
        className={`max-w-xl whitespace-pre-line leading-snug ${tone === "band" ? "opacity-70" : "text-ink-soft"} ${
          align === "right" ? "ml-auto text-right" : align === "full" ? "md:text-right" : ""
        }`}
        style={textStyle}
      >
        {intro}
      </p>
    </Reveal>
  ) : null;

  const visitEl = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs uppercase tracking-widest underline decoration-accent decoration-1 underline-offset-4 transition-colors duration-(--dur-base) hover:text-accent"
    >
      Visit website ↗
    </a>
  ) : null;

  if (align === "full") {
    return (
      <div className="grid gap-x-10 gap-y-5 px-5 pb-8 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:items-end">
        <div className="min-w-0">{titleEl}</div>
        {(introEl || visitEl) && (
          <div className="flex min-w-0 flex-col items-start gap-4 md:items-end">
            {introEl}
            {visitEl}
          </div>
        )}
      </div>
    );
  }

  if (align === "right") {
    return (
      <div className="px-5 pb-8 sm:px-8">
        <div className="flex flex-row-reverse items-end justify-between gap-4">
          <div className="min-w-0 text-right">{titleEl}</div>
          {visitEl}
        </div>
        {introEl && <div className="mt-4">{introEl}</div>}
      </div>
    );
  }

  return (
    <div className={`px-5 pb-8 sm:px-8 ${align === "center" ? "mx-auto max-w-5xl" : ""}`}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">{titleEl}</div>
        {visitEl}
      </div>
      {introEl && <div className="mt-4">{introEl}</div>}
    </div>
  );
}