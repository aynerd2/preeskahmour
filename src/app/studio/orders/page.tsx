import Link from 'next/link';
import type { OrderStatus } from '@prisma/client';

import { Pill, StudioHeader, StudioTable } from '@/components/studio/studio-ui';
import { prisma, safeQuery } from '@/lib/prisma';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { cn, formatDate, formatMoney } from '@/lib/utils';

export const metadata = { title: 'Orders' };

type SearchParams = Promise<{ status?: string }>;

const FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PAID', label: 'Needs attention' },
  { value: 'IN_ATELIER', label: 'In the atelier' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'PENDING_PAYMENT', label: 'Unpaid' },
];

export default async function StudioOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams;
  const valid = status && status in ORDER_STATUS_LABELS ? (status as OrderStatus) : undefined;

  const orders = await safeQuery(
    () =>
      prisma.order.findMany({
        where: valid ? { status: valid } : {},
        orderBy: { createdAt: 'desc' },
        include: { items: { select: { id: true, name: true, measurementSnapshot: true } } },
      }),
    [],
  );

  return (
    <>
      <StudioHeader
        title="Orders"
        description="Every order, with the measurements each piece is being cut to. Move an order through the stages and the customer sees the same progress in their account."
      />

      <nav className="hide-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1" aria-label="Filter orders">
        {FILTERS.map((filter) => {
          const active = (status ?? '') === filter.value;
          return (
            <Link
              key={filter.value}
              href={filter.value ? `/studio/orders?status=${filter.value}` : '/studio/orders'}
              className={cn(
                'shrink-0 whitespace-nowrap border px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] transition-colors',
                active
                  ? 'border-ink bg-ink text-ivory'
                  : 'border-ink/20 text-ink-muted hover:border-ink hover:text-ink',
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      <StudioTable
        rows={orders}
        href={(order) => `/studio/orders/${order.id}`}
        empty={{
          title: valid ? 'No orders in that stage' : 'No orders yet',
          body: valid ? 'Try another filter.' : 'They will appear here as soon as the first one is placed.',
        }}
        columns={[
          {
            key: 'reference',
            header: 'Order',
            render: (order) => (
              <span className="min-w-0">
                <span className="block truncate text-ink">{order.reference}</span>
                <span className="block truncate text-xs text-ink-faint">
                  {order.customerName} · {formatDate(order.createdAt)}
                </span>
              </span>
            ),
          },
          {
            key: 'items',
            header: 'Pieces',
            hideOnMobile: true,
            render: (order) => (
              <span className="text-xs text-ink-muted">
                {order.items.length}
                {order.items.some(
                  (item) =>
                    (item.measurementSnapshot as { requiresConfirmation?: boolean } | null)
                      ?.requiresConfirmation,
                ) ? (
                  <span className="ml-2 text-terracotta">Estimated measurements</span>
                ) : null}
              </span>
            ),
          },
          {
            key: 'total',
            header: 'Total',
            render: (order) => (
              <span className="tabular-nums text-ink">{formatMoney(order.totalKobo)}</span>
            ),
          },
          {
            key: 'payment',
            header: 'Payment',
            hideOnMobile: true,
            render: (order) => (
              <Pill
                tone={
                  order.paymentStatus === 'SUCCEEDED'
                    ? 'good'
                    : order.paymentStatus === 'FAILED'
                      ? 'bad'
                      : 'neutral'
                }
              >
                {order.paymentStatus === 'SUCCEEDED'
                  ? 'Paid'
                  : order.paymentStatus === 'FAILED'
                    ? 'Failed'
                    : 'Pending'}
              </Pill>
            ),
          },
          {
            key: 'status',
            header: 'Stage',
            render: (order) => (
              <Pill tone={toneFor(order.status)}>{ORDER_STATUS_LABELS[order.status]}</Pill>
            ),
          },
        ]}
      />
    </>
  );
}

function toneFor(status: OrderStatus) {
  if (status === 'DELIVERED') return 'good' as const;
  if (status === 'CANCELLED' || status === 'REFUNDED') return 'bad' as const;
  if (status === 'PENDING_PAYMENT') return 'neutral' as const;
  if (status === 'PAID') return 'info' as const;
  return 'warn' as const;
}
