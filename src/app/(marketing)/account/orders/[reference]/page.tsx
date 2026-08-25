import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertCircle, Check, ExternalLink } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/shared/page-header';
import { auth } from '@/lib/auth';
import { prisma, safeQuery } from '@/lib/prisma';
import { ORDER_PROGRESS, ORDER_STATUS_LABELS } from '@/lib/constants';
import { MEASUREMENT_FIELDS } from '@/lib/measurements';
import { cn, formatDate, formatMoney } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Order',
  robots: { index: false, follow: false },
};

type Params = Promise<{ reference: string }>;

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { reference } = await params;
  const session = await auth();

  // Scoped to the signed-in customer — knowing a reference must not be enough
  // to read someone else's order and their measurements.
  const order = await safeQuery(
    () =>
      prisma.order.findFirst({
        where: { reference, userId: session!.user.id },
        include: { items: true },
      }),
    null,
  );

  if (!order) notFound();

  const currentStep = ORDER_PROGRESS.indexOf(order.status);
  const cancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Account', href: '/account' },
          { label: 'Orders', href: '/account/orders' },
          { label: order.reference },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{order.reference}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">Placed {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={cancelled ? 'terracotta' : order.status === 'DELIVERED' ? 'emerald' : 'gold'}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {/* Progress */}
      {!cancelled ? (
        <ol className="mt-10 space-y-0">
          {ORDER_PROGRESS.map((status, i) => {
            const done = i <= currentStep;
            const current = i === currentStep;
            const last = i === ORDER_PROGRESS.length - 1;

            return (
              <li key={status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center border text-[0.6rem]',
                      done ? 'border-emerald bg-emerald text-ivory' : 'border-ink/20 text-ink-faint',
                      current && 'ring-2 ring-gold ring-offset-2 ring-offset-background',
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  {!last ? (
                    <span
                      className={cn('h-10 w-px', i < currentStep ? 'bg-emerald' : 'bg-ink/15')}
                    />
                  ) : null}
                </div>

                <div className={cn('pb-2', last && 'pb-0')}>
                  <p
                    className={cn(
                      'text-sm',
                      current ? 'font-medium text-ink' : done ? 'text-ink-muted' : 'text-ink-faint',
                    )}
                  >
                    {ORDER_STATUS_LABELS[status]}
                  </p>
                  {current ? (
                    <p className="mt-0.5 text-xs text-emerald">Where your order is now</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="mt-8 flex gap-3 border border-terracotta/35 bg-terracotta-wash/50 p-5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-deep" aria-hidden />
          <p className="text-sm leading-relaxed text-ink-muted">
            This order was {order.status === 'REFUNDED' ? 'refunded' : 'cancelled'}. If that is not
            what you expected,{' '}
            <Link href="/contact?topic=An+existing+order" className="link-underline text-ink">
              tell us
            </Link>{' '}
            and we will look into it.
          </p>
        </div>
      )}

      {order.trackingUrl ? (
        <Button asChild variant="outline" className="mt-8">
          <a href={order.trackingUrl} target="_blank" rel="noreferrer noopener">
            Track the delivery
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      ) : null}

      {/* Pieces */}
      <section className="mt-12">
        <h2 className="eyebrow mb-5">What we are making</h2>

        <ul className="space-y-6">
          {order.items.map((item) => {
            const measurements = item.measurementSnapshot as Record<string, unknown> | null;
            const estimated = measurements?.requiresConfirmation === true;

            return (
              <li key={item.id} className="border border-ink/12 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg text-ink">{item.name}</h3>
                    {item.descriptor ? (
                      <p className="mt-1.5 text-sm text-ink-muted">{item.descriptor}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-ink-faint">Quantity {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm tabular-nums text-ink">
                    {formatMoney(item.totalKobo)}
                  </p>
                </div>

                {estimated ? (
                  <p className="mt-4 border-l-2 border-terracotta py-1 pl-4 text-xs leading-relaxed text-ink-muted">
                    Cut from estimated measurements — we will confirm them with you on a video call
                    before any cloth is cut.
                  </p>
                ) : null}

                {measurements ? (
                  <details className="mt-4 border-t border-ink/10 pt-4">
                    <summary className="cursor-pointer text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted hover:text-ink">
                      The measurements we are cutting to
                    </summary>

                    <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                      {MEASUREMENT_FIELDS.filter(
                        (field) => typeof measurements[field.key] === 'number',
                      ).map((field) => (
                        <div key={field.key} className="flex justify-between gap-2 border-b border-ink/8 pb-1.5">
                          <dt className="text-[0.62rem] uppercase tracking-[0.1em] text-ink-faint">
                            {field.label}
                          </dt>
                          <dd className="text-xs tabular-nums text-ink">
                            {String(measurements[field.key])}cm
                          </dd>
                        </div>
                      ))}
                    </dl>

                    {typeof measurements.notes === 'string' && measurements.notes ? (
                      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
                        <span className="text-ink-faint">Your note: </span>
                        {measurements.notes}
                      </p>
                    ) : null}
                  </details>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Totals & delivery */}
      <section className="mt-12 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="eyebrow mb-4">Delivering to</h2>
          <address className="text-sm not-italic leading-relaxed text-ink-muted">
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
            {order.shipPostcode ? ` ${order.shipPostcode}` : ''}
          </address>
          <p className="mt-3 text-sm text-ink-muted">{order.phone}</p>
        </div>

        <div>
          <h2 className="eyebrow mb-4">Payment</h2>
          <dl className="space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="text-sm text-ink-muted">Subtotal</dt>
              <dd className="text-sm tabular-nums text-ink">{formatMoney(order.subtotalKobo)}</dd>
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
            <span className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">Total</span>
            <span className="font-display text-xl tabular-nums text-ink">
              {formatMoney(order.totalKobo)}
            </span>
          </div>
          {order.paidAt ? (
            <p className="mt-2 text-xs text-ink-faint">
              Paid {formatDate(order.paidAt)} via{' '}
              {order.paymentProvider === 'STRIPE' ? 'Stripe' : 'Paystack'}
            </p>
          ) : null}
        </div>
      </section>

      {order.customerNote ? (
        <section className="mt-10 border-t border-ink/10 pt-6">
          <h2 className="eyebrow mb-3">Your note</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">{order.customerNote}</p>
        </section>
      ) : null}

      <div className="mt-12 flex flex-wrap gap-3 border-t border-ink/10 pt-8">
        <Button asChild variant="outline">
          <Link href="/contact?topic=An+existing+order">Ask about this order</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/account/orders">All orders</Link>
        </Button>
      </div>
    </div>
  );
}
