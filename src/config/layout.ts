// Layout settings of the public website (Customize studio, "Layout"). Plain data: no database and no React here.
// Only the names live here. The sizes (rem) are in styles/site.css (--sec and the .site-proj-* rules).

export const densityModes = ["compact", "comfortable", "airy"] as const;
export type DensityMode = (typeof densityModes)[number];

export const densityLabels: Record<DensityMode, string> = {
  compact: "Compact",
  comfortable: "Comfortable",
  airy: "Airy",
};

export const densityHints: Record<DensityMode, string> = {
  compact: "Sections sit close together.",
  comfortable: "The original space between sections.",
  airy: "More empty space between sections.",
};

export const projectSizes = ["small", "medium", "large"] as const;
export type ProjectSize = (typeof projectSizes)[number];

export const projectSizeLabels: Record<ProjectSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

export const projectSizeHints: Record<ProjectSize, string> = {
  small: "Narrow photo column, small title, tight rows.",
  medium: "A bit narrower photos and tighter rows.",
  large: "The original size.",
};

export const layoutDefaults: { density: DensityMode; projectSize: ProjectSize } = {
  density: "comfortable",
  projectSize: "large",
};

// Safe reader: an unknown or missing value falls back to the default.
export function readChoice<T extends string>(value: unknown, list: readonly T[], fallback: T): T {
  return (list as readonly string[]).includes(value as string) ? (value as T) : fallback;
}