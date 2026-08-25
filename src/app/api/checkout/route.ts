import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildOrderLines } from '@/lib/orders';
import { getProvider } from '@/lib/payments';
import { PaymentError, PaymentNotConfiguredError } from '@/lib/payments/types';
import { shippingForZone, zoneForAddress } from '@/lib/pricing';
import { checkoutSchema } from '@/lib/validators';
import { clientKey, limit } from '@/lib/rate-limit';
import { absoluteUrl, ngnToUsdMinor, orderReference } from '@/lib/utils';

export const runtime = 'nodejs';

/**
 * Creates the order and hands back a payment redirect.
 *
 * The order is written as PENDING_PAYMENT before the customer is sent to the
 * provider, so an abandoned payment leaves a record we can chase rather than
 * vanishing. It only becomes PAID when the webhook (or the verify call on
 * return) confirms it — never on the strength of the browser coming back.
 */
export async function POST(request: Request) {
  const rate = limit(clientKey(request, 'checkout'), 10, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Give it a minute.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
    );
  }

  const session = await auth();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Check the details you entered.', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const input = parsed.data;

  try {
    // --- prices, re-derived from the database ------------------------------
    const built = await buildOrderLines(input.items, input.measurementProfileId);
    if (!built.ok) {
      return NextResponse.json({ error: built.error }, { status: 409 });
    }

    const zone = zoneForAddress(input.address.state, input.address.country);
    const shippingKobo = shippingForZone(zone, built.subtotalKobo);
    const totalKobo = built.subtotalKobo + shippingKobo;

    const provider = getProvider(input.provider);
    if (!provider.isConfigured()) {
      return NextResponse.json(
        {
          error:
            input.provider === 'PAYSTACK'
              ? 'Card payment is not available right now. Contact the atelier and we will take the order directly.'
              : 'International card payment is not available right now. Try the naira option, or contact us.',
        },
        { status: 503 },
      );
    }

    // --- the order ---------------------------------------------------------
    const reference = orderReference();

    const order = await prisma.order.create({
      data: {
        reference,
        userId: session?.user?.id ?? null,
        email: input.email,
        phone: input.phone,
        customerName: input.customerName,
        shipFullName: input.address.fullName,
        shipLine1: input.address.line1,
        shipLine2: input.address.line2 || null,
        shipCity: input.address.city,
        shipState: input.address.state,
        shipCountry: input.address.country,
        shipPostcode: input.address.postcode || null,
        status: 'PENDING_PAYMENT',
        currency: provider.currency,
        subtotalKobo: built.subtotalKobo,
        shippingKobo,
        totalKobo,
        paymentProvider: input.provider,
        paymentStatus: 'PENDING',
        customerNote: input.customerNote || null,
        items: { create: built.lines },
      },
      include: { items: true },
    });

    // Claim any guest designs in this order for the signed-in customer, so
    // they show up under Your designs afterwards.
    if (session?.user?.id) {
      const designIds = order.items
        .map((i) => i.customDesignId)
        .filter((id): id is string => Boolean(id));

      if (designIds.length) {
        await prisma.customDesign.updateMany({
          where: { id: { in: designIds }, userId: null },
          data: { userId: session.user.id, isDraft: false },
        });
      }
    }

    // --- payment -----------------------------------------------------------
    // Paystack charges the kobo figure directly; Stripe needs USD cents, so
    // the NGN total is converted at the documented display rate.
    const amountMinor =
      provider.currency === 'NGN' ? totalKobo : ngnToUsdMinor(totalKobo);

    const init = await provider.initialise({
      reference,
      amountMinor,
      currency: provider.currency,
      email: input.email,
      customerName: input.customerName,
      callbackUrl: absoluteUrl('/checkout/confirm'),
      metadata: { order_id: order.id, items: order.items.length },
      lineItems: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        amountMinor:
          provider.currency === 'NGN'
            ? item.unitPriceKobo
            : ngnToUsdMinor(item.unitPriceKobo),
      })),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentReference: init.providerReference },
    });

    return NextResponse.json({
      reference,
      redirectUrl: init.redirectUrl,
      totalKobo,
      shippingKobo,
    });
  } catch (error) {
    if (error instanceof PaymentNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof PaymentError) {
      console.error('[api/checkout] provider error:', error.message, error.detail);
      return NextResponse.json(
        { error: 'The payment provider rejected that. Try again, or use the other method.' },
        { status: 502 },
      );
    }

    console.error('[api/checkout] failed:', error);
    return NextResponse.json(
      { error: 'We could not start that order. Nothing has been charged.' },
      { status: 500 },
    );
  }
}
