'use client';

import type { BaseStyle, DesignOption, DesignOptionCategory } from '@prisma/client';
import { Check } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DESIGN_CATEGORY_LABELS, DESIGN_CATEGORY_ORDER } from '@/lib/constants';
import { MONOGRAM_PRICE_KOBO } from '@/lib/pricing';
import { cn, formatMoney } from '@/lib/utils';

/**
 * Step 3 — the details.
 *
 * Every selection writes straight to the store, so the preview on the left
 * redraws in the same frame. Colour-bearing categories (buttons, lining,
 * trim) render as swatches; everything else renders as a labelled chip with
 * its price difference stated on the chip itself — no hidden surcharges
 * revealed at the review step.
 */
export function StepDetails({
  baseStyle,
  options,
  selected,
  onSelect,
  monogram,
  onMonogram,
}: {
  baseStyle: BaseStyle | null;
  options: DesignOption[];
  selected: Partial<Record<DesignOptionCategory, string>>;
  onSelect: (category: DesignOptionCategory, optionId: string) => void;
  monogram: string;
  onMonogram: (value: string) => void;
}) {
  if (!baseStyle) {
    return (
      <p className="border border-dashed border-ink/20 p-8 text-center text-sm text-ink-muted">
        Choose a cut first and the details available for it will appear here.
      </p>
    );
  }

  // Only the categories this cut supports, in house order.
  const categories = DESIGN_CATEGORY_ORDER.filter((category) =>
    baseStyle.optionCategories.includes(category),
  );

  if (categories.length === 0) {
    return (
      <div className="border border-dashed border-ink/20 p-8 text-center">
        <p className="text-sm text-ink-muted">
          The {baseStyle.name.toLowerCase()} is made to one specification — there is nothing to
          configure here. Continue to the fit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-9">
      {categories.map((category) => {
        const forCategory = options
          .filter((o) => o.category === category)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        if (forCategory.length === 0) return null;

        const isColorCategory =
          category === 'BUTTON_COLOR' || category === 'LINING' || category === 'TRIM';
        const activeId = selected[category];
        const active = forCategory.find((o) => o.id === activeId);

        return (
          <fieldset key={category}>
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <legend className="eyebrow">{DESIGN_CATEGORY_LABELS[category]}</legend>
              {active ? (
                <span className="text-xs text-ink-muted">{active.name}</span>
              ) : null}
            </div>

            {isColorCategory && forCategory.some((o) => o.colorHex) ? (
              <div className="flex flex-wrap gap-2.5">
                {forCategory.map((option) => {
                  const isActive = option.id === activeId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onSelect(category, option.id)}
                      aria-pressed={isActive}
                      title={`${option.name}${option.priceModifierKobo ? ` — +${formatMoney(option.priceModifierKobo)}` : ''}`}
                      className={cn(
                        'relative flex h-14 w-14 items-center justify-center border transition-all duration-300 ease-editorial',
                        isActive
                          ? 'border-gold shadow-gold-ring'
                          : 'border-ink/15 hover:border-ink/45',
                      )}
                    >
                      <span
                        className="block h-full w-full"
                        style={{ backgroundColor: option.colorHex ?? '#E7DBC7' }}
                      />
                      {isActive ? (
                        <Check
                          className="absolute h-5 w-5 text-ivory mix-blend-difference"
                          strokeWidth={3}
                        />
                      ) : null}
                      <span className="sr-only">
                        {option.name}
                        {option.priceModifierKobo
                          ? `, adds ${formatMoney(option.priceModifierKobo)}`
                          : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {forCategory.map((option) => {
                  const isActive = option.id === activeId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onSelect(category, option.id)}
                      aria-pressed={isActive}
                      className={cn(
                        'flex items-start gap-3 border p-3.5 text-left transition-all duration-300 ease-editorial',
                        isActive
                          ? 'border-gold shadow-gold-ring'
                          : 'border-ink/15 hover:border-ink/40',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                          isActive ? 'border-gold bg-gold' : 'border-ink/30',
                        )}
                        aria-hidden
                      >
                        {isActive ? <Check className="h-2.5 w-2.5 text-ink" strokeWidth={4} /> : null}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <span className="text-sm text-ink">{option.name}</span>
                          <span
                            className={cn(
                              'shrink-0 text-xs tabular-nums',
                              option.priceModifierKobo > 0 ? 'text-ink-muted' : 'text-ink-faint',
                            )}
                          >
                            {option.priceModifierKobo > 0
                              ? `+${formatMoney(option.priceModifierKobo)}`
                              : 'Included'}
                          </span>
                        </span>

                        {option.description ? (
                          <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        );
      })}

      {/* Monogram */}
      <div className="border-t border-ink/10 pt-8">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <Label htmlFor="monogram">Monogram</Label>
          <span className="text-xs tabular-nums text-ink-muted">
            {monogram ? `+${formatMoney(MONOGRAM_PRICE_KOBO)}` : `+${formatMoney(MONOGRAM_PRICE_KOBO)} if added`}
          </span>
        </div>

        <p className="mb-3 max-w-lg text-xs leading-relaxed text-ink-faint">
          Up to four letters, hand-embroidered inside the left facing where only you will see it.
          Leave it empty for none.
        </p>

        <Input
          id="monogram"
          value={monogram}
          onChange={(e) => onMonogram(e.target.value)}
          placeholder="A.O."
          maxLength={4}
          autoCapitalize="characters"
          className="max-w-[10rem] font-display text-lg uppercase tracking-[0.2em]"
        />
      </div>
    </div>
  );
}
