'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cartSubtotal, useCart } from '@/store/cart';
import { FREE_SHIPPING_THRESHOLD_KOBO } from '@/lib/constants';
import { formatMoney } from '@/lib/utils';

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);

  const subtotal = cartSubtotal(items);
  const toFreeShipping = FREE_SHIPPING_THRESHOLD_KOBO - subtotal;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : close())}>
      <DialogContent side="right" className="flex flex-col p-0">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-5 sm:px-6">
          <DialogTitle className="text-xl">
            Your bag
            {hydrated && items.length > 0 ? (
              <span className="ml-2 font-sans text-sm text-ink-faint">({items.length})</span>
            ) : null}
          </DialogTitle>
        </div>

        {!hydrated ? (
          // Never render an empty bag before localStorage has been read, or a
          // returning customer sees "your bag is empty" for a frame.
          <div className="flex-1 space-y-4 p-5 sm:p-6">
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-24 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <ShoppingBag className="h-8 w-8 text-ink-faint" strokeWidth={1.25} />
            <div className="space-y-2">
              <p className="font-display text-xl text-ink">Nothing here yet</p>
              <p className="text-sm leading-relaxed text-ink-muted">
                Design something from scratch, or start from a piece in the shop and make it yours.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 pt-2">
              <Button asChild full onClick={close}>
                <Link href="/builder">Design your suit</Link>
              </Button>
              <Button asChild full variant="outline" onClick={close}>
                <Link href="/shop">Browse the shop</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink/8 overflow-y-auto px-5 sm:px-6">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-5">
                  <Link
                    href={item.href ?? '#'}
                    onClick={close}
                    className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden bg-cream"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={item.href ?? '#'}
                          onClick={close}
                          className="block truncate font-display text-[1.05rem] leading-snug text-ink hover:text-emerald"
                        >
                          {item.name}
                        </Link>
                        {item.descriptor ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                            {item.descriptor}
                          </p>
                        ) : null}
                        {item.kind === 'CUSTOM' ? (
                          <p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-gold-deep">
                            Made to measure
                          </p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="-mr-1 shrink-0 p-1 text-ink-faint transition-colors hover:text-destructive"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex items-center border border-ink/15">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-ink-muted hover:bg-cream"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-ink-muted hover:bg-cream"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="text-sm tabular-nums text-ink">
                        {formatMoney(item.unitPriceKobo * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink/10 bg-cream/40 px-5 py-5 sm:px-6">
              {toFreeShipping > 0 ? (
                <p className="mb-4 text-center text-xs leading-relaxed text-ink-muted">
                  {formatMoney(toFreeShipping)} more for complimentary delivery within Nigeria.
                </p>
              ) : (
                <p className="mb-4 text-center text-xs uppercase tracking-[0.14em] text-emerald">
                  Complimentary delivery unlocked
                </p>
              )}

              <div className="flex items-baseline justify-between">
                <span className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">
                  Subtotal
                </span>
                <span className="font-display text-2xl tabular-nums text-ink">
                  {formatMoney(subtotal)}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-ink-faint">
                Delivery calculated at checkout. Made-to-measure pieces take about 21 days.
              </p>

              <Button asChild full size="lg" className="mt-5" onClick={close}>
                <Link href="/checkout">Checkout</Link>
              </Button>
              <button
                type="button"
                onClick={close}
                className="mt-3 w-full text-center text-xs uppercase tracking-[0.16em] text-ink-muted underline-offset-4 hover:underline"
              >
                Keep looking
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
