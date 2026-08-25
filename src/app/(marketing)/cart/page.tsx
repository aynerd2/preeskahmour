'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cartSubtotal, useCart } from '@/store/cart';
import { FREE_SHIPPING_THRESHOLD_KOBO, SHIPPING_RATES } from '@/lib/constants';
import { formatMoney } from '@/lib/utils';

/**
 * The full cart page. The drawer covers most journeys, but a page is what
 * people reach for on a phone when they want to look properly before paying
 * — and it is what a shared or bookmarked link needs to land on.
 */
export default function CartPage() {
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);

  const subtotal = cartSubtotal(items);
  const qualifiesFree = subtotal >= FREE_SHIPPING_THRESHOLD_KOBO;
  const toFree = FREE_SHIPPING_THRESHOLD_KOBO - subtotal;

  return (
    <>
      <PageHeader
        eyebrow="Your bag"
        title={hydrated && items.length > 0 ? 'Ready when you are' : 'Your bag'}
        lede={
          hydrated && items.length > 0
            ? 'Made-to-measure pieces are cut once you order, so check the details before you pay. Delivery is calculated at the next step.'
            : undefined
        }
      />

      <div className="container pb-24">
        {!hydrated ? (
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
            <div className="space-y-6">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Nothing in your bag yet"
            body="Design something from scratch, or start from a piece in the shop and make it yours."
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
        ) : (
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:gap-16">
            {/* Lines */}
            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-6 sm:gap-6">
                  <Link
                    href={item.href ?? '#'}
                    className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-cream sm:w-32"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="motif-diamond block h-full w-full" />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={item.href ?? '#'}
                          className="font-display text-[1.15rem] leading-snug text-ink hover:text-emerald"
                        >
                          {item.name}
                        </Link>

                        {item.descriptor ? (
                          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                            {item.descriptor}
                          </p>
                        ) : null}

                        {item.kind === 'CUSTOM' ? (
                          <Badge variant="gold" className="mt-2.5">
                            Made to measure
                          </Badge>
                        ) : null}
                      </div>

                      <p className="shrink-0 text-sm tabular-nums text-ink">
                        {formatMoney(item.unitPriceKobo * item.quantity)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                      <div className="flex items-center border border-ink/15">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center text-ink-muted hover:bg-cream"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-9 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center text-ink-muted hover:bg-cream"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="border border-ink/12 p-6">
                <h2 className="eyebrow mb-5">Summary</h2>

                <dl className="space-y-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-ink-muted">Subtotal</dt>
                    <dd className="text-sm tabular-nums text-ink">{formatMoney(subtotal)}</dd>
                  </div>

                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-ink-muted">Delivery</dt>
                    <dd className="text-sm tabular-nums text-ink">
                      {qualifiesFree ? (
                        <span className="text-emerald">Complimentary</span>
                      ) : (
                        <span className="text-ink-faint">From {formatMoney(SHIPPING_RATES.LAGOS)}</span>
                      )}
                    </dd>
                  </div>
                </dl>

                <hr className="gold-rule my-5 border-0" />

                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">
                    Total
                  </span>
                  <span className="font-display text-2xl tabular-nums text-ink">
                    {formatMoney(subtotal)}
                  </span>
                </div>

                {!qualifiesFree ? (
                  <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                    {formatMoney(toFree)} more for complimentary delivery within Nigeria.
                  </p>
                ) : null}

                <Button asChild full size="lg" className="mt-6">
                  <Link href="/checkout">Checkout</Link>
                </Button>

                <Link
                  href="/shop"
                  className="mt-4 block text-center text-xs uppercase tracking-[0.16em] text-ink-muted underline-offset-4 hover:underline"
                >
                  Keep looking
                </Link>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs leading-relaxed text-ink-muted">
                <li className="flex gap-2">
                  <ShoppingBag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" aria-hidden />
                  About 21 days in the atelier for a standard two-piece.
                </li>
                <li className="flex gap-2">
                  <ShoppingBag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" aria-hidden />
                  Your first alteration is free, always.
                </li>
              </ul>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
