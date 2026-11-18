import { redirect } from "next/navigation";

// Every redirect carries a timestamp (t), so the page shows a fresh message
// each time, even when the same message comes twice in a row.
export function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}&t=${Date.now()}`);
}

export function redirectWithSaved(path: string, message = "Saved."): never {
  redirect(`${path}?saved=${encodeURIComponent(message)}&t=${Date.now()}`);
}

// Older code sends saved=1. Show it as a plain "Saved."
export function savedText(value: string): string {
  return value === "1" ? "Saved." : value;
}