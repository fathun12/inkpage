import { Img } from "@/components/ui/Img";
import type { GithubData } from "@/types/github";
import { Reveal } from "./Reveal";

const button =
  "inline-flex items-center gap-2 border border-ink px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors duration-(--dur-base) hover:bg-ink hover:text-bg";

// The GitHub section of Home: profile on the left; on the right whether you are active, 30 days of public
// commits as thin bars, and the newest repositories. It only appears when GitHub answered.
export function HomeGithub({ data, title }: { data: GithubData; title: string }) {
  const active = data.status === "active";
  const max = Math.max(1, ...data.days);
  return (
    <section id="github" aria-label={title} className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-5xl px-5 pb-8 sm:px-8">
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
        </Reveal>
      </div>
      <div className="mx-auto grid max-w-5xl gap-10 px-5 pb-16 sm:px-8 sm:pb-24 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <Reveal variant="still">
            <Img src={data.avatar} alt={`Avatar of ${data.login}`} className="size-24 object-cover" />
            <p className="mt-4 font-display text-2xl leading-tight">{data.name ?? data.login}</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ink-soft">@{data.login}</p>
            {data.bio && <p className="mt-3 text-sm text-ink-soft">{data.bio}</p>}
            <p className="mt-4 font-mono text-xs uppercase tracking-widest">
              {data.repos} repositories · {data.followers} followers
            </p>
            <span className="mt-5 flex flex-wrap gap-3">
              <a href={data.href} target="_blank" rel="noopener noreferrer" className={button}>
                @{data.login} ↗
              </a>
              <a href={`${data.href}?tab=repositories`} target="_blank" rel="noopener noreferrer" className={button}>
                All repositories ↗
              </a>
            </span>
          </Reveal>
        </div>
        <div className="lg:col-span-8">
          <Reveal variant="still">
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
              <span aria-hidden className={`size-1.5 rounded-full ${active ? "bg-accent" : "border border-ink"}`} />
              {active ? "Active" : "Quiet"}
              {data.lastPush ? ` · last push ${data.lastPush}` : ""}
            </p>
            <div
              className="mt-4 flex h-12 items-end gap-[3px]"
              role="img"
              aria-label={`${data.commits} public commits in the last 30 days`}
            >
              {data.days.map((n, i) => (
                <span
                  key={i}
                  className={`flex-1 ${n > 0 ? "bg-accent" : "bg-ink/15"}`}
                  style={{ height: n > 0 ? `${Math.max(12, (n / max) * 100)}%` : "4px" }}
                />
              ))}
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              {data.commits} commits in the last 30 days · public activity only
            </p>
          </Reveal>
          {data.recent.length > 0 && (
            <ul className="mt-8 border-t border-line">
              {data.recent.map((repo) => (
                <li key={repo.name} className="border-b border-line">
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
                          <span className="mt-1 block line-clamp-1 text-sm text-ink-soft">{repo.description}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-right font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                        {[repo.language, repo.stars > 0 ? `${repo.stars} stars` : null, repo.updated]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </a>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}