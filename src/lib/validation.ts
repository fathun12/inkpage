import { z } from "zod";

export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export const httpUrl = z
  .string()
  .trim()
  .max(500, "Link is too long.")
  .refine(isHttpUrl, "Enter a valid link starting with http:// or https://");

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}