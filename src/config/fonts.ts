import { Fraunces, Schibsted_Grotesk, DM_Mono } from "next/font/google";

// Change a font here and the whole site follows.
export const fontDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--nf-display",
  axes: ["opsz"],
  display: "swap",
});

export const fontBody = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--nf-body",
  display: "swap",
});

export const fontMono = DM_Mono({
  subsets: ["latin"],
  variable: "--nf-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const fontVariables = [
  fontDisplay.variable,
  fontBody.variable,
  fontMono.variable,
].join(" ");
