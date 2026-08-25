import { createHmac, timingSafeEqual } from 'node:crypto';

import {
  PaymentError,
  PaymentNotConfiguredError,
  type InitPaymentArgs,
  type InitPaymentResult,
  type PaymentProvider,
  type VerifyResult,
  type WebhookResult,
} from './types';

/**
 * Paystack — the primary rail, NGN.
 *
 * Called over plain fetch rather than through an SDK: the published Node
 * wrappers lag the API and add a dependency for what is three endpoints.
 *
 * Paystack amounts are already in kobo, which is exactly how this codebase
 * stores money, so nothing is converted here. That is deliberate — every
 * conversion is a chance to be out by a factor of a hundred.
 */

const API = 'https://api.paystack.co';

export class PaystackProvider implements PaymentProvider {
  readonly key = 'PAYSTACK' as const;
  readonly currency = 'NGN' as const;

  private get secret() {
    return process.env.PAYSTACK_SECRET_KEY ?? '';
  }

  isConfigured() {
    return this.secret.startsWith('sk_');
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.isConfigured()) throw new PaymentNotConfiguredError('Paystack');

    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.secret}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      cache: 'no-store',
    });

    const body = (await res.json().catch(() => null)) as
      | { status?: boolean; message?: string; data?: T }
      | null;

    if (!res.ok || !body?.status) {
      throw new PaymentError(
        body?.message ?? `Paystack returned ${res.status}`,
        'PAYSTACK',
        body,
      );
    }

    return body.data as T;
  }

  async initialise(args: InitPaymentArgs): Promise<InitPaymentResult> {
    if (args.currency !== 'NGN') {
      throw new PaymentError('Paystack settles in NGN only.', 'PAYSTACK');
    }

    const data = await this.request<{ authorization_url: string; reference: string }>(
      '/transaction/initialize',
      {
        method: 'POST',
        body: JSON.stringify({
          email: args.email,
          amount: args.amountMinor, // already kobo
          currency: 'NGN',
          reference: args.reference,
          callback_url: args.callbackUrl,
          metadata: {
            customer_name: args.customerName,
            order_reference: args.reference,
            ...args.metadata,
            // Shown on the Paystack dashboard, which is where Prisca will
            // actually be reconciling payments.
            custom_fields: (args.lineItems ?? []).slice(0, 5).map((item) => ({
              display_name: item.name.slice(0, 60),
              variable_name: 'line_item',
              value: `${item.quantity} × ₦${Math.round(item.amountMinor / 100).toLocaleString('en-NG')}`,
            })),
          },
        }),
      },
    );

    return { redirectUrl: data.authorization_url, providerReference: data.reference };
  }

  async verify(reference: string): Promise<VerifyResult> {
    const data = await this.request<{
      status: string;
      amount: number;
      currency: string;
      reference: string;
    }>(`/transaction/verify/${encodeURIComponent(reference)}`);

    return {
      paid: data.status === 'success',
      amountMinor: data.amount,
      currency: data.currency,
      providerReference: data.reference,
      raw: data,
    };
  }

  async parseWebhook(rawBody: string, signature: string | null): Promise<WebhookResult> {
    if (!this.isConfigured()) throw new PaymentNotConfiguredError('Paystack');
    if (!signature) throw new PaymentError('Missing Paystack signature.', 'PAYSTACK');

    // Paystack signs the raw body with HMAC-SHA512 using the secret key.
    const expected = createHmac('sha512', this.secret).update(rawBody, 'utf8').digest('hex');

    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signature, 'utf8');
    // Length check first: timingSafeEqual throws on a mismatch.
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new PaymentError('Paystack signature did not verify.', 'PAYSTACK');
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      data?: {
        status?: string;
        amount?: number;
        currency?: string;
        reference?: string;
        metadata?: { order_reference?: string };
      };
    };

    return {
      reference: event.data?.metadata?.order_reference ?? event.data?.reference ?? null,
      paid: event.event === 'charge.success' && event.data?.status === 'success',
      amountMinor: event.data?.amount ?? 0,
      currency: event.data?.currency ?? 'NGN',
      providerReference: event.data?.reference ?? '',
      eventType: event.event,
      raw: event,
    };
  }
}
