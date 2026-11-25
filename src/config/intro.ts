// Greeting of the Home intro. The part of the day follows the VISITOR's clock, automatically.
// The owner can only reword a greeting (Pages > Home > Intro). Empty = the built-in text below.

export const dayParts = ["morning", "afternoon", "evening", "night"] as const;
export type DayPart = (typeof dayParts)[number];

export const dayPartLabels: Record<DayPart, string> = {
  morning: "Morning (05:00 to 11:59)",
  afternoon: "Afternoon (12:00 to 17:59)",
  evening: "Evening (18:00 to 21:59)",
  night: "Night (22:00 to 04:59)",
};

export const defaultGreetings: Record<DayPart, string> = {
  morning: "Good morning!",
  afternoon: "Good afternoon!",
  evening: "Good evening!",
  night: "Hello, night owl!",
};

// How the Home intro drifts away while you scroll down (and comes back when you scroll up).
// All numbers live here. A line fades and slides left over its own range of the scroll (0 = top, 1 = fully scrolled).
export const introScroll = {
  // The intro is gone after scrolling this many screens.
  spanScreens: 0.8,
  // How far a line slides to the left when gone, in vw.
  distanceVw: 40,
  // Smoothing time in ms. Bigger = softer and slower to catch up with the wheel.
  smoothMs: 140,
  // Greeting, date, big sentence. Each starts and ends at a different point, so they go one after another.
  ranges: [
    [0, 0.5],
    [0.1, 0.6],
    [0.25, 0.9],
  ],
} as const;

export function dayPartFor(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

export function resolveGreetings(overrides: Record<DayPart, string | null>): Record<DayPart, string> {
  return {
    morning: overrides.morning ?? defaultGreetings.morning,
    afternoon: overrides.afternoon ?? defaultGreetings.afternoon,
    evening: overrides.evening ?? defaultGreetings.evening,
    night: overrides.night ?? defaultGreetings.night,
  };
}