import 'server-only';

import type { PaymentProviderKind } from '@prisma/client';

import { prisma } from './prisma';
import { ngnToUsdMinor } from './utils';

/**
 * Marks an order paid. Shared by both webhooks and by the return-from-payment
 * verification, because either can arrive first.
 *
 * Two properties matter here:
 *
 *  1. Idempotent. Webhooks retry, and the customer's browser may hit the
 *     confirm page at the same moment. An order already PAID is left alone
 *     and the call reports success.
 *
 *  2. It checks the amount. A provider callback saying "paid" for less than
 *     the order total is not a payment — it is either a misconfiguration or
 *     someone tampering with a redirect. Those are recorded and flagged for
 *     the atelier rather than silently fulfilled.
 */

export type SettleResult =
  | { status: 'settled' | 'already-settled'; orderId: string }
  | { status: 'not-found' }
  | { status: 'underpaid'; orderId: string; expected: number; received: number }
  | { status: 'ignored'; reason: string };

export async function settleOrder(args: {
  reference: string | null;
  paid: boolean;
  amountMinor: number;
  currency: string;
  provider: PaymentProviderKind;
  providerReference: string;
  raw: unknown;
  eventType?: string;
}): Promise<SettleResult> {
  if (!args.reference) return { status: 'ignored', reason: 'no order reference on the event' };

  const order = await prisma.order.findUnique({ where: { reference: args.reference } });
  if (!order) return { status: 'not-found' };

  if (order.paymentStatus === 'SUCCEEDED') {
    return { status: 'already-settled', orderId: order.id };
  }

  if (!args.paid) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'FAILED',
        paymentRaw: args.raw as never,
        paymentReference: args.providerReference || order.paymentReference,
      },
    });
    return { status: 'ignored', reason: args.eventType ?? 'not a successful payment' };
  }

  // What we expected in the provider's own currency.
  const expected =
    args.currency.toUpperCase() === 'NGN' ? order.totalKobo : ngnToUsdMinor(order.totalKobo);

  // A little tolerance for FX rounding on the USD rail only; the naira rail
  // is exact because no conversion happens.
  const tolerance = args.currency.toUpperCase() === 'NGN' ? 0 : Math.ceil(expected * 0.02);

  if (args.amountMinor + tolerance < expected) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'FAILED',
        paymentRaw: args.raw as never,
        paymentReference: args.providerReference || order.paymentReference,
        atelierNotes: [
          order.atelierNotes,
          `⚠ Underpayment: expected ${expected} ${args.currency}, received ${args.amountMinor}. Do not cut until resolved.`,
        ]
          .filter(Boolean)
          .join('\n'),
      },
    });
    return {
      status: 'underpaid',
      orderId: order.id,
      expected,
      received: args.amountMinor,
    };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'PAID',
      paymentStatus: 'SUCCEEDED',
      paymentProvider: args.provider,
      paymentReference: args.providerReference || order.paymentReference,
      paymentRaw: args.raw as never,
      paidAt: new Date(),
    },
  });

  return { status: 'settled', orderId: order.id };
}
