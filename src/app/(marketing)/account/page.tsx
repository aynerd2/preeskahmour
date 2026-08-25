import Link from 'next/link';
import { ArrowRight, Package, Ruler, Shirt } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/section';
import { auth } from '@/lib/auth';
import { prisma, safeQuery } from '@/lib/prisma';
import { ORDER_PROGRESS, ORDER_STATUS_LABELS } from '@/lib/constants';
import { profileCompleteness } from '@/lib/measurements';
import { formatDate, formatMoney } from '@/lib/utils';

export default async function AccountOverviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [orders, profiles, designs] = await Promise.all([
    safeQuery(
      () =>
        prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { items: { select: { id: true, name: true } } },
        }),
      [],
    ),
    safeQuery(
      () => prisma.measurementProfile.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } }),
      [],
    ),
    safeQuery(
      () =>
        prisma.customDesign.findMany({
          where: { userId, isDraft: true },
          orderBy: { updatedAt: 'desc' },
          take: 3,
          include: { baseStyle: { select: { name: true } }, fabric: { select: { name: true } } },
        }),
      [],
    ),
  ]);

  const defaultProfile = profiles.find((p) => p.isDefault) ?? profiles[0];
  const completeness = defaultProfile ? profileCompleteness(defaultProfile) : null;

  return (
    <div className="space-y-12">
      {/* At a glance */}
      <div className="grid gap-px bg-ink/10 sm:grid-cols-3">
        <Stat
          icon={<Package className="h-4 w-4" />}
          value={String(orders.length)}
          label={orders.length === 1 ? 'Recent order' : 'Recent orders'}
          href="/account/orders"
        />
        <Stat
          icon={<Ruler className="h-4 w-4" />}
          value={completeness ? `${completeness.percent}%` : '—'}
          label={defaultProfile ? 'Measurements complete' : 'No measurements yet'}
          href="/account/measurements"
        />
        <Stat
          icon={<Shirt className="h-4 w-4" />}
          value={String(designs.length)}
          label={designs.length === 1 ? 'Saved draft' : 'Saved drafts'}
          href="/account/designs"
        />
      </div>

      {/* Orders */}
      <section>
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="eyebrow">Recent orders</h2>
          {orders.length > 0 ? (
            <Link
              href="/account/orders"
              className="link-underline text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted"
            >
              All orders
            </Link>
          ) : null}
        </div>

        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            body="When you place one, it will appear here with a live view of where it is in the atelier."
            action={
              <Button asChild className="mt-2">
                <Link href="/builder">Design your suit</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {orders.map((order) => {
              const step = ORDER_PROGRESS.indexOf(order.status);
              return (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.reference}`}
                    className="group flex flex-wrap items-center gap-4 py-5 transition-colors hover:bg-cream/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[1.05rem] text-ink">{order.reference}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {formatDate(order.createdAt)} ·{' '}
                        {order.items.length === 1 ? '1 piece' : `${order.items.length} pieces`}
                      </p>
                    </div>

                    <Badge variant={badgeFor(order.status)}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>

                    <p className="w-24 shrink-0 text-right text-sm tabular-nums text-ink">
                      {formatMoney(order.totalKobo)}
                    </p>

                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-1" />

                    {step >= 0 ? (
                      <div className="w-full">
                        <div className="h-0.5 bg-ink/10">
                          <div
                            className="h-full bg-emerald transition-all"
                            style={{ width: `${((step + 1) / ORDER_PROGRESS.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Measurements prompt */}
      {completeness && !completeness.isComplete ? (
        <section className="motif-diamond border border-gold/40 bg-gold-wash/30 p-6">
          <h2 className="font-display text-lg text-ink">Your measurements are incomplete</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
            {completeness.filled} of {completeness.total} required measurements are filled in. Add
            the rest and every future order goes straight into the atelier without a back-and-forth.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/account/measurements">Finish them</Link>
          </Button>
        </section>
      ) : null}

      {/* Drafts */}
      {designs.length > 0 ? (
        <section>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="eyebrow">Designs in progress</h2>
            <Link
              href="/account/designs"
              className="link-underline text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted"
            >
              All designs
            </Link>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3">
            {designs.map((design) => (
              <li key={design.id}>
                <Link
                  href={`/builder?design=${design.id}`}
                  className="block border border-ink/12 p-4 transition-colors hover:border-ink/35"
                >
                  <p className="font-display text-[1.02rem] leading-snug text-ink">{design.name}</p>
                  <p className="mt-1.5 text-xs text-ink-muted">
                    {design.baseStyle.name} · {design.fabric.name}
                  </p>
                  <p className="mt-3 text-sm tabular-nums text-ink">
                    {formatMoney(design.totalPriceKobo)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  href,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  href: string;
}) {
  return (
    <Link href={href} className="group bg-background p-6 transition-colors hover:bg-cream/40">
      <span className="text-gold-deep" aria-hidden>
        {icon}
      </span>
      <p className="mt-3 font-display text-3xl text-ink">{value}</p>
      <p className="mt-1 text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted">{label}</p>
    </Link>
  );
}

function badgeFor(status: string) {
  if (status === 'DELIVERED') return 'emerald' as const;
  if (status === 'CANCELLED' || status === 'REFUNDED') return 'terracotta' as const;
  if (status === 'PENDING_PAYMENT') return 'default' as const;
  return 'gold' as const;
}
