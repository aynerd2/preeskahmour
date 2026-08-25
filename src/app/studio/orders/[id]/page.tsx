import { notFound } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

import { OrderStatusForm } from '@/components/studio/order-status-form';
import { Pill, StudioHeader } from '@/components/studio/studio-ui';
import { prisma } from '@/lib/prisma';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { MEASUREMENT_FIELDS } from '@/lib/measurements';
import { formatDate, formatMoney } from '@/lib/utils';

export const metadata = { title: 'Order' };

type Params = Promise<{ id: string }>;

export default async function StudioOrderPage({ params }: { params: Params }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { email: true, name: true } } },
  });

  if (!order) notFound();

  return (
    <>
      <StudioHeader
        title={order.reference}
        description={`${order.customerName} · ${formatDate(order.createdAt)}`}
        back={{ label: 'All orders', href: '/studio/orders' }}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Pill tone={order.paymentStatus === 'SUCCEEDED' ? 'good' : 'neutral'}>
          {order.paymentStatus === 'SUCCEEDED' ? 'Paid' : order.paymentStatus}
        </Pill>
        <Pill tone="warn">{ORDER_STATUS_LABELS[order.status]}</Pill>
        {order.paymentProvider ? <Pill>{order.paymentProvider}</Pill> : null}
      </div>

      {/* An underpayment note is written into atelierNotes by settleOrder. */}
      {order.atelierNotes?.includes('⚠') ? (
        <div className="mb-6 flex gap-3 border border-terracotta/40 bg-terracotta-wash/60 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-deep" aria-hidden />
          <p className="text-sm leading-relaxed text-ink">
            This order has a payment discrepancy recorded below. Do not cut until it is resolved.
          </p>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="space-y-8">
          {/* The work */}
          <section>
            <h2 className="eyebrow mb-4">What to make</h2>

            <ul className="space-y-5">
              {order.items.map((item) => {
                const measurements = item.measurementSnapshot as Record<string, unknown> | null;
                const design = item.designSnapshot as Record<string, unknown> | null;
                const estimated = measurements?.requiresConfirmation === true;
                const options = (design?.options as { name: string; category: string }[]) ?? [];

                return (
                  <li key={item.id} className="border border-ink/12 bg-background p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg text-ink">{item.name}</h3>
                        {item.descriptor ? (
                          <p className="mt-1 text-sm text-ink-muted">{item.descriptor}</p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm tabular-nums text-ink">
                        {item.quantity} × {formatMoney(item.unitPriceKobo)}
                      </p>
                    </div>

                    {estimated ? (
                      <p className="mt-4 border border-terracotta/35 bg-terracotta-wash/50 p-3 text-xs leading-relaxed text-ink">
                        <strong>Estimated measurements.</strong> Confirm on a video call before
                        cutting, and allow extra seam allowance.
                      </p>
                    ) : null}

                    {options.length > 0 ? (
                      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 border-t border-ink/10 pt-4 sm:grid-cols-3">
                        {options.map((option) => (
                          <div key={option.category} className="flex justify-between gap-2">
                            <dt className="text-[0.6rem] uppercase tracking-[0.1em] text-ink-faint">
                              {option.category}
                            </dt>
                            <dd className="text-xs text-ink">{option.name}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}

                    {measurements ? (
                      <div className="mt-4 border-t border-ink/10 pt-4">
                        <p className="mb-3 text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
                          Cut to
                        </p>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-4">
                          {MEASUREMENT_FIELDS.filter(
                            (field) => typeof measurements[field.key] === 'number',
                          ).map((field) => (
                            <div key={field.key} className="flex justify-between gap-2">
                              <dt className="text-[0.6rem] uppercase tracking-[0.1em] text-ink-faint">
                                {field.label}
                              </dt>
                              <dd className="text-xs tabular-nums text-ink">
                                {String(measurements[field.key])}
                              </dd>
                            </div>
                          ))}
                        </dl>

                        {typeof measurements.notes === 'string' && measurements.notes ? (
                          <p className="mt-3 border-l-2 border-gold pl-3 text-xs leading-relaxed text-ink">
                            {measurements.notes}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-4 border-t border-ink/10 pt-4 text-xs text-terracotta-deep">
                        No measurements attached. Contact the customer before cutting.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {order.customerNote ? (
            <section>
              <h2 className="eyebrow mb-3">Customer note</h2>
              <p className="border-l-2 border-gold bg-gold-wash/30 py-3 pl-4 pr-3 text-sm leading-relaxed text-ink">
                {order.customerNote}
              </p>
            </section>
          ) : null}

          <OrderStatusForm
            id={order.id}
            status={order.status}
            atelierNotes={order.atelierNotes ?? ''}
            trackingUrl={order.trackingUrl ?? ''}
          />
        </div>

        {/* Aside */}
        <aside className="space-y-6">
          <section className="border border-ink/12 bg-background p-5">
            <h2 className="eyebrow mb-4">Customer</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Name" value={order.customerName} />
              <Row label="Email" value={order.email} />
              <Row label="Phone" value={order.phone} />
              <Row label="Account" value={order.user ? 'Registered' : 'Guest'} />
            </dl>
          </section>

          <section className="border border-ink/12 bg-background p-5">
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
          </section>

          <section className="border border-ink/12 bg-background p-5">
            <h2 className="eyebrow mb-4">Money</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatMoney(order.subtotalKobo)} />
              <Row
                label="Delivery"
                value={order.shippingKobo === 0 ? 'Free' : formatMoney(order.shippingKobo)}
              />
              <Row label="Total" value={formatMoney(order.totalKobo)} strong />
              {order.paidAt ? <Row label="Paid" value={formatDate(order.paidAt)} /> : null}
              {order.paymentReference ? (
                <Row label="Reference" value={order.paymentReference} mono />
              ) : null}
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  strong,
  mono,
}: {
  label: string;
  value: string;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-[0.62rem] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </dt>
      <dd
        className={`min-w-0 break-words text-right ${strong ? 'font-display text-base text-ink' : 'text-xs text-ink'} ${mono ? 'font-mono text-[0.66rem]' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}
