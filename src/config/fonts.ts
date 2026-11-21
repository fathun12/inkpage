import {
  Bricolage_Grotesque,
  DM_Mono,
  DM_Serif_Display,
  Fraunces,
  Instrument_Sans,
  Instrument_Serif,
  Newsreader,
  Schibsted_Grotesk,
  Space_Mono,
  Syne,
} from "next/font/google";

// Fonts are loaded here. The list of choices (names, groups, CSS variables) lives in
// font-choices.ts: when you add a font here, add it there too.
// preload: false = the browser downloads a font file only when a page really uses it.

// Default font of the whole site (admin and public page).
export const fontBody = Instrument_Sans({
  subsets: ["latin"],
  variable: "--nf-f-instrument-sans",
  display: "swap",
});

export const fontVoice = Instrument_Serif({
  subsets: ["latin"],
  variable: "--nf-voice",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const fontMono = DM_Mono({
  subsets: ["latin"],
  variable: "--nf-mono",
  weight: ["400", "500"],
  display: "swap",
});

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--nf-f-schibsted-grotesk",
  display: "swap",
  preload: false,
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--nf-f-bricolage-grotesque",
  display: "swap",
  preload: false,
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--nf-f-syne",
  display: "swap",
  preload: false,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--nf-f-fraunces",
  display: "swap",
  preload: false,
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--nf-f-dm-serif-display",
  weight: "400",
  display: "swap",
  preload: false,
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--nf-f-newsreader",
  display: "swap",
  preload: false,
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--nf-f-space-mono",
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export const fontVariables = [
  fontBody.variable,
  fontVoice.variable,
  fontMono.variable,
  schibstedGrotesk.variable,
  bricolageGrotesque.variable,
  syne.variable,
  fraunces.variable,
  dmSerifDisplay.variable,
  newsreader.variable,
  spaceMono.variable,
].join(" ");