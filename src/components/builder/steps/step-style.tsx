'use client';

import type { BaseStyle } from '@prisma/client';
import { Check } from 'lucide-react';

import { GarmentPreview } from '../garment-preview';
import { Badge } from '@/components/ui/badge';
import { OCCASION_LABELS } from '@/lib/constants';
import { priceFrom } from '@/lib/pricing';
import type { FabricCard } from '@/lib/queries';
import { cn, formatMoney } from '@/lib/utils';

/**
 * Step 1 — the cut.
 *
 * Each card renders the same GarmentPreview component used by the main frame,
 * at thumbnail size with seams off. That means a style card can never drift
 * out of sync with what the builder actually draws, and a new cut added in
 * /studio gets a thumbnail for free.
 */
export function StepStyle({
  baseStyles,
  fabrics,
  selectedId,
  onSelect,
}: {
  baseStyles: BaseStyle[];
  fabrics: FabricCard[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  // "From ₦x" uses the cheapest cloth in stock, so the figure is real.
  const cheapestPerMeter = fabrics.length
    ? Math.min(...fabrics.map((f) => f.pricePerMeterKobo))
    : 0;

  if (baseStyles.length === 0) {
    return (
      <p className="border border-dashed border-ink/20 p-8 text-center text-sm text-ink-muted">
        No cuts are available yet. They are added from the studio.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {baseStyles.map((style) => {
        const selected = style.id === selectedId;

        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onSelect(style.id)}
            aria-pressed={selected}
            className={cn(
              'group relative flex flex-col border p-3 text-left transition-all duration-300 ease-editorial sm:p-4',
              selected
                ? 'border-gold shadow-gold-ring'
                : 'border-ink/15 hover:border-ink/40 hover:shadow-lift',
            )}
          >
            {selected ? (
              <span className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center bg-gold text-ink">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            ) : null}

            <div className="aspect-[3/4] w-full bg-cream/40">
              {/* Silhouette drawn in a neutral cloth — the cut is the subject */}
              <GarmentPreview
                showSeams={false}
                config={{
                  baseStyleSlug: style.slug,
                  fabric: { family: 'WOOL', colorHex: '#8C8481' },
                  fit: style.supportedFits.includes('MATERNITY') && style.supportedFits.length === 2
                    ? 'MATERNITY'
                    : 'REGULAR',
                  liningHex: '#C6A15B',
                }}
              />
            </div>

            <div className="mt-3">
              <h3 className="font-display text-[1.05rem] leading-snug text-ink">{style.name}</h3>
              {style.tagline ? (
                <p className="mt-1 text-xs leading-snug text-ink-muted">{style.tagline}</p>
              ) : null}

              {cheapestPerMeter > 0 ? (
                <p className="mt-2.5 text-xs tabular-nums text-ink">
                  From{' '}
                  {formatMoney(
                    priceFrom(
                      {
                        name: style.name,
                        basePriceKobo: style.basePriceKobo,
                        yardageMeters: style.yardageMeters,
                      },
                      cheapestPerMeter,
                    ),
                  )}
                </p>
              ) : null}

              {style.supportedFits.includes('MATERNITY') ? (
                <Badge variant="emerald" className="mt-2.5">
                  Maternity available
                </Badge>
              ) : null}

              {style.occasions.length > 0 ? (
                <p className="mt-2 hidden text-[0.6rem] uppercase tracking-[0.12em] text-ink-faint sm:block">
                  {style.occasions.map((o) => OCCASION_LABELS[o]).join(' · ')}
                </p>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
