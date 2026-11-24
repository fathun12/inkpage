// Price text of the shop. 0 shows as the word "Free".
export function formatUsd(cents: number): string {
  if (cents <= 0) return "Free";
  return `$${dollarsFromCents(cents)}`;
}

export function formatIdr(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// 550 -> "5.50", 500 -> "5"
export function dollarsFromCents(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rest = cents % 100;
  return rest === 0 ? String(dollars) : `${dollars}.${String(rest).padStart(2, "0")}`;
}

// "5", "5.5", "5,50" or "$5.50" -> cents. null when it is not a price.
export function centsFromDollars(input: string): number | null {
  const text = input.trim().replace(/^\$/, "").replace(",", ".");
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(text)) return null;
  const [dollars, cents = ""] = text.split(".");
  return Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
}