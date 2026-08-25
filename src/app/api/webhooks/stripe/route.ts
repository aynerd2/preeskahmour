import { NextResponse } from 'next/server';

import { getProvider } from '@/lib/payments';
import { settleOrder } from '@/lib/settle';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');
  const provider = getProvider('STRIPE');

  let event;
  try {
    event = await provider.parseWebhook(rawBody, signature);
  } catch (error) {
    console.error('[webhook/stripe] rejected:', (error as Error).message);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  // Stripe sends a great many event types; only the completed checkout
  // session tells us anything about this order.
  if (!event.eventType.startsWith('checkout.session')) {
    return NextResponse.json({ received: true, ignored: event.eventType });
  }

  try {
    const result = await settleOrder({
      reference: event.reference,
      paid: event.paid,
      amountMinor: event.amountMinor,
      currency: event.currency,
      provider: 'STRIPE',
      providerReference: event.providerReference,
      raw: event.raw,
      eventType: event.eventType,
    });

    if (result.status === 'underpaid') {
      console.error('[webhook/stripe] underpayment on order', result.orderId, result);
    }

    return NextResponse.json({ received: true, result: result.status });
  } catch (error) {
    console.error('[webhook/stripe] settle failed:', error);
    return NextResponse.json({ error: 'Could not process.' }, { status: 500 });
  }
}
