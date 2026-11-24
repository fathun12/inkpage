import type { PaymentProvider } from "./types";

// Adapters are added here once a provider is chosen. Until then paid checkout answers "not connected yet"
// and free products work.
const providers: Record<string, PaymentProvider> = {};

// The id of the provider used for new paid orders (null = none connected).
export const activeProviderId: string | null = null;

export function getProvider(id: string): PaymentProvider | null {
  return providers[id] ?? null;
}

export function getActiveProvider(): PaymentProvider | null {
  return activeProviderId ? getProvider(activeProviderId) : null;
}