export const themeNames = ["paper", "midnight", "sage", "cobalt"] as const;
export type ThemeName = (typeof themeNames)[number];

export const themeLabels: Record<ThemeName, string> = {
  paper: "Paper",
  midnight: "Midnight",
  sage: "Sage",
  cobalt: "Cobalt",
};

export const siteConfig = {
  name: "inkpage",
  description: "A link-in-bio page, printed in ink.",
  defaultTheme: "paper" as ThemeName,
  utcOffsetMinutes: 420,
  timezoneLabel: "WIB (UTC+7)",
} as const;

export const routes = {
  home: "/",
  login: "/admin/login",
  setup: "/admin/setup",
  admin: "/admin",
  links: "/admin/links",
  appearance: "/admin/appearance",
  analytics: "/admin/analytics",
  track: "/api/track",
  profile: (username: string) => `/${username}`,
  go: (id: string) => `/go/${id}`,
} as const;

export function resolveTheme(name: string | null | undefined): ThemeName {
  return (themeNames as readonly string[]).includes(name ?? "")
    ? (name as ThemeName)
    : siteConfig.defaultTheme;
}