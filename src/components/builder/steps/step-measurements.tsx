'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, Check, Info, Loader2, Ruler, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FitPreference, MeasurementProfile } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  MEASUREMENT_FIELDS,
  TOLERANCE_CM,
  cmToIn,
  inToCm,
  profileCompleteness,
  type MeasurementGroup,
  type MeasurementKey,
} from '@/lib/measurements';
import type { MeasurementDraft } from '@/store/builder';
import { cn } from '@/lib/utils';

const GROUP_ORDER: MeasurementGroup[] = ['Upper body', 'Arm', 'Lower body', 'Lengths'];

/**
 * Step 5 — measurements.
 *
 * Three routes in, because the reason people abandon made-to-measure at this
 * point is always the same: they do not have a tape in the house.
 *   saved    — reuse a profile from the account
 *   manual   — type them against the guide
 *   estimate — answer four questions and let the heuristic fill them in
 *
 * The estimate is labelled honestly everywhere it appears. See
 * lib/measurements.ts for what it is and is not.
 */
export function StepMeasurements({
  profiles,
  isSignedIn,
  mode,
  onMode,
  profileId,
  onProfile,
  draft,
  onPatch,
  fit,
}: {
  profiles: MeasurementProfile[];
  isSignedIn: boolean;
  mode: 'saved' | 'manual' | 'estimate';
  onMode: (mode: 'saved' | 'manual' | 'estimate') => void;
  profileId: string | null;
  onProfile: (id: string | null) => void;
  draft: MeasurementDraft;
  onPatch: (patch: MeasurementDraft) => void;
  fit: FitPreference;
}) {
  const [unit, setUnit] = React.useState<'cm' | 'in'>('cm');
  const [estimating, setEstimating] = React.useState(false);

  const completeness = profileCompleteness(
    mode === 'saved' ? (profiles.find((p) => p.id === profileId) ?? {}) : draft,
  );

  async function runEstimate() {
    setEstimating(true);
    try {
      const res = await fetch('/api/measurements/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heightCm: draft.heightCm,
          weightKg: draft.weightKg,
          fitPreference: fit,
          braBandCm: draft.braBandCm || undefined,
          torsoLength: draft.torsoLength ?? 'AVERAGE',
          shoulderSlope: draft.shoulderSlope ?? 'AVERAGE',
          pregnancyWeeks: fit === 'MATERNITY' ? draft.pregnancyWeeks || undefined : undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Could not work that out');
      }

      const body = (await res.json()) as {
        values: Record<MeasurementKey, number>;
        notes: string[];
      };

      onPatch({ ...body.values, source: 'ESTIMATED' });
      onMode('manual'); // Drop into the manual view so the numbers can be edited.
      toast.success('Estimate ready', {
        description: 'Check them over — anything you know for certain, correct it now.',
      });
    } catch (error) {
      toast.error('Could not estimate', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setEstimating(false);
    }
  }

  const canEstimate = Boolean(draft.heightCm && draft.weightKg);

  return (
    <div>
      <Tabs value={mode} onValueChange={(v) => onMode(v as typeof mode)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {profiles.length > 0 ? <TabsTrigger value="saved">Saved</TabsTrigger> : null}
          <TabsTrigger value="manual">
            <Ruler className="mr-2 h-3.5 w-3.5" />
            Enter my own
          </TabsTrigger>
          <TabsTrigger value="estimate">
            <Wand2 className="mr-2 h-3.5 w-3.5" />
            Estimate for me
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------------- */}
        {/* Saved profiles                                                    */}
        {/* ---------------------------------------------------------------- */}
        {profiles.length > 0 ? (
          <TabsContent value="saved">
            <div className="space-y-3">
              {profiles.map((profile) => {
                const stats = profileCompleteness(profile);
                const isActive = profile.id === profileId;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => onProfile(profile.id)}
                    aria-pressed={isActive}
                    className={cn(
                      'flex w-full items-start gap-4 border p-4 text-left transition-all duration-300 ease-editorial',
                      isActive ? 'border-gold shadow-gold-ring' : 'border-ink/15 hover:border-ink/40',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                        isActive ? 'border-gold bg-gold' : 'border-ink/30',
                      )}
                      aria-hidden
                    >
                      {isActive ? <Check className="h-3 w-3 text-ink" strokeWidth={4} /> : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2.5">
                        <span className="font-display text-[1.05rem] text-ink">{profile.name}</span>
                        {profile.isDefault ? <Badge>Default</Badge> : null}
                        {profile.source === 'ESTIMATED' ? (
                          <Badge variant="terracotta">Estimated</Badge>
                        ) : null}
                      </span>

                      <span className="mt-1.5 block text-xs text-ink-muted">
                        {profile.bustCm ? `Bust ${profile.bustCm}cm · ` : ''}
                        {profile.waistCm ? `Waist ${profile.waistCm}cm · ` : ''}
                        {profile.hipCm ? `Hip ${profile.hipCm}cm` : ''}
                      </span>

                      <span
                        className={cn(
                          'mt-2 block text-[0.62rem] uppercase tracking-[0.12em]',
                          stats.isComplete ? 'text-emerald' : 'text-terracotta',
                        )}
                      >
                        {stats.isComplete
                          ? 'Complete'
                          : `${stats.filled} of ${stats.total} required measurements`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </TabsContent>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Manual entry                                                      */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="manual">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
                Units
              </span>
              <div className="flex border border-ink/20">
                {(['cm', 'in'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    aria-pressed={unit === u}
                    className={cn(
                      'px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] transition-colors',
                      unit === u ? 'bg-ink text-ivory' : 'text-ink-muted hover:text-ink',
                    )}
                  >
                    {u === 'cm' ? 'Centimetres' : 'Inches'}
                  </button>
                ))}
              </div>
            </div>

            <Link
              href="/measurement-guide"
              target="_blank"
              className="link-underline text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted"
            >
              How to measure
            </Link>
          </div>

          {draft.source === 'ESTIMATED' ? (
            <div className="mb-6 flex gap-3 border border-terracotta/35 bg-terracotta-wash/50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-deep" aria-hidden />
              <p className="text-xs leading-relaxed text-ink-muted">
                These came from our proportion table, not a tape — expect them to be within about{' '}
                {TOLERANCE_CM}cm. Correct anything you know for certain, and we will confirm the
                rest with you on a short video call before cutting.
              </p>
            </div>
          ) : null}

          <div className="space-y-8">
            {GROUP_ORDER.map((group) => {
              const fields = MEASUREMENT_FIELDS.filter((f) => f.group === group);
              if (fields.length === 0) return null;

              return (
                <fieldset key={group}>
                  <legend className="eyebrow mb-4">{group}</legend>

                  <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                    {fields.map((field) => {
                      const raw = draft[field.key];
                      const shown =
                        raw == null ? '' : unit === 'cm' ? String(raw) : cmToIn(raw).toFixed(1);

                      return (
                        <div key={field.key}>
                          <div className="mb-1.5 flex items-baseline justify-between gap-2">
                            <Label htmlFor={field.key} className="normal-case tracking-normal">
                              <span className="text-[0.7rem] uppercase tracking-[0.14em]">
                                {field.label}
                              </span>
                            </Label>
                            {field.core ? (
                              <span className="text-[0.58rem] uppercase tracking-[0.12em] text-gold-deep">
                                Required
                              </span>
                            ) : null}
                          </div>

                          <div className="relative">
                            <Input
                              id={field.key}
                              type="number"
                              inputMode="decimal"
                              step="0.1"
                              value={shown}
                              placeholder={unit === 'cm' ? '—' : '—'}
                              onChange={(e) => {
                                const next = e.target.value;
                                if (next === '') {
                                  onPatch({ [field.key]: null } as MeasurementDraft);
                                  return;
                                }
                                const parsed = Number(next);
                                if (Number.isNaN(parsed)) return;
                                onPatch({
                                  [field.key]:
                                    unit === 'cm'
                                      ? Math.round(parsed * 10) / 10
                                      : Math.round(inToCm(parsed) * 10) / 10,
                                  // Any manual edit means it is no longer a
                                  // pure machine estimate.
                                  ...(draft.source === 'ESTIMATED' ? {} : { source: 'MANUAL' }),
                                } as MeasurementDraft);
                              }}
                              className="pr-12"
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint">
                              {unit}
                            </span>
                          </div>

                          <p className="mt-1.5 text-[0.68rem] leading-relaxed text-ink-faint">
                            {field.howTo.split('.')[0]}.
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* Estimate                                                          */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="estimate">
          <div className="mb-7 flex gap-3 border border-ink/15 bg-cream/50 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden />
            <div className="text-xs leading-relaxed text-ink-muted">
              <p>
                We work these out from your height and weight using a tailoring proportion table,
                adjusted by the questions below. It is an educated starting point, typically within
                about {TOLERANCE_CM}cm —{' '}
                <strong className="text-ink">not a body scan and not machine learning</strong>.
              </p>
              <p className="mt-2">
                Anything estimated is flagged on your order, confirmed with you on a short video
                call before we cut, and made with extra seam allowance so it can be let out.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="heightCm"
              label="Height"
              suffix="cm"
              value={draft.heightCm ?? ''}
              onChange={(v) => onPatch({ heightCm: v })}
              min={130}
              max={210}
            />
            <NumberField
              id="weightKg"
              label="Weight"
              suffix="kg"
              value={draft.weightKg ?? ''}
              onChange={(v) => onPatch({ weightKg: v })}
              min={35}
              max={200}
            />
            <NumberField
              id="braBandCm"
              label="Bra band size"
              hint="Optional, but it sharpens the upper body a lot."
              suffix="cm"
              value={draft.braBandCm ?? ''}
              onChange={(v) => onPatch({ braBandCm: v })}
              min={55}
              max={130}
            />
            {fit === 'MATERNITY' ? (
              <NumberField
                id="pregnancyWeeks"
                label="Weeks pregnant"
                hint="So we build in the right bump allowance."
                suffix="wks"
                value={draft.pregnancyWeeks ?? ''}
                onChange={(v) => onPatch({ pregnancyWeeks: v })}
                min={1}
                max={42}
              />
            ) : null}
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <ChoiceField
              label="Your torso is…"
              value={draft.torsoLength ?? 'AVERAGE'}
              options={[
                { value: 'SHORT', label: 'Short' },
                { value: 'AVERAGE', label: 'Average' },
                { value: 'LONG', label: 'Long' },
              ]}
              onChange={(v) => onPatch({ torsoLength: v as 'SHORT' | 'AVERAGE' | 'LONG' })}
              hint="If tops are usually too long on you, choose short."
            />

            <ChoiceField
              label="Your shoulders are…"
              value={draft.shoulderSlope ?? 'AVERAGE'}
              options={[
                { value: 'SQUARE', label: 'Square' },
                { value: 'AVERAGE', label: 'Average' },
                { value: 'SLOPED', label: 'Sloped' },
              ]}
              onChange={(v) => onPatch({ shoulderSlope: v as 'SQUARE' | 'AVERAGE' | 'SLOPED' })}
              hint="If bag straps slide off, choose sloped."
            />
          </div>

          <Button
            size="lg"
            className="mt-8"
            onClick={runEstimate}
            disabled={!canEstimate || estimating}
          >
            {estimating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {estimating ? 'Working it out…' : 'Estimate my measurements'}
          </Button>

          {!canEstimate ? (
            <p className="mt-2.5 text-xs text-ink-faint">Enter your height and weight first.</p>
          ) : null}
        </TabsContent>
      </Tabs>

      {/* Progress */}
      {mode !== 'estimate' ? (
        <div className="mt-8 flex items-center gap-4 border-t border-ink/10 pt-6">
          <div className="h-1 flex-1 bg-ink/10">
            <div
              className={cn(
                'h-full transition-all duration-500 ease-editorial',
                completeness.isComplete ? 'bg-emerald' : 'bg-gold',
              )}
              style={{ width: `${completeness.percent}%` }}
            />
          </div>
          <p className="shrink-0 text-xs tabular-nums text-ink-muted">
            {completeness.filled}/{completeness.total} required
          </p>
        </div>
      ) : null}

      {!isSignedIn && mode !== 'estimate' ? (
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          <Link href="/login?callbackUrl=/builder" className="link-underline text-ink">
            Sign in
          </Link>{' '}
          and we will save these as a profile so you never type them twice.
        </p>
      ) : null}
    </div>
  );
}

function NumberField({
  id,
  label,
  hint,
  suffix,
  value,
  onChange,
  min,
  max,
}: {
  id: string;
  label: string;
  hint?: string;
  suffix: string;
  value: number | string;
  onChange: (value: number | null) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="mt-1 text-[0.68rem] text-ink-faint">{hint}</p> : null}
      <div className="relative mt-1.5">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const next = e.target.value;
            onChange(next === '' ? null : Number(next));
          }}
          className="pr-12"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function ChoiceField({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1 block font-sans text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </legend>
      {hint ? <p className="mb-2.5 text-[0.68rem] text-ink-faint">{hint}</p> : null}
      <div className="flex border border-ink/20">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              'flex-1 px-3 py-2.5 text-xs transition-colors',
              value === option.value ? 'bg-ink text-ivory' : 'text-ink-muted hover:text-ink',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
