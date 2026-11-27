import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";

// The random id of a visitor, kept in a cookie. Likes are stored only as its SHA-256 hash.
export const visitorCookie = "inkpage-visitor";

const shape = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isVisitorId(value: string | undefined): value is string {
  return !!value && shape.test(value);
}

export function hashVisitor(id: string): string {
  return createHash("sha256").update(id).digest("hex");
}

// The id of this visitor, or null when the visitor has none yet (nobody has liked anything).
export async function readVisitorId(): Promise<string | null> {
  const value = (await cookies()).get(visitorCookie)?.value;
  return isVisitorId(value) ? value : null;
}