'use client';

import * as React from 'react';
import { ChevronUp } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { PriceBreakdown } from '@/lib/pricing';
import { cn, formatMoney } from '@/lib/utils';

/**
 * The running total in the builder's footer, with the itemised breakdown one
 * tap away. The price is never hidden until checkout — every option chip
 * already shows its own surcharge, and this shows the sum of them.
 */
export function PriceSummary({
  price,
  className,
}: {
  price: PriceBreakdown | null;
  className?: string;
}) {
  if (!price) {
    return (
      <p className={cn('items-center text-xs text-ink-faint', className)}>
        Choose a cut and a cloth to see the price
      </p>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'group items-center gap-2 text-left transition-colors hover:text-ink',
          className,
        )}
      >
        <span className="flex flex-col">
          <span className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-faint">
            Running total
          </span>
          <span className="flex items-center gap-1.5 font-display text-lg tabular-nums text-ink">
            {formatMoney(price.totalKobo)}
            <ChevronUp className="h-3.5 w-3.5 text-ink-faint transition-transform group-data-[state=open]:rotate-180" />
          </span>
        </span>
      </PopoverTrigger>

      <PopoverContent side="top" align="start" className="w-80">
        <p className="eyebrow mb-3">What makes up the price</p>

        <dl className="space-y-2">
          {price.lines.map((line) => (
            <div key={line.key} className="flex items-baseline justify-between gap-4">
              <dt className="min-w-0">
                <span className="block text-xs text-ink">{line.label}</span>
                {line.detail ? (
                  <span className="block text-[0.68rem] text-ink-faint">{line.detail}</span>
                ) : null}
              </dt>
              <dd className="shrink-0 text-xs tabular-nums text-ink">
                {formatMoney(line.amountKobo)}
              </dd>
            </div>
          ))}
        </dl>

        <hr className="gold-rule my-3 border-0" />

        <div className="flex items-baseline justify-between">
          <span className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted">Total</span>
          <span className="font-display text-xl tabular-nums text-ink">
            {formatMoney(price.totalKobo)}
          </span>
        </div>

        <p className="mt-2.5 text-[0.68rem] leading-relaxed text-ink-faint">
          Delivery calculated at checkout. Free within Nigeria over ₦300,000.
        </p>
      </PopoverContent>
    </Popover>
  );
}
