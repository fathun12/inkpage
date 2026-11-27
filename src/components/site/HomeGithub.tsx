import type { ReactNode } from "react";
import { Img } from "@/components/ui/Img";
import type {
  DesignFont,
  DesignIntroSize,
  DesignMode,
  DesignTitleAlign,
  DesignTitleSize,
  GithubView,
  GithubWideView,
} from "@/config/layout";
import type { GithubData, GithubRepo } from "@/types/github";
import { DesignHeading } from "./DesignHeading";
import { MediaSlider } from "./MediaSlider";
import { Reveal } from "./Reveal";

const button =
  "inline-flex items-center gap-2 border border-band-ink px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors duration-(--dur-base) hover:bg-band-ink hover:text-band";

const two = (n: number) => String(n).padStart(2, "0");

function meta(repo: GithubRepo): string {
  return [repo.language, repo.stars > 0 ? `${repo.stars} stars` : null, repo.updated].filter(Boolean).join(" · ");
}

function Status({ data }: { data: GithubData }) {
  const active = data.status === "active";
  return (
    <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
      <span aria-hidden className={`size-1.5 rounded-full ${active ? "bg-accent" : "border border-band-ink"}`} />
      {active ? "Active" : "Quiet"}
      {data.lastPush ? ` · last push ${data.lastPush}` : ""}
    </p>
  );
}

// The 30 days of public commits as thin bars. The height comes in through className.
function Bars({ data, className }: { data: GithubData; className: string }) {
  const max = Math.max(1, ...data.days);
  return (
    <div
      className={`flex items-end gap-[3px] ${className}`}
      role="img"
      aria-label={`${data.commits} public commits in the last 30 days`}
    >
      {data.days.map((n, i) => (
        <span
          key={i}
          className={`flex-1 ${n > 0 ? "bg-accent" : "bg-band-ink/15"}`}
          style={{ height: n > 0 ? `${Math.max(12, (n / max) * 100)}%` : "4px" }}
        />
      ))}
    </div>
  );
}

function Caption({ data }: { data: GithubData }) {
  return (
    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest opacity-60">
      {data.commits} commits in the last 30 days · public activity only
    </p>
  );
}

function Links({ data, className }: { data: GithubData; className: string }) {
  return (
    <span className={`flex flex-wrap gap-3 ${className}`}>
      <a href={data.href} target="_blank" rel="noopener noreferrer" className={button}>
        @{data.login} ↗
      </a>
      <a href={`${data.href}?tab=repositories`} target="_blank" rel="noopener noreferrer" className={button}>
        All repositories ↗
      </a>
    </span>
  );
}

// The big profile block (the original left column).
function Profile({ data }: { data: GithubData }) {
  return (
    <Reveal variant="still">
      <Img src={data.avatar} alt={`Avatar of ${data.login}`} className="size-24 object-cover" />
      <p className="mt-4 font-display text-2xl leading-tight">{data.name ?? data.login}</p>
      <p className="mt-1 font-mono text-xs uppercase tracking-widest opacity-70">@{data.login}</p>
      {data.bio && <p className="mt-3 text-sm opacity-70">{data.bio}</p>}
      <p className="mt-4 font-mono text-xs uppercase tracking-widest">
        {data.repos} repositories · {data.followers} followers
      </p>
      <Links data={data} className="mt-5" />
    </Reveal>
  );
}

// One line with a small avatar, the name and the buttons (Index, Stats, Edge index, Repo slide).
function Who({ data }: { data: GithubData }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
      <Img src={data.avatar} alt={`Avatar of ${data.login}`} className="size-12 object-cover" />
      <span className="min-w-0">
        <span className="block font-display text-xl leading-tight">{data.name ?? data.login}</span>
        <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest opacity-70">
          @{data.login} · {data.repos} repositories · {data.followers} followers
        </span>
      </span>
      <Links data={data} className="sm:ml-auto" />
    </div>
  );
}

// The original compact list of repositories.
function RepoList({ repos, className = "mt-8" }: { repos: GithubRepo[]; className?: string }) {
  if (repos.length === 0) return null;
  return (
    <ul className={`${className} border-t border-band-line`}>
      {repos.map((repo) => (
        <li key={repo.name} className="border-b border-band-line">
          <Reveal variant="still">
            <a
              href={repo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-4 py-4"
            >
              <span className="min-w-0">
                <span className="block font-display text-lg leading-tight underline-offset-4 group-hover:underline">
                  {repo.name}
                </span>
                {repo.description && (
                  <span className="mt-1 block line-clamp-1 text-sm opacity-70">{repo.description}</span>
                )}
              </span>
              <span className="shrink-0 text-right font-mono text-[10px] uppercase tracking-widest opacity-60">
                {meta(repo)}
              </span>
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// One repository per row with its name big. "edge" lets the rows and the lines run to the edges of the screen.
function Rows({ repos, edge }: { repos: GithubRepo[]; edge: boolean }) {
  if (repos.length === 0) return null;
  const pad = edge ? "px-5 sm:px-8" : "";
  return (
    <ul className="border-t border-band-line">
      {repos.map((repo, i) => (
        <li key={repo.name} className="border-b border-band-line">
          <Reveal variant="still">
            <a
              href={repo.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-1 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-baseline sm:py-6 ${pad}`}
            >
              <span className="font-mono text-[11px] tracking-widest opacity-60">{two(i + 1)}</span>
              <span className="min-w-0">
                <span className="block break-words font-display text-2xl leading-tight underline-offset-4 group-hover:underline sm:text-4xl">
                  {repo.name}
                </span>
                {repo.description && (
                  <span className="mt-1 block line-clamp-1 text-sm opacity-70">{repo.description}</span>
                )}
              </span>
              <span className="col-start-2 font-mono text-[10px] uppercase tracking-widest opacity-60 sm:col-auto sm:text-right">
                {meta(repo)}
              </span>
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// Centered, Profile: the original look.
function ProfileBody({ data }: { data: GithubData }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-5 sm:px-8 site-pb lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <Profile data={data} />
      </div>
      <div className="lg:col-span-8">
        <Reveal variant="still">
          <Status data={data} />
          <Bars data={data} className="mt-4 h-12" />
          <Caption data={data} />
        </Reveal>
        <RepoList repos={data.recent.slice(0, 4)} />
      </div>
    </div>
  );
}

// Centered, Index: a quiet table of contents of the repositories.
function Index({ data }: { data: GithubData }) {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 site-pb">
      <Reveal variant="still">
        <Who data={data} />
      </Reveal>
      <div className="mt-8">
        <Rows repos={data.recent} edge={false} />
      </div>
      <Reveal variant="still">
        <div className="mt-8">
          <Status data={data} />
          <Bars data={data} className="mt-3 h-6" />
          <Caption data={data} />
        </div>
      </Reveal>
    </div>
  );
}

// Centered, Stats: three huge numbers, tall bars and the newest repositories.
function Stats({ data }: { data: GithubData }) {
  const numbers = [
    { n: data.commits, label: "Commits, 30 days" },
    { n: data.repos, label: "Repositories" },
    { n: data.followers, label: "Followers" },
  ];
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 site-pb">
      <Reveal variant="still">
        <Who data={data} />
        <div className="mt-10 grid grid-cols-3 gap-4 border-t border-band-line pt-8">
          {numbers.map((item) => (
            <div key={item.label} className="min-w-0">
              <p className="font-display text-[clamp(2.25rem,13vw,8rem)] leading-none tabular-nums">{item.n}</p>
              <p className="mt-3 break-words font-mono text-[10px] uppercase tracking-widest opacity-70">
                {item.label}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Status data={data} />
          <Bars data={data} className="mt-4 h-28 sm:h-40" />
          <Caption data={data} />
        </div>
      </Reveal>
      <RepoList repos={data.recent.slice(0, 4)} />
    </div>
  );
}

// Full width, Pulse: the activity bars run from the left edge to the right edge of the screen.
function Pulse({ data }: { data: GithubData }) {
  return (
    <div className="site-pb">
      <Reveal variant="still">
        <div className="px-5 sm:px-8">
          <Status data={data} />
        </div>
        <Bars data={data} className="mt-4 h-44 sm:h-72" />
        <div className="px-5 sm:px-8">
          <Caption data={data} />
        </div>
      </Reveal>
      <div className="grid gap-10 px-5 pt-10 sm:px-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <Profile data={data} />
        </div>
        <div className="lg:col-span-8">
          <RepoList repos={data.recent} className="mt-0" />
        </div>
      </div>
    </div>
  );
}

// Full width, Repo slide: one repository at a time across the whole screen. It slides by itself.
function RepoSlide({ data, seconds }: { data: GithubData; seconds: number }) {
  const repos = data.recent;
  return (
    <div className="site-pb">
      {repos.length > 0 && (
        <MediaSlider count={repos.length} seconds={seconds} bleed>
          {repos.map((repo, i) => (
            <li key={repo.name} className="w-full shrink-0 snap-start">
              <a
                href={repo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-[22rem] flex-col justify-between gap-10 border-y border-band-line px-5 py-8 sm:min-h-[26rem] sm:px-8 sm:py-12"
              >
                <span className="font-mono text-[11px] tracking-widest opacity-70">
                  {two(i + 1)} / {two(repos.length)}
                </span>
                <span className="block min-w-0">
                  <span className="block break-words font-display text-[clamp(2.5rem,11vw,9rem)] leading-[0.95] tracking-tight underline-offset-8 group-hover:underline">
                    {repo.name}
                  </span>
                  {repo.description && (
                    <span className="mt-5 block max-w-2xl text-lg opacity-70">{repo.description}</span>
                  )}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest opacity-70">{meta(repo)} ↗</span>
              </a>
            </li>
          ))}
        </MediaSlider>
      )}
      <div className="px-5 pt-8 sm:px-8">
        <Reveal variant="still">
          <Who data={data} />
          <div className="mt-6">
            <Status data={data} />
            <Bars data={data} className="mt-3 h-8" />
            <Caption data={data} />
          </div>
        </Reveal>
      </div>
    </div>
  );
}

// Full width, Edge index: like Index, with rows and lines edge to edge.
function EdgeIndex({ data }: { data: GithubData }) {
  return (
    <div className="site-pb">
      <div className="px-5 pb-8 sm:px-8">
        <Reveal variant="still">
          <Who data={data} />
        </Reveal>
      </div>
      <Rows repos={data.recent} edge />
      <div className="px-5 pt-8 sm:px-8">
        <Reveal variant="still">
          <Status data={data} />
          <Bars data={data} className="mt-3 h-6" />
          <Caption data={data} />
        </Reveal>
      </div>
    </div>
  );
}

type Props = {
  data: GithubData;
  title: string;
  // Seconds between slides (Repo slide).
  seconds?: number;
  // Chosen in Customize (Sections, GitHub). Left out = the original: Centered, Profile.
  mode?: DesignMode;
  view?: GithubView;
  wideView?: GithubWideView;
  // The text under the title (written in Pages) and the look of the title and of that text (Customize).
  intro?: string | null;
  titleAlign?: DesignTitleAlign;
  titleFont?: DesignFont;
  titleSize?: DesignTitleSize;
  introFont?: DesignFont;
  introSize?: DesignIntroSize;
};

// The GitHub section of Home, a full-width band in the secondary color. It only appears when GitHub answered.
// Centered + Profile + the original title = exactly the look from before.
export function HomeGithub({
  data,
  title,
  seconds = 5,
  mode = "centered",
  view = "profile",
  wideView = "pulse",
  intro = null,
  titleAlign = "center",
  titleFont = "default",
  titleSize = "auto",
  introFont = "default",
  introSize = "auto",
}: Props) {
  const wide = mode === "full";
  const custom = titleAlign !== "center" || titleFont !== "default" || titleSize !== "auto" || Boolean(intro);

  if (!wide && view === "profile" && !custom) {
    return (
      <section id="github" aria-label={title} className="bg-band site-pt text-band-ink">
        <div className="mx-auto max-w-5xl px-5 pb-8 sm:px-8">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
          </Reveal>
        </div>
        <ProfileBody data={data} />
      </section>
    );
  }

  let body: ReactNode;
  if (wide) {
    body =
      wideView === "slide" ? (
        <RepoSlide data={data} seconds={seconds} />
      ) : wideView === "edge" ? (
        <EdgeIndex data={data} />
      ) : (
        <Pulse data={data} />
      );
  } else {
    body = view === "index" ? <Index data={data} /> : view === "stats" ? <Stats data={data} /> : <ProfileBody data={data} />;
  }

  return (
    <section id="github" aria-label={title} className="bg-band site-pt text-band-ink">
      <DesignHeading
        title={title}
        href={null}
        intro={intro}
        align={titleAlign}
        font={titleFont}
        size={titleSize}
        introFont={introFont}
        introSize={introSize}
        tone="band"
      />
      {body}
    </section>
  );
}