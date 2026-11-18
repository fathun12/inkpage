import { Instrument_Sans, Instrument_Serif, DM_Mono } from "next/font/google";

// Change a font here and the whole site follows.
// Sans is used for body AND headings. The serif is the italic accent ("font-voice").
export const fontBody = Instrument_Sans({
  subsets: ["latin"],
  variable: "--nf-body",
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

export const fontVariables = [fontBody.variable, fontVoice.variable, fontMono.variable].join(" ");