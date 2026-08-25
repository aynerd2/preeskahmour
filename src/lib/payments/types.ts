/**
 * One interface, two rails.
 *
 * Paystack is primary and settles in NGN — it is what Nigerian customers
 * actually have cards for. Stripe is secondary for international customers
 * paying in USD. Both are hidden behind `PaymentProvider` so the checkout
 * route, the order record and the webhook handling look the same either way,
 * and a third rail (Flutterwave, an inline Paystack popup, bank transfer)
 * can be added by writing one more implementation.
 *
 * Money crossing this boundary is always integer minor units, and always in
 * the currency named alongside it.
 */

export type PaymentCurrency = 'NGN' | 'USD';

export type InitPaymentArgs = {
  /** Our order reference — what we look the order up by on the way back. */
  reference: string;
  amountMinor: number;
  currency: PaymentCurrency;
  email: string;
  customerName: string;
  /** Absolute URL the customer returns to after paying. */
  callbackUrl: string;
  /** Free-form data echoed back by the provider. Kept small. */
  metadata?: Record<string, string | number>;
  lineItems?: { name: string; amountMinor: number; quantity: number }[];
};

export type InitPaymentResult = {
  /** Where to send the browser to complete payment. */
  redirectUrl: string;
  /** The provider's own id for this attempt, stored on the order. */
  providerReference: string;
};

export type VerifyResult = {
  paid: boolean;
  amountMinor: number;
  currency: string;
  providerReference: string;
  /** Whatever the provider returned, stored verbatim for reconciliation. */
  raw: unknown;
};

export type WebhookResult = {
  /** Our order reference, extracted from the event. */
  reference: string | null;
  paid: boolean;
  amountMinor: number;
  currency: string;
  providerReference: string;
  eventType: string;
  raw: unknown;
};

export interface PaymentProvider {
  readonly key: 'PAYSTACK' | 'STRIPE';
  readonly currency: PaymentCurrency;
  /** False when the keys are absent, so checkout can say so honestly. */
  isConfigured(): boolean;
  initialise(args: InitPaymentArgs): Promise<InitPaymentResult>;
  verify(reference: string): Promise<VerifyResult>;
  /**
   * Validates the signature and normalises the event. Throws if the
   * signature does not check out — an unverified webhook must never be
   * allowed to mark an order paid.
   */
  parseWebhook(rawBody: string, signature: string | null): Promise<WebhookResult>;
}

export class PaymentNotConfiguredError extends Error {
  constructor(provider: string) {
    super(
      `${provider} is not configured. Add its keys to .env — see .env.example.`,
    );
    this.name = 'PaymentNotConfiguredError';
  }
}

export class PaymentError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}
