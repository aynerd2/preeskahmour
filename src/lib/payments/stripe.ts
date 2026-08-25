import Stripe from 'stripe';

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
 * Stripe — the secondary rail, USD, for customers outside Nigeria.
 *
 * Prices live in the database as NGN kobo. The USD figure is derived at
 * checkout from NEXT_PUBLIC_NGN_PER_USD, which is a manually maintained
 * display rate, not a live FX feed. The consequence is stated plainly at
 * checkout: the USD figure is indicative, and the NGN price is the real one.
 * If FX volatility ever makes that untenable, replace this conversion with a
 * rate fetched at order time and stored on the order.
 */
export class StripeProvider implements PaymentProvider {
  readonly key = 'STRIPE' as const;
  readonly currency = 'USD' as const;

  private client: Stripe | null = null;

  private get secret() {
    return process.env.STRIPE_SECRET_KEY ?? '';
  }

  isConfigured() {
    return this.secret.startsWith('sk_');
  }

  private get stripe(): Stripe {
    if (!this.isConfigured()) throw new PaymentNotConfiguredError('Stripe');
    this.client ??= new Stripe(this.secret, { apiVersion: '2025-02-24.acacia' });
    return this.client;
  }

  async initialise(args: InitPaymentArgs): Promise<InitPaymentResult> {
    if (args.currency !== 'USD') {
      throw new PaymentError('The Stripe rail charges in USD.', 'STRIPE');
    }

    const lineItems = (args.lineItems ?? []).length
      ? args.lineItems!.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: 'usd',
            unit_amount: item.amountMinor,
            product_data: { name: item.name.slice(0, 250) },
          },
        }))
      : [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: args.amountMinor,
              product_data: { name: `Preeskahmour order ${args.reference}` },
            },
          },
        ];

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      // Our own reference, so the webhook can find the order without
      // depending on Stripe's ids.
      client_reference_id: args.reference,
      customer_email: args.email,
      line_items: lineItems,
      success_url: `${args.callbackUrl}?reference=${encodeURIComponent(args.reference)}`,
      cancel_url: `${args.callbackUrl}?reference=${encodeURIComponent(args.reference)}&cancelled=1`,
      metadata: {
        order_reference: args.reference,
        customer_name: args.customerName,
        ...Object.fromEntries(
          Object.entries(args.metadata ?? {}).map(([k, v]) => [k, String(v)]),
        ),
      },
    });

    if (!session.url) {
      throw new PaymentError('Stripe did not return a checkout URL.', 'STRIPE', session);
    }

    return { redirectUrl: session.url, providerReference: session.id };
  }

  async verify(reference: string): Promise<VerifyResult> {
    // `reference` here is our order reference, so search rather than retrieve.
    const sessions = await this.stripe.checkout.sessions.list({ limit: 10 });
    const session =
      sessions.data.find((s) => s.client_reference_id === reference) ??
      (reference.startsWith('cs_')
        ? await this.stripe.checkout.sessions.retrieve(reference)
        : null);

    if (!session) {
      throw new PaymentError('No Stripe session found for that reference.', 'STRIPE');
    }

    return {
      paid: session.payment_status === 'paid',
      amountMinor: session.amount_total ?? 0,
      currency: (session.currency ?? 'usd').toUpperCase(),
      providerReference: session.id,
      raw: session,
    };
  }

  async parseWebhook(rawBody: string, signature: string | null): Promise<WebhookResult> {
    if (!this.isConfigured()) throw new PaymentNotConfiguredError('Stripe');

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new PaymentNotConfiguredError('Stripe webhook secret');
    if (!signature) throw new PaymentError('Missing Stripe signature.', 'STRIPE');

    let event: Stripe.Event;
    try {
      // Throws on a bad signature — an unverified event must never mark an
      // order paid.
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (error) {
      throw new PaymentError('Stripe signature did not verify.', 'STRIPE', error);
    }

    const session = event.data.object as Stripe.Checkout.Session;

    return {
      reference: session.client_reference_id ?? session.metadata?.order_reference ?? null,
      paid:
        event.type === 'checkout.session.completed' && session.payment_status === 'paid',
      amountMinor: session.amount_total ?? 0,
      currency: (session.currency ?? 'usd').toUpperCase(),
      providerReference: session.id,
      eventType: event.type,
      raw: event,
    };
  }
}
