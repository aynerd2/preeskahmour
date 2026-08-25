import { NextResponse } from 'next/server';

import { getProvider } from '@/lib/payments';
import { settleOrder } from '@/lib/settle';

export const runtime = 'nodejs';
// The signature is computed over the exact bytes Paystack sent, so the body
// must be read raw. Any parsing or transformation before this point breaks it.
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');
  const provider = getProvider('PAYSTACK');

  let event;
  try {
    event = await provider.parseWebhook(rawBody, signature);
  } catch (error) {
    // A signature failure is either a misconfiguration or someone probing.
    // Either way: no order is touched, and Paystack is told not to retry.
    console.error('[webhook/paystack] rejected:', (error as Error).message);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    const result = await settleOrder({
      reference: event.reference,
      paid: event.paid,
      amountMinor: event.amountMinor,
      currency: event.currency,
      provider: 'PAYSTACK',
      providerReference: event.providerReference,
      raw: event.raw,
      eventType: event.eventType,
    });

    if (result.status === 'underpaid') {
      console.error('[webhook/paystack] underpayment on order', result.orderId, result);
    }

    // Always 200 on a verified event we have processed — a non-2xx makes
    // Paystack retry, and retrying will not change any of these outcomes.
    return NextResponse.json({ received: true, result: result.status });
  } catch (error) {
    // A genuine server fault, though: let it retry.
    console.error('[webhook/paystack] settle failed:', error);
    return NextResponse.json({ error: 'Could not process.' }, { status: 500 });
  }
}
