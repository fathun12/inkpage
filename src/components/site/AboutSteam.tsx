import type { CSSProperties } from "react";
import { Img } from "@/components/ui/Img";
import type { SteamBackground, SteamLayout, SteamMode } from "@/config/about-style";
import { mediaKind } from "@/lib/site-view";
import { cn } from "@/lib/utils";
import type { SteamData, SteamGame } from "@/types/steam";
import { Credit } from "./Credit";
import { Reveal } from "./Reveal";

// How the Steam section looks (Customize, About page, Steam) and the media saved in Pages, About tab.
export type SteamLook = {
  mode: SteamMode;
  layout: SteamLayout;
  background: SteamBackground;
  opacity: number;
  position: number;
  media: string | null;
  credit: string | null;
};

type Tone = { box: string; soft: string; rule: string; ruleStyle?: CSSProperties; button: string };

const mixed: CSSProperties = { borderColor: "color-mix(in srgb, currentColor 22%, transparent)" };

const buttonBase =
  "inline-flex items-center gap-2 border px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors duration-(--dur-base)";

// Colors for each background. Media sits on the Secondary color, so it uses the same tone as Secondary.
const tones: Record<"page" | "tertiary" | "band", Tone> = {
  page: {
    box: "",
    soft: "text-ink-soft",
    rule: "border-line",
    button: `${buttonBase} border-ink hover:bg-ink hover:text-bg`,
  },
  tertiary: {
    box: "bg-tertiary text-tertiary-ink",
    soft: "opacity-70",
    rule: "",
    ruleStyle: mixed,
    button: `${buttonBase} border-tertiary-ink hover:bg-tertiary-ink hover:text-tertiary`,
  },
  band: {
    box: "bg-band text-band-ink",
    soft: "opacity-70",
    rule: "",
    ruleStyle: mixed,
    button: `${buttonBase} border-band-ink hover:bg-band-ink hover:text-band`,
  },
};

function hours(minutes: number): string {
  if (minutes < 60) return minutes > 0 ? "<1 h" : "0 h";
  const h = minutes / 60;
  return h >= 100 ? `${Math.round(h).toLocaleString("en-US")} h` : `${Math.round(h * 10) / 10} h`;
}

function GameList({
  title,
  games,
  detail,
  tone,
}: {
  title: string;
  games: SteamGame[];
  detail: (game: SteamGame) => string;
  tone: Tone;
}) {
  if (games.length === 0) return null;
  return (
    <div>
      <h3 className={cn("font-mono text-[11px] font-normal uppercase tracking-widest", tone.soft)}>{title}</h3>
      <ul className={cn("mt-3 border-t", tone.rule)} style={tone.ruleStyle}>
        {games.map((game) => (
          <li key={game.appid} className={cn("border-b", tone.rule)} style={tone.ruleStyle}>
            <a
              href={`https://store.steampowered.com/app/${game.appid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-4 py-3"
            >
              <span className="min-w-0 truncate font-display text-lg leading-tight underline-offset-4 group-hover:underline">
                {game.name}
              </span>
              <span className={cn("shrink-0 font-mono text-[10px] uppercase tracking-widest", tone.soft)}>
                {detail(game)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// The Steam section of the About page. It only appears when Steam answered.
// The background (page, Tertiary, Secondary or your media) always runs edge to edge. Mode decides if the text
// stays inside the page margins (Centered) or goes edge to edge (Full width).
export function AboutSteam({
  data,
  look,
  title = "Steam",
}: {
  data: SteamData;
  look: SteamLook;
  title?: string;
}) {
  const media = look.background === "media" && look.media ? look.media : null;
  const tone = tones[look.background === "page" ? "page" : look.background === "tertiary" ? "tertiary" : "band"];
  const painted = look.background !== "page";
  const full = look.mode === "full";
  const stack = look.layout === "stack";
  const status =
    data.state === "playing" ? `Playing ${data.playing}` : data.state === "online" ? "Online" : "Offline";

  const avatar = (
    <Img src={data.avatar} alt={`Steam avatar of ${data.name}`} className="size-24 shrink-0 object-cover" />
  );
  const info = (
    <div className="min-w-0">
      <p className="font-display text-2xl leading-tight">{data.name}</p>
      <p className="mt-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
        <span
          aria-hidden
          style={data.state === "offline" ? { borderColor: "currentColor" } : undefined}
          className={`size-1.5 shrink-0 rounded-full ${data.state === "offline" ? "border" : "bg-accent"}`}
        />
        <span className="min-w-0 truncate">{status}</span>
      </p>
      <p className={cn("mt-3 font-mono text-xs uppercase tracking-widest", tone.soft)}>
        {[
          data.level !== null ? `Level ${data.level}` : null,
          data.owned > 0 ? `${data.owned.toLocaleString("en-US")} games` : null,
          data.totalMinutes > 0 ? `${hours(data.totalMinutes)} played` : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <span className="mt-5 flex flex-wrap gap-3">
        <a href={data.href} target="_blank" rel="noopener noreferrer" className={tone.button}>
          Steam profile ↗
        </a>
      </span>
    </div>
  );
  const lists = (
    <>
      <GameList
        title="Recently played"
        games={data.recent}
        detail={(g) => `${hours(g.recentMinutes)} in 2 weeks`}
        tone={tone}
      />
      <GameList title="Most played" games={data.top} detail={(g) => `${hours(g.totalMinutes)} total`} tone={tone} />
    </>
  );

  const mediaClass = "absolute inset-0 size-full object-cover motion-reduce:hidden";
  const mediaStyle: CSSProperties = { opacity: look.opacity / 100, objectPosition: `50% ${look.position}%` };

  return (
    <section aria-label={title} className={cn("relative overflow-hidden", tone.box)}>
      {media && (
        <div aria-hidden className="absolute inset-0">
          {mediaKind(media) === "video" ? (
            <video src={media} autoPlay muted loop playsInline preload="metadata" className={mediaClass} style={mediaStyle} />
          ) : (
            <Img src={media} className={mediaClass} style={mediaStyle} />
          )}
        </div>
      )}
      <div className={cn("relative px-5 pb-24 sm:px-8", !full && "mx-auto max-w-5xl", painted && "pt-14")}>
        <div className={cn("border-t pt-8", tone.rule)} style={tone.ruleStyle}>
          <Reveal>
            <h2 className={cn("font-mono text-xs font-normal uppercase tracking-widest", tone.soft)}>{title}</h2>
          </Reveal>
          {stack ? (
            <div className="mt-8 flex flex-col gap-10">
              <Reveal variant="still" className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                {avatar}
                {info}
              </Reveal>
              <Reveal variant="still" delay={120} className="grid gap-8 md:grid-cols-2 md:gap-12">
                {lists}
              </Reveal>
            </div>
          ) : (
            <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <Reveal variant="still">
                {avatar}
                <div className="mt-4">{info}</div>
              </Reveal>
              <Reveal variant="still" delay={120} className="flex flex-col gap-8">
                {lists}
              </Reveal>
            </div>
          )}
        </div>
      </div>
      {media && <Credit text={look.credit} />}
    </section>
  );
}