'use client';

import Link from 'next/link';
import { AlertCircle, Pencil } from 'lucide-react';
import type { BaseStyle, DesignOption, FitPreference, MeasurementProfile } from '@prisma/client';

import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DESIGN_CATEGORY_LABELS,
  FABRIC_FAMILY_LABELS,
  FIT_LABELS,
} from '@/lib/constants';
import { MEASUREMENT_FIELDS, TOLERANCE_CM } from '@/lib/measurements';
import type { PriceBreakdown } from '@/lib/pricing';
import { fabricImage } from '@/lib/swatches';
import type { FabricCard } from '@/lib/queries';
import type { MeasurementDraft, StepKey } from '@/store/builder';
import { formatMoney } from '@/lib/utils';

/**
 * Step 6 — review.
 *
 * Every line is itemised and every line links back to the step that set it.
 * A customer about to commit ₦200,000 should never have to guess what made
 * up the number, or click through five screens to change one button.
 */
export function StepReview({
  baseStyle,
  fabric,
  fit,
  options,
  price,
  monogram,
  notes,
  onNotes,
  profile,
  draft,
  mode,
  onEditStep,
}: {
  baseStyle: BaseStyle | null;
  fabric: FabricCard | null;
  fit: FitPreference;
  options: DesignOption[];
  price: PriceBreakdown | null;
  monogram: string;
  notes: string;
  onNotes: (value: string) => void;
  profile: MeasurementProfile | null;
  draft: MeasurementDraft;
  mode: 'saved' | 'manual' | 'estimate';
  onEditStep: (step: StepKey) => void;
}) {
  if (!baseStyle || !fabric || !price) {
    return (
      <p className="border border-dashed border-ink/20 p-8 text-center text-sm text-ink-muted">
        Choose a cut and a cloth and the full recap will appear here.
      </p>
    );
  }

  const measurements = mode === 'saved' && profile ? profile : draft;
  const isEstimated =
    (mode === 'saved' ? profile?.source : draft.source) === 'ESTIMATED';

  return (
    <div className="space-y-10">
      {/* The piece */}
      <section>
        <SectionRow title="The piece" onEdit={() => onEditStep('style')} />

        <div className="flex gap-4 border border-ink/12 p-4">
          <span
            className="h-20 w-20 shrink-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${fabricImage(fabric)}")` }}
            aria-hidden
          />
          <div className="min-w-0">
            <h3 className="font-display text-[1.15rem] text-ink">{baseStyle.name}</h3>
            <p className="mt-1 text-sm text-ink-muted">
              {fabric.name} · {FABRIC_FAMILY_LABELS[fabric.family]}
            </p>
            {fabric.origin ? (
              <p className="mt-0.5 text-xs text-ink-faint">{fabric.origin}</p>
            ) : null}
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Badge variant="emerald">{FIT_LABELS[fit]}</Badge>
              <Badge>{price.yardageMeters.toFixed(2)}m of cloth</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section>
        <SectionRow title="Details" onEdit={() => onEditStep('details')} />

        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {options.map((option) => (
            <div key={option.id} className="flex items-baseline justify-between gap-3 border-b border-ink/8 pb-2.5">
              <dt className="text-[0.66rem] uppercase tracking-[0.12em] text-ink-faint">
                {DESIGN_CATEGORY_LABELS[option.category]}
              </dt>
              <dd className="flex items-center gap-2 text-sm text-ink">
                {option.colorHex ? (
                  <span
                    className="h-3.5 w-3.5 shrink-0 border border-ink/20"
                    style={{ backgroundColor: option.colorHex }}
                    aria-hidden
                  />
                ) : null}
                {option.name}
              </dd>
            </div>
          ))}

          {monogram ? (
            <div className="flex items-baseline justify-between gap-3 border-b border-ink/8 pb-2.5">
              <dt className="text-[0.66rem] uppercase tracking-[0.12em] text-ink-faint">
                Monogram
              </dt>
              <dd className="font-display text-sm uppercase tracking-[0.2em] text-ink">
                {monogram}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      {/* Measurements */}
      <section>
        <SectionRow title="Measurements" onEdit={() => onEditStep('measurements')} />

        {isEstimated ? (
          <div className="mb-4 flex gap-3 border border-terracotta/35 bg-terracotta-wash/50 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-deep" aria-hidden />
            <p className="text-xs leading-relaxed text-ink-muted">
              These are estimated from your height and weight — expect them to be within about{' '}
              {TOLERANCE_CM}cm. We will confirm them with you on a short video call before cutting,
              and the piece is made with extra seam allowance.
            </p>
          </div>
        ) : null}

        {mode === 'saved' && profile ? (
          <p className="mb-3 text-sm text-ink-muted">
            Using your saved profile <strong className="text-ink">{profile.name}</strong>.
          </p>
        ) : null}

        <dl className="grid grid-cols-2 gap-x-8 gap-y-2.5 sm:grid-cols-3">
          {MEASUREMENT_FIELDS.filter((field) => measurements[field.key] != null).map((field) => (
            <div key={field.key} className="flex items-baseline justify-between gap-2 border-b border-ink/8 pb-2">
              <dt className="text-[0.62rem] uppercase tracking-[0.12em] text-ink-faint">
                {field.label}
              </dt>
              <dd className="text-sm tabular-nums text-ink">
                {measurements[field.key]}
                <span className="text-ink-faint">cm</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Notes for the atelier */}
      <section>
        <Label htmlFor="design-notes">Anything we should know?</Label>
        <p className="mb-2.5 mt-1 max-w-xl text-xs leading-relaxed text-ink-faint">
          A shoulder that sits lower than the other, a sleeve you like a little shorter than the
          measurement suggests, the date you need it by. It reaches the person cutting the cloth.
        </p>
        <Textarea
          id="design-notes"
          rows={4}
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="My right shoulder is about 1cm lower than my left…"
        />
      </section>

      {/* Price */}
      <section className="border-t border-ink/15 pt-7">
        <h2 className="eyebrow mb-4">The price, itemised</h2>

        <dl className="space-y-2.5">
          {price.lines.map((line) => (
            <div key={line.key} className="flex items-baseline justify-between gap-6">
              <dt className="min-w-0">
                <span className="block text-sm text-ink">{line.label}</span>
                {line.detail ? (
                  <span className="block text-xs text-ink-faint">{line.detail}</span>
                ) : null}
              </dt>
              <dd className="shrink-0 text-sm tabular-nums text-ink">
                {formatMoney(line.amountKobo)}
              </dd>
            </div>
          ))}
        </dl>

        <hr className="gold-rule my-5 border-0" />

        <div className="flex items-baseline justify-between gap-6">
          <span className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">Total</span>
          <span className="font-display text-3xl tabular-nums text-ink">
            {formatMoney(price.totalKobo)}
          </span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          Delivery is calculated at checkout, and is complimentary within Nigeria over ₦300,000.
          About {baseStyle.name.toLowerCase().includes('three-piece') ? '28' : '21'} days in the
          atelier. Your first alteration is free — see{' '}
          <Link href="/returns" target="_blank" className="link-underline text-ink">
            alterations &amp; returns
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

function SectionRow({ title, onEdit }: { title: string; onEdit: () => void }) {
  return (
    <div className="mb-3.5 flex items-baseline justify-between gap-4">
      <h2 className="eyebrow">{title}</h2>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-ink"
      >
        <Pencil className="h-3 w-3" />
        Change
      </button>
    </div>
  );
}
