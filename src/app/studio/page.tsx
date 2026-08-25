import Link from 'next/link';
import { AlertTriangle, ArrowRight, Inbox, Package, Palette, Shirt } from 'lucide-react';

import { Pill, StudioHeader } from '@/components/studio/studio-ui';
import { Button } from '@/components/ui/button';
import { prisma, safeQuery } from '@/lib/prisma';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { formatDate, formatMoney } from '@/lib/utils';

export default async function StudioDashboard() {
  const [
    orders,
    needsAttention,
    revenue,
    counts,
    enquiries,
    messages,
    unshotProducts,
  ] = await Promise.all([
    safeQuery(
      () =>
        prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: { items: { select: { id: true } } },
        }),
      [],
    ),
    // Orders that need a human: paid but not yet moved into the atelier, or
    // flagged with an underpayment note.
    safeQuery(
      () => prisma.order.count({ where: { status: 'PAID' } }),
      0,
    ),
    safeQuery(
      () =>
        prisma.order.aggregate({
          where: { paymentStatus: 'SUCCEEDED' },
          _sum: { totalKobo: true },
          _count: true,
        }),
      { _sum: { totalKobo: 0 }, _count: 0 },
    ),
    safeQuery(
      async () => ({
        fabrics: await prisma.fabric.count(),
        outOfStock: await prisma.fabric.count({ where: { inStock: false } }),
        products: await prisma.product.count({ where: { isActive: true } }),
        designs: await prisma.customDesign.count(),
        posts: await prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
      }),
      { fabrics: 0, outOfStock: 0, products: 0, designs: 0, posts: 0 },
    ),
    safeQuery(
      () =>
        prisma.b2BEnquiry.findMany({
          where: { status: 'NEW' },
          orderBy: { createdAt: 'desc' },
          take: 3,
        }),
      [],
    ),
    safeQuery(
      () =>
        prisma.contactMessage.findMany({
          where: { status: 'NEW' },
          orderBy: { createdAt: 'desc' },
          take: 3,
        }),
      [],
    ),
    // Anything still pointing at a placeholder, so the shot list stays visible.
    safeQuery(
      () =>
        prisma.product.count({
          where: { isActive: true, images: { some: { url: { startsWith: '/placeholders/' } } } },
        }),
      0,
    ),
  ]);

  return (
    <>
      <StudioHeader
        title="The studio"
        description="Everything on the site is edited from here — no developer needed."
      />

      {/* Numbers */}
      <div className="mb-10 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Package className="h-4 w-4" />}
          value={String(revenue._count)}
          label="Paid orders"
          sub={formatMoney(revenue._sum.totalKobo ?? 0)}
          href="/studio/orders"
        />
        <Stat
          icon={<Shirt className="h-4 w-4" />}
          value={String(counts.products)}
          label="Live products"
          sub={`${counts.designs} custom designs saved`}
          href="/studio/products"
        />
        <Stat
          icon={<Palette className="h-4 w-4" />}
          value={String(counts.fabrics)}
          label="Fabrics"
          sub={counts.outOfStock > 0 ? `${counts.outOfStock} out of stock` : 'All in stock'}
          href="/studio/fabrics"
        />
        <Stat
          icon={<Inbox className="h-4 w-4" />}
          value={String(enquiries.length + messages.length)}
          label="Unread enquiries"
          sub={`${counts.posts} journal articles live`}
          href="/studio/enquiries"
        />
      </div>

      {/* Things needing attention */}
      {(needsAttention > 0 || unshotProducts > 0) && (
        <div className="mb-10 space-y-3">
          {needsAttention > 0 ? (
            <Callout
              tone="warn"
              title={`${needsAttention} paid ${needsAttention === 1 ? 'order is' : 'orders are'} waiting to go into the atelier`}
              body="Confirm the measurements, then move them to In the atelier so the customer can see progress."
              action={{ label: 'Open orders', href: '/studio/orders?status=PAID' }}
            />
          ) : null}

          {unshotProducts > 0 ? (
            <Callout
              tone="info"
              title={`${unshotProducts} ${unshotProducts === 1 ? 'product is' : 'products are'} still using placeholder images`}
              body="Placeholders are obvious on the site by design. Upload the real photography against each product when the shoot is done — README-ASSETS.md has the full shot list."
              action={{ label: 'Open products', href: '/studio/products' }}
            />
          ) : null}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent orders */}
        <section>
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="eyebrow">Recent orders</h2>
            <Link
              href="/studio/orders"
              className="link-underline text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted"
            >
              All orders
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="border border-dashed border-ink/20 p-8 text-center text-sm text-ink-muted">
              No orders yet.
            </p>
          ) : (
            <ul className="divide-y divide-ink/8 border border-ink/12 bg-background">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/studio/orders/${order.id}`}
                    className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-cream/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{order.reference}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-faint">
                        {order.customerName} · {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <Pill tone={toneFor(order.status)}>{ORDER_STATUS_LABELS[order.status]}</Pill>

                    <span className="w-24 shrink-0 text-right text-sm tabular-nums text-ink">
                      {formatMoney(order.totalKobo)}
                    </span>

                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Inbox */}
        <section>
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="eyebrow">Unread</h2>
            <Link
              href="/studio/enquiries"
              className="link-underline text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted"
            >
              The whole inbox
            </Link>
          </div>

          {enquiries.length === 0 && messages.length === 0 ? (
            <p className="border border-dashed border-ink/20 p-8 text-center text-sm text-ink-muted">
              Nothing unread. Good.
            </p>
          ) : (
            <ul className="divide-y divide-ink/8 border border-ink/12 bg-background">
              {enquiries.map((enquiry) => (
                <li key={enquiry.id} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Pill tone="info">Corporate</Pill>
                    <p className="min-w-0 flex-1 truncate text-sm text-ink">
                      {enquiry.companyName}
                    </p>
                    <span className="shrink-0 text-xs text-ink-faint">
                      {formatDate(enquiry.createdAt, { month: 'short', day: 'numeric', year: undefined })}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                    {enquiry.message}
                  </p>
                </li>
              ))}

              {messages.map((message) => (
                <li key={message.id} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Pill>{message.topic}</Pill>
                    <p className="min-w-0 flex-1 truncate text-sm text-ink">{message.name}</p>
                    <span className="shrink-0 text-xs text-ink-faint">
                      {formatDate(message.createdAt, { month: 'short', day: 'numeric', year: undefined })}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                    {message.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Quick links */}
      <section className="mt-10">
        <h2 className="eyebrow mb-4">Jump to</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Homepage & pages', href: '/studio/content' },
            { label: 'Add a fabric', href: '/studio/fabrics/new' },
            { label: 'Add a product', href: '/studio/products/new' },
            { label: 'Write an article', href: '/studio/journal/new' },
            { label: 'Add lookbook images', href: '/studio/lookbook/new' },
          ].map((link) => (
            <Button key={link.href} asChild variant="outline" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>
      </section>
    </>
  );
}

function Stat({
  icon,
  value,
  label,
  sub,
  href,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub: string;
  href: string;
}) {
  return (
    <Link href={href} className="bg-background p-5 transition-colors hover:bg-cream/40">
      <span className="text-gold-deep" aria-hidden>
        {icon}
      </span>
      <p className="mt-3 font-display text-2xl text-ink">{value}</p>
      <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      <p className="mt-1.5 text-xs text-ink-faint">{sub}</p>
    </Link>
  );
}

function Callout({
  tone,
  title,
  body,
  action,
}: {
  tone: 'warn' | 'info';
  title: string;
  body: string;
  action: { label: string; href: string };
}) {
  return (
    <div
      className={`flex flex-wrap items-start gap-4 border p-4 ${
        tone === 'warn'
          ? 'border-gold/45 bg-gold-wash/50'
          : 'border-indigo/25 bg-indigo-wash/50'
      }`}
    >
      <AlertTriangle
        className={`mt-0.5 h-4 w-4 shrink-0 ${tone === 'warn' ? 'text-gold-deep' : 'text-indigo'}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{body}</p>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0">
        <Link href={action.href}>{action.label}</Link>
      </Button>
    </div>
  );
}

function toneFor(status: string) {
  if (status === 'DELIVERED') return 'good' as const;
  if (status === 'CANCELLED' || status === 'REFUNDED') return 'bad' as const;
  if (status === 'PENDING_PAYMENT') return 'neutral' as const;
  return 'warn' as const;
}
