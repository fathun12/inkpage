import { z } from "zod";
import { seriesLimits } from "@/config/article";

export const seriesSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give the series a title.")
    .max(seriesLimits.title, `The title can be at most ${seriesLimits.title} characters.`),
  description: z
    .string()
    .trim()
    .max(seriesLimits.description, `The description can be at most ${seriesLimits.description} characters.`),
});