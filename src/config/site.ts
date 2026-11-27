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
  // Small line at the bottom of every public page. Change the wording and the links here.
  credit: {
    before: "Made with ",
    product: { label: "inkpage", url: "https://github.com/fathun12/inkpage" },
    between: " by ",
    author: { label: "MFNiam", url: "https://github.com/fathun12" },
  },
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
  pages: "/admin/pages",
  shop: "/admin/shop",
  write: "/admin/write",
  writeEdit: (id: string) => `/admin/write/${id}`,
  series: "/admin/series",
  article: (username: string, slug: string) => `/${username}/writing/${slug}`,
  articlePreview: (username: string, id: string) => `/${username}/preview/${id}`,
  track: "/api/track",
  profile: (username: string) => `/${username}`,
  section: (username: string, section: string) => `/${username}/${section}`,
  go: (id: string) => `/go/${id}`,
} as const;

export function resolveTheme(name: string | null | undefined): ThemeName {
  return (themeNames as readonly string[]).includes(name ?? "")
    ? (name as ThemeName)
    : siteConfig.defaultTheme;
}