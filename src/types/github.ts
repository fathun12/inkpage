// Public GitHub facts of the owner, read from the GitHub API.
export type GithubRepo = {
  name: string;
  description: string | null;
  href: string;
  language: string | null;
  stars: number;
  updated: string;
};

export type GithubData = {
  login: string;
  name: string | null;
  bio: string | null;
  avatar: string;
  href: string;
  repos: number;
  followers: number;
  recent: GithubRepo[];
  status: "active" | "quiet";
  lastPush: string | null;
  // Public commits per day over the last 30 days, oldest first (30 numbers).
  days: number[];
  commits: number;
};