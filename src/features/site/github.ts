import type { GithubData, GithubRepo } from "@/types/github";
import { githubName } from "@/config/site-content";

const api = "https://api.github.com";
const DAY = 86_400_000;
const activeDays = 14;

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

// One call to the public GitHub API. Cached for 30 minutes. GITHUB_TOKEN is optional (it only raises the rate
// limit from 60 to 5000 calls per hour; it needs no permissions at all). Any failure gives null.
async function gh(path: string): Promise<unknown> {
  const token = process.env.GITHUB_TOKEN;
  try {
    const res = await fetch(`${api}${path}`, {
      redirect: "error",
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 1800 },
      headers: {
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "inkpage-site",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

function ago(iso: string | null, now: number): string | null {
  const t = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(t)) return null;
  const days = Math.max(0, Math.floor((now - t) / DAY));
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

// Profile, newest repositories and public activity of one GitHub user. Null when the profile cannot be read.
export async function fetchGithub(user: string | null): Promise<GithubData | null> {
  if (!user || !githubName(user)) return null;
  const [rawUser, rawRepos, rawEvents] = await Promise.all([
    gh(`/users/${user}`),
    gh(`/users/${user}/repos?type=owner&sort=pushed&per_page=12`),
    gh(`/users/${user}/events/public?per_page=100`),
  ]);
  const u = obj(rawUser);
  const login = str(u.login);
  const avatar = str(u.avatar_url);
  if (!login || !avatar) return null;
  const now = Date.now();

  const repoList = Array.isArray(rawRepos) ? rawRepos.map(obj) : [];
  const recent = repoList
    .filter((r) => r.fork !== true && str(r.name) && str(r.html_url))
    .slice(0, 6)
    .map(
      (r): GithubRepo => ({
        name: String(r.name).slice(0, 100),
        description: str(r.description)?.slice(0, 200) ?? null,
        href: String(r.html_url),
        language: str(r.language),
        stars: typeof r.stargazers_count === "number" ? r.stargazers_count : 0,
        updated: ago(str(r.pushed_at), now) ?? "",
      }),
    );

  // Public push events of the last 30 days, counted per day. Private repositories never show here.
  const days = Array.from({ length: 30 }, () => 0);
  let lastEvent = 0;
  for (const raw of Array.isArray(rawEvents) ? rawEvents : []) {
    const e = obj(raw);
    if (e.type !== "PushEvent") continue;
    const t = Date.parse(String(e.created_at));
    if (Number.isNaN(t)) continue;
    lastEvent = Math.max(lastEvent, t);
    const age = Math.floor((now - t) / DAY);
    if (age < 0 || age > 29) continue;
    const p = obj(e.payload);
    const n = typeof p.size === "number" ? p.size : Array.isArray(p.commits) ? p.commits.length : 1;
    days[29 - age] += n;
  }

  const repoPush = repoList[0] ? Date.parse(String(repoList[0].pushed_at)) : NaN;
  const last = Math.max(lastEvent, Number.isNaN(repoPush) ? 0 : repoPush);
  const lastIso = last > 0 ? new Date(last).toISOString() : null;

  return {
    login,
    name: str(u.name),
    bio: str(u.bio)?.slice(0, 240) ?? null,
    avatar,
    href: str(u.html_url) ?? `https://github.com/${login}`,
    repos: typeof u.public_repos === "number" ? u.public_repos : recent.length,
    followers: typeof u.followers === "number" ? u.followers : 0,
    recent,
    status: last > 0 && now - last <= activeDays * DAY ? "active" : "quiet",
    lastPush: ago(lastIso, now),
    days,
    commits: days.reduce((a, b) => a + b, 0),
  };
}