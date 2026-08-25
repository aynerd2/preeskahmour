'use client';

import type { BaseStyle, FitPreference } from '@prisma/client';
import { Check, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { FIT_DESCRIPTIONS, FIT_LABELS } from '@/lib/constants';
import { FIT_SURCHARGE_KOBO, FIT_YARDAGE_MULTIPLIER } from '@/lib/pricing';
import { cn, formatMoney } from '@/lib/utils';

/**
 * Step 4 — the fit.
 *
 * Maternity is given its own treatment rather than being buried as a fourth
 * radio button. It is a genuinely different construction — panels, stay,
 * rebalanced hem — and it is the thing this house does that most others do
 * not, so the step says exactly what you are buying and what it costs.
 */
export function StepFit({
  baseStyle,
  value,
  onChange,
}: {
  baseStyle: BaseStyle | null;
  value: FitPreference;
  onChange: (fit: FitPreference) => void;
}) {
  const supported = baseStyle?.supportedFits ?? ['REGULAR', 'SLIM', 'RELAXED'];
  const standard = supported.filter((f) => f !== 'MATERNITY');
  const maternityAvailable = supported.includes('MATERNITY');

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {standard.map((fit) => {
          const isActive = value === fit;
          return (
            <button
              key={fit}
              type="button"
              onClick={() => onChange(fit)}
              aria-pressed={isActive}
              className={cn(
                'flex flex-col border p-5 text-left transition-all duration-300 ease-editorial',
                isActive ? 'border-gold shadow-gold-ring' : 'border-ink/15 hover:border-ink/40',
              )}
            >
              <span className="flex items-center justify-between">
                <span className="font-display text-lg text-ink">{FIT_LABELS[fit]}</span>
                {isActive ? (
                  <span className="flex h-5 w-5 items-center justify-center bg-gold text-ink">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                ) : null}
              </span>

              <span className="mt-2.5 text-xs leading-relaxed text-ink-muted">
                {FIT_DESCRIPTIONS[fit]}
              </span>

              <span className="mt-4 text-[0.62rem] uppercase tracking-[0.12em] text-ink-faint">
                {/* Cloth consumption really does move with the cut, so say so. */}
                {FIT_YARDAGE_MULTIPLIER[fit] === 1
                  ? 'Standard yardage'
                  : `${FIT_YARDAGE_MULTIPLIER[fit] > 1 ? '+' : ''}${Math.round(
                      (FIT_YARDAGE_MULTIPLIER[fit] - 1) * 100,
                    )}% cloth`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Maternity */}
      {maternityAvailable ? (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-gold-deep" aria-hidden />
            <p className="eyebrow">What we are known for</p>
          </div>

          <button
            type="button"
            onClick={() => onChange('MATERNITY')}
            aria-pressed={value === 'MATERNITY'}
            className={cn(
              'motif-diamond w-full border p-6 text-left transition-all duration-300 ease-editorial sm:p-8',
              value === 'MATERNITY'
                ? 'border-gold shadow-gold-ring'
                : 'border-ink/20 hover:border-ink/45',
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl text-ink">{FIT_LABELS.MATERNITY}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-emerald">
                  Grows up to 14cm
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="gold">
                  +{formatMoney(FIT_SURCHARGE_KOBO.MATERNITY)}
                </Badge>
                {value === 'MATERNITY' ? (
                  <span className="flex h-6 w-6 items-center justify-center bg-gold text-ink">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                ) : null}
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted">
              {FIT_DESCRIPTIONS.MATERNITY}
            </p>

            <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">
              {[
                {
                  title: 'Side expansion panels',
                  body: 'Folded panels of your own cloth in both side seams, released by hand as you grow.',
                },
                {
                  title: 'Ribbed under-bust stay',
                  body: 'Anchors the jacket at the one point on a changing torso that stays put.',
                },
                {
                  title: 'Rebalanced hem',
                  body: 'The front is drafted longer than the back so it reads level over the bump.',
                },
              ].map((item) => (
                <li key={item.title} className="border-t border-ink/15 pt-3">
                  <p className="text-xs font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{item.body}</p>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-xs leading-relaxed text-ink-faint">
              Afterwards, bring it back: we close the panels permanently and re-cut the waist, free
              within the first year. The preview shows the panel release lines in gold.
            </p>
          </button>
        </div>
      ) : (
        <p className="border border-dashed border-ink/20 p-5 text-sm leading-relaxed text-ink-muted">
          The {baseStyle?.name.toLowerCase() ?? 'chosen cut'} is not made in the maternity
          construction. The <strong className="text-ink">Maternity-Adjustable Set</strong> and the{' '}
          <strong className="text-ink">Wrap Jacket &amp; Trouser</strong> both are — go back to step
          one to switch.
        </p>
      )}
    </div>
  );
}
