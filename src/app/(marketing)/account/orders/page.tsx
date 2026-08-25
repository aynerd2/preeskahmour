import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/section';
import { auth } from '@/lib/auth';
import { prisma, safeQuery } from '@/lib/prisma';
import { ORDER_PROGRESS, ORDER_STATUS_LABELS } from '@/lib/constants';
import { formatDate, formatMoney } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Your orders',
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const session = await auth();

  const orders = await safeQuery(
    () =>
      prisma.order.findMany({
        where: { userId: session!.user.id },
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
    [],
  );

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        body="Once you place one, you can follow it through every stage in the atelier from here."
        action={
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/builder">Design your suit</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/shop">Browse the shop</Link>
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const step = ORDER_PROGRESS.indexOf(order.status);
        const percent = step >= 0 ? ((step + 1) / ORDER_PROGRESS.length) * 100 : 0;

        return (
          <article key={order.id} className="border border-ink/12">
            <Link
              href={`/account/orders/${order.reference}`}
              className="group block p-5 transition-colors hover:bg-cream/30 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl text-ink">{order.reference}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Placed {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={badgeFor(order.status)}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {step >= 0 ? (
                <div className="mt-5">
                  <div className="h-1 bg-ink/10">
                    <div className="h-full bg-emerald transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-[0.6rem] uppercase tracking-[0.12em] text-ink-faint">
                    <span>Paid</span>
                    <span>In the atelier</span>
                    <span>Delivered</span>
                  </div>
                </div>
              ) : null}

              <ul className="mt-5 space-y-2 border-t border-ink/10 pt-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate text-ink">{item.name}</span>
                      {item.descriptor ? (
                        <span className="block truncate text-xs text-ink-faint">
                          {item.descriptor}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums text-ink-muted">
                      ×{item.quantity}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 border-t border-ink/10 pt-4 text-right">
                <span className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
                  Total{' '}
                </span>
                <span className="font-display text-lg tabular-nums text-ink">
                  {formatMoney(order.totalKobo)}
                </span>
              </p>
            </Link>
          </article>
        );
      })}
    </div>
  );
}

function badgeFor(status: string) {
  if (status === 'DELIVERED') return 'emerald' as const;
  if (status === 'CANCELLED' || status === 'REFUNDED') return 'terracotta' as const;
  if (status === 'PENDING_PAYMENT') return 'default' as const;
  return 'gold' as const;
}
