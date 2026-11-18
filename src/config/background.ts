// Page background settings. Change labels and defaults here, not in components.
export const backgroundModes = ["color", "full", "banner", "frame"] as const;
export type BackgroundMode = (typeof backgroundModes)[number];

export const backgroundLabels: Record<BackgroundMode, string> = {
  color: "Plain color",
  full: "Full page",
  banner: "Banner",
  frame: "Frame",
};

export const tintRange = { min: 0, max: 90, step: 5 } as const;

export const backgroundDefaults = { mode: "color" as BackgroundMode, tint: 55, gray: true };

export type BackgroundView = {
  mode: BackgroundMode;
  imageUrl: string | null;
  tint: number;
  gray: boolean;
};

export const plainBackground: BackgroundView = {
  mode: "color",
  imageUrl: null,
  tint: backgroundDefaults.tint,
  gray: backgroundDefaults.gray,
};

// Safe reader: works even if the database columns are missing or empty.
export function readBackground(p: {
  bg_mode?: string | null;
  bg_image_url?: string | null;
  bg_tint?: number | null;
  bg_gray?: boolean | null;
}): BackgroundView {
  const mode = (backgroundModes as readonly string[]).includes(p.bg_mode ?? "")
    ? (p.bg_mode as BackgroundMode)
    : backgroundDefaults.mode;
  return {
    mode,
    imageUrl: p.bg_image_url ?? null,
    tint: p.bg_tint ?? backgroundDefaults.tint,
    gray: p.bg_gray ?? backgroundDefaults.gray,
  };
}