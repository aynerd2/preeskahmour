'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useCart, type CartItem } from '@/store/cart';

/**
 * Adds a ready-to-shop piece to the bag.
 *
 * The price sent here is display-only — checkout re-derives every line from
 * the database before creating the order, so a tampered localStorage cart
 * cannot buy a ₦300,000 suit for ₦1.
 */
export function AddToCartButton({
  item,
  label = 'Add to bag',
  className,
}: {
  item: Omit<CartItem, 'id' | 'addedAt' | 'quantity'>;
  label?: string;
  className?: string;
}) {
  const addItem = useCart((s) => s.addItem);
  const [pending, setPending] = React.useState(false);

  function onAdd() {
    setPending(true);
    addItem(item);
    toast.success('Added to your bag', { description: item.name });
    // Purely cosmetic: the drawer opens immediately, so the button needs a
    // beat of feedback rather than snapping back before the eye catches it.
    window.setTimeout(() => setPending(false), 600);
  }

  return (
    <Button size="lg" full className={className} onClick={onAdd} disabled={pending}>
      {pending ? 'Added' : label}
    </Button>
  );
}
