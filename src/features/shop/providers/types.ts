// What every payment provider (MoR now, Midtrans later) must offer. The checkout and the webhook only know this.

export type CheckoutOrder = {
  id: string;
  title: string;
  amountCents: number;
  currency: string;
  email: string;
  // Where the provider sends the buyer after paying (the order page).
  returnUrl: string;
};

export type ProviderEventKind = "paid" | "failed" | "expired" | "canceled" | "refunded";

export type ProviderEvent = {
  eventId: string;
  kind: ProviderEventKind;
  orderId: string;
  providerRef: string | null;
};

export type PaymentProvider = {
  id: string;
  // Returns the address of the provider's payment page.
  createCheckout(order: CheckoutOrder): Promise<string>;
  // Checks the signature on the RAW body. Throws when it is wrong. Returns null for events we ignore.
  verifyWebhook(request: Request, rawBody: string): Promise<ProviderEvent | null>;
};