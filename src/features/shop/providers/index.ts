import { dodoProvider } from "./dodo";
import type { PaymentProvider } from "./types";

// Adapters live here. A new provider (Midtrans later) is one more line.
const providers: Record<string, PaymentProvider> = { dodo: dodoProvider };

// The provider used for new paid orders. null = none connected: paid checkout answers "not connected yet"
// and free products keep working (for example when the Dodo key is missing on the server).
export const activeProviderId: string | null = process.env.DODO_PAYMENTS_API_KEY ? "dodo" : null;

export function getProvider(id: string): PaymentProvider | null {
  return providers[id] ?? null;
}

export function getActiveProvider(): PaymentProvider | null {
  return activeProviderId ? getProvider(activeProviderId) : null;
}