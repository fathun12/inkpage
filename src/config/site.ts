export const themeNames = ["cream", "charcoal", "sand", "ember", "custom"] as const;
export type ThemeName = (typeof themeNames)[number];

export const themeLabels: Record<ThemeName, string> = {
  cream: "Cream",
  charcoal: "Charcoal",
  sand: "Sand",
  ember: "Ember",
  custom: "Custom",
};

export const siteConfig = {
  name: "inkpage",
  description: "All your links in one simple page.",
  // Small line at the bottom of every public page. Change the wording here.
  footer: "Made with inkpage by MFNiam",
  defaultTheme: "cream" as ThemeName,
  utcOffsetMinutes: 420,
  timezoneLabel: "WIB (UTC+7)",
} as const;

export const routes = {
  home: "/",
  login: "/admin/login",
  setup: "/admin/setup",
  admin: "/admin",
  links: "/admin/links",
  profileEdit: "/admin/profile",
  customize: "/admin/customize",
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