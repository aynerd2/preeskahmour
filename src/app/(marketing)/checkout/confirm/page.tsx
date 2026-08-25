import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, Check, Clock, Mail, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { prisma, safeQuery } from '@/lib/prisma';
import { getProvider } from '@/lib/payments';
import { settleOrder } from '@/lib/settle';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { formatDate, formatMoney } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Order confirmation',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ reference?: string; trxref?: string; cancelled?: string }>;

/**
 * Where the customer lands after paying.
 *
 * Webhooks are the source of truth for settlement, but they can arrive after
 * the browser does — so this page also verifies with the provider directly.
 * `settleOrder` is idempotent, so whichever gets there first wins and the
 * other is a no-op.
 */
export default async function ConfirmPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  // Paystack appends both `reference` and `trxref`; Stripe gets ours back
  // via the success_url we built.
  const reference = params.reference ?? params.trxref;

  if (!reference) {
    return (
      <Shell
        title="We could not find that order"
        lede="No order reference came back with you. If you have just paid, check your email — the confirmation has the reference in it."
      >
        <Button asChild>
          <Link href="/account/orders">Your orders</Link>
        </Button>
      </Shell>
    );
  }

  let order = await safeQuery(
    () =>
      prisma.order.findUnique({
        where: { reference },
        include: { items: true },
      }),
    null,
  );

  if (!order) {
    return (
      <Shell
        title="We could not find that order"
        lede={`Nothing here matches reference ${reference}. If you were charged, send us that reference and we will sort it out immediately.`}
      >
        <Button asChild>
          <Link href="/contact?topic=An+existing+order">Contact the atelier</Link>
        </Button>
      </Shell>
    );
  }

  // Not yet settled, and not an explicit cancellation: ask the provider.
  if (order.paymentStatus === 'PENDING' && !params.cancelled && order.paymentProvider) {
    try {
      const provider = getProvider(order.paymentProvider);
      const verified = await provider.verify(
        order.paymentProvider === 'PAYSTACK' ? reference : order.paymentReference ?? reference,
      );

      await settleOrder({
        reference: order.reference,
        paid: verified.paid,
        amountMinor: verified.amountMinor,
        currency: verified.currency,
        provider: order.paymentProvider,
        providerReference: verified.providerReference,
        raw: verified.raw,
        eventType: 'return-from-payment',
      });

      order = await prisma.order.findUnique({
        where: { reference },
        include: { items: true },
      });
    } catch (error) {
      // Verification failing is not fatal — the webhook may still land.
      console.error('[checkout/confirm] verify failed:', (error as Error).message);
    }
  }

  if (!order) return null;

  const paid = order.paymentStatus === 'SUCCEEDED';
  const failed = order.paymentStatus === 'FAILED';

  if (!paid) {
    return (
      <Shell
        title={failed ? 'That payment did not complete' : 'Waiting on your payment'}
        lede={
          failed
            ? 'Your order is saved and nothing has been charged. You can try paying again, or ask us to invoice you directly.'
            : 'We have your order but the payment has not confirmed yet. This usually settles within a minute — refresh in a moment. If money has left your account, do not pay again; send us the reference below.'
        }
      >
        <div className="mb-8 border border-ink/15 p-5">
          <p className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">Reference</p>
          <p className="mt-1 font-display text-xl text-ink">{order.reference}</p>
          <p className="mt-3 text-sm text-ink-muted">
            {formatMoney(order.totalKobo)} · {ORDER_STATUS_LABELS[order.status]}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/checkout">Try again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact?topic=An+existing+order">Contact the atelier</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const estimatedReady = new Date(
    (order.paidAt ?? order.createdAt).getTime() + 21 * 24 * 60 * 60 * 1000,
  );

  const hasEstimatedMeasurements = order.items.some(
    (item) =>
      (item.measurementSnapshot as { requiresConfirmation?: boolean } | null)
        ?.requiresConfirmation,
  );

  return (
    <>
      <PageHeader
        eyebrow="Thank you"
        title="Your order is in"
        lede={`We have sent a confirmation to ${order.email}. Your reference is ${order.reference} — quote it in any message about this order.`}
      />

      <div className="container pb-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:gap-16">
          <div>
            {hasEstimatedMeasurements ? (
              <div className="mb-8 flex gap-3 border border-terracotta/35 bg-terracotta-wash/50 p-5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-deep" aria-hidden />
                <div className="text-sm leading-relaxed text-ink-muted">
                  <p className="font-medium text-ink">We will call you before we cut</p>
                  <p className="mt-1.5">
                    This order uses estimated measurements. Someone from the atelier will arrange a
                    short video call to confirm them — we do not cut cloth on an estimate.
                  </p>
                </div>
              </div>
            ) : null}

            <h2 className="eyebrow mb-5">What happens next</h2>

            <ol className="space-y-6">
              {[
                {
                  icon: <Mail className="h-4 w-4" />,
                  title: 'A confirmation email, now',
                  body: `Sent to ${order.email} with everything below.`,
                },
                {
                  icon: <Clock className="h-4 w-4" />,
                  title: 'We confirm the details, within a day',
                  body: 'Someone reads every order. If anything about your measurements or your notes needs a conversation, we will start one.',
                },
                {
                  icon: <Package className="h-4 w-4" />,
                  title: 'Into the atelier',
                  body: `Cloth is cut to your pattern and made by hand. Expect it ready around ${formatDate(estimatedReady)}.`,
                },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-gold/50 text-gold-deep">
                    {step.icon}
                  </span>
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                      Step {i + 1}
                    </p>
                    <h3 className="mt-1 font-display text-lg text-ink">{step.title}</h3>
                    <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-ink-muted">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/account/orders">Track this order</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/shop">Keep looking</Link>
              </Button>
            </div>
          </div>

          {/* Receipt */}
          <aside>
            <div className="border border-ink/12 p-6">
              <div className="mb-5 flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center bg-emerald text-ivory">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <Badge variant="emerald">Paid</Badge>
              </div>

              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">Reference</p>
              <p className="mt-1 font-display text-xl text-ink">{order.reference}</p>

              <ul className="mt-6 space-y-3 border-t border-ink/10 pt-5">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-sm text-ink">{item.name}</span>
                      {item.descriptor ? (
                        <span className="mt-0.5 block text-xs text-ink-faint">
                          {item.descriptor}
                        </span>
                      ) : null}
                      <span className="mt-0.5 block text-xs text-ink-faint">
                        Qty {item.quantity}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-ink">
                      {formatMoney(item.totalKobo)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-5 space-y-2 border-t border-ink/10 pt-5">
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-ink-muted">Subtotal</dt>
                  <dd className="text-sm tabular-nums text-ink">
                    {formatMoney(order.subtotalKobo)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-ink-muted">Delivery</dt>
                  <dd className="text-sm tabular-nums text-ink">
                    {order.shippingKobo === 0 ? 'Complimentary' : formatMoney(order.shippingKobo)}
                  </dd>
                </div>
              </dl>

              <hr className="gold-rule my-4 border-0" />

              <div className="flex justify-between gap-4">
                <span className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">
                  Paid
                </span>
                <span className="font-display text-xl tabular-nums text-ink">
                  {formatMoney(order.totalKobo)}
                </span>
              </div>

              <div className="mt-6 border-t border-ink/10 pt-5 text-xs leading-relaxed text-ink-muted">
                <p className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                  Delivering to
                </p>
                <p className="mt-1.5">
                  {order.shipFullName}
                  <br />
                  {order.shipLine1}
                  {order.shipLine2 ? (
                    <>
                      <br />
                      {order.shipLine2}
                    </>
                  ) : null}
                  <br />
                  {order.shipCity}, {order.shipState}
                  <br />
                  {order.shipCountry}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function Shell({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow="Checkout" title={title} lede={lede} />
      <div className="container pb-24">{children}</div>
    </>
  );
}
