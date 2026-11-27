import { Img } from "@/components/ui/Img";
import type { SteamData, SteamGame } from "@/types/steam";
import { Reveal } from "./Reveal";

const button =
  "inline-flex items-center gap-2 border border-ink px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors duration-(--dur-base) hover:bg-ink hover:text-bg";

function hours(minutes: number): string {
  if (minutes < 60) return minutes > 0 ? "<1 h" : "0 h";
  const h = minutes / 60;
  return h >= 100 ? `${Math.round(h).toLocaleString("en-US")} h` : `${Math.round(h * 10) / 10} h`;
}

function GameList({
  title,
  games,
  detail,
}: {
  title: string;
  games: SteamGame[];
  detail: (game: SteamGame) => string;
}) {
  if (games.length === 0) return null;
  return (
    <div>
      <h3 className="font-mono text-[11px] font-normal uppercase tracking-widest text-ink-soft">{title}</h3>
      <ul className="mt-3 border-t border-line">
        {games.map((game) => (
          <li key={game.appid} className="border-b border-line">
            <a
              href={`https://store.steampowered.com/app/${game.appid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-4 py-3"
            >
              <span className="min-w-0 truncate font-display text-lg leading-tight underline-offset-4 group-hover:underline">
                {game.name}
              </span>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                {detail(game)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// The Steam section of the About page: the profile on the left, recent and most played games on the right.
// It only appears when Steam answered.
export function AboutSteam({ data }: { data: SteamData }) {
  const status =
    data.state === "playing" ? `Playing ${data.playing}` : data.state === "online" ? "Online" : "Offline";
  return (
    <section aria-label="Steam" className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
      <div className="border-t border-line pt-8">
        <Reveal>
          <h2 className="font-mono text-xs font-normal uppercase tracking-widest text-ink-soft">Steam</h2>
        </Reveal>
        <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Reveal variant="still">
            <Img src={data.avatar} alt={`Steam avatar of ${data.name}`} className="size-24 object-cover" />
            <p className="mt-4 font-display text-2xl leading-tight">{data.name}</p>
            <p className="mt-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
              <span
                aria-hidden
                className={`size-1.5 shrink-0 rounded-full ${data.state === "offline" ? "border border-ink" : "bg-accent"}`}
              />
              <span className="min-w-0 truncate">{status}</span>
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-ink-soft">
              {[
                data.level !== null ? `Level ${data.level}` : null,
                data.owned > 0 ? `${data.owned.toLocaleString("en-US")} games` : null,
                data.totalMinutes > 0 ? `${hours(data.totalMinutes)} played` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <span className="mt-5 flex flex-wrap gap-3">
              <a href={data.href} target="_blank" rel="noopener noreferrer" className={button}>
                Steam profile ↗
              </a>
            </span>
          </Reveal>
          <Reveal variant="still" delay={120} className="flex flex-col gap-8">
            <GameList title="Recently played" games={data.recent} detail={(g) => `${hours(g.recentMinutes)} in 2 weeks`} />
            <GameList title="Most played" games={data.top} detail={(g) => `${hours(g.totalMinutes)} total`} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}