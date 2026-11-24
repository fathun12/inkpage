import { createHash, randomBytes } from "node:crypto";

// The buyer's secret address of an order. Only its hash is stored.
export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}