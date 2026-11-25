// What every payment provider (MoR now, Midtrans later) must offer. The checkout and the webhook only know this.

export type CheckoutOrder = {
  id: string;
  // The buyer's secret order token. Dodo copies it onto the payment so the webhook can email the same order page link.
  token: string;
  title: string;
  amountCents: number;
  currency: string;
  email: string;
  // The id of this product on the provider's side (Dodo: the product id from the Dodo dashboard).
  providerProductId: string | null;
  // Where the provider sends the buyer after paying (the order page).
  returnUrl: string;
};

export type ProviderEventKind = "paid" | "failed" | "expired" | "canceled" | "refunded";

export type ProviderEvent = {
  eventId: string;
  kind: ProviderEventKind;
  // null when the provider names only its own payment (refund events): then providerRef finds the order.
  orderId: string | null;
  providerRef: string | null;
  // The order token Dodo copied from the checkout (paid events only).
  orderToken?: string | null;
};

export type PaymentProvider = {
  id: string;
  // Returns the address of the provider's payment page.
  createCheckout(order: CheckoutOrder): Promise<string>;
  // Checks the signature on the RAW body. Throws when it is wrong. Returns null for events we ignore.
  verifyWebhook(request: Request, rawBody: string): Promise<ProviderEvent | null>;
};