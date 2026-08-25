'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import type {
  BaseStyle,
  DesignOption,
  DesignOptionCategory,
  MeasurementProfile,
} from '@prisma/client';

import { GarmentPreview, type GarmentConfig } from './garment-preview';
import { StepStyle } from './steps/step-style';
import { StepFabric } from './steps/step-fabric';
import { StepDetails } from './steps/step-details';
import { StepFit } from './steps/step-fit';
import { StepMeasurements } from './steps/step-measurements';
import { StepReview } from './steps/step-review';
import { PriceSummary } from './price-summary';
import { Button } from '@/components/ui/button';
import { useBuilder, STEPS, stepIndex, type StepKey } from '@/store/builder';
import { useCart } from '@/store/cart';
import { priceCustomDesign, type PriceBreakdown } from '@/lib/pricing';
import { profileCompleteness } from '@/lib/measurements';
import type { FabricCard } from '@/lib/queries';
import type { BuilderPreselect } from '@/app/(marketing)/builder/page';
import { cn, formatMoney } from '@/lib/utils';

export function BuilderShell({
  baseStyles,
  fabrics,
  designOptions,
  profiles,
  preselect,
  isSignedIn,
  initialStep,
}: {
  baseStyles: BaseStyle[];
  fabrics: FabricCard[];
  designOptions: DesignOption[];
  profiles: MeasurementProfile[];
  preselect: BuilderPreselect | null;
  isSignedIn: boolean;
  initialStep?: string;
}) {
  const router = useRouter();
  const addToCart = useCart((s) => s.addItem);

  const state = useBuilder();
  const {
    step,
    baseStyleId,
    fabricId,
    fit,
    options,
    monogram,
    hydrated,
    setStep,
    setBaseStyle,
    setFabric,
    setOptions,
    setSavedDesignId,
  } = state;

  const [saving, setSaving] = React.useState(false);
  const [adding, setAdding] = React.useState(false);

  const baseStyle = baseStyles.find((s) => s.id === baseStyleId) ?? null;
  const fabric = fabrics.find((f) => f.id === fabricId) ?? null;

  /** Options that apply to the current cut: global ones plus its own. */
  const availableOptions = React.useMemo(() => {
    if (!baseStyle) return [];
    return designOptions.filter(
      (option) =>
        (option.baseStyleId === null || option.baseStyleId === baseStyle.id) &&
        baseStyle.optionCategories.includes(option.category),
    );
  }, [designOptions, baseStyle]);

  /** Fill in any category the customer has not touched with its default. */
  const applyDefaults = React.useCallback(
    (styleId: string) => {
      const style = baseStyles.find((s) => s.id === styleId);
      if (!style) return;

      const defaults: Partial<Record<DesignOptionCategory, string>> = {};
      for (const category of style.optionCategories) {
        const candidates = designOptions.filter(
          (o) =>
            o.category === category &&
            (o.baseStyleId === null || o.baseStyleId === style.id),
        );
        const chosen = candidates.find((o) => o.isDefault) ?? candidates[0];
        if (chosen) defaults[category] = chosen.id;
      }
      setOptions(defaults);
    },
    [baseStyles, designOptions, setOptions],
  );

  // --- deep-link preselection ---------------------------------------------
  // Runs once after rehydration. Guarded so it cannot stomp on a design the
  // customer is already part-way through in this tab.
  const appliedPreselect = React.useRef(false);
  React.useEffect(() => {
    if (!hydrated || appliedPreselect.current) return;
    appliedPreselect.current = true;

    if (initialStep && STEPS.some((s) => s.key === initialStep)) {
      setStep(initialStep as StepKey);
    }

    if (!preselect) {
      // Fresh session with a style already chosen but no options: seed them.
      if (baseStyleId && Object.keys(options).length === 0) applyDefaults(baseStyleId);
      return;
    }

    if (preselect.baseStyleId) {
      setBaseStyle(preselect.baseStyleId);
      applyDefaults(preselect.baseStyleId);
    }
    if (preselect.fabricId) setFabric(preselect.fabricId);
    if (preselect.fit) state.setFit(preselect.fit);
    if (preselect.monogram) state.setMonogram(preselect.monogram);
    if (preselect.measurementProfileId) {
      state.setMeasurementProfile(preselect.measurementProfileId);
      state.setMeasurementMode('saved');
    }
    if (preselect.designId) setSavedDesignId(preselect.designId);

    // A saved draft's exact option ids override the defaults just applied.
    if (preselect.optionIds?.length) {
      const chosen: Partial<Record<DesignOptionCategory, string>> = {};
      for (const id of preselect.optionIds) {
        const option = designOptions.find((o) => o.id === id);
        if (option) chosen[option.category] = option.id;
      }
      setOptions(chosen);
    }

    // Land on the first step that still needs an answer.
    if (!initialStep) {
      if (preselect.designId) setStep('review');
      else if (preselect.baseStyleId && !preselect.fabricId) setStep('fabric');
      else if (preselect.fabricId && !preselect.baseStyleId) setStep('style');
      else if (preselect.baseStyleId && preselect.fabricId) setStep('details');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // --- derived -------------------------------------------------------------

  const selectedOptions = React.useMemo(
    () =>
      Object.values(options)
        .map((id) => designOptions.find((o) => o.id === id))
        .filter((o): o is DesignOption => Boolean(o)),
    [options, designOptions],
  );

  const optionBySlug = React.useCallback(
    (category: DesignOptionCategory) => {
      const id = options[category];
      return designOptions.find((o) => o.id === id) ?? null;
    },
    [options, designOptions],
  );

  const price: PriceBreakdown | null = React.useMemo(() => {
    if (!baseStyle || !fabric) return null;
    return priceCustomDesign({
      baseStyle: {
        name: baseStyle.name,
        basePriceKobo: baseStyle.basePriceKobo,
        yardageMeters: baseStyle.yardageMeters,
      },
      fabric: { name: fabric.name, pricePerMeterKobo: fabric.pricePerMeterKobo },
      options: selectedOptions.map((o) => ({
        id: o.id,
        name: o.name,
        category: o.category,
        priceModifierKobo: o.priceModifierKobo,
      })),
      fit,
      monogram,
    });
  }, [baseStyle, fabric, selectedOptions, fit, monogram]);

  const previewConfig: GarmentConfig = React.useMemo(
    () => ({
      baseStyleSlug: baseStyle?.slug ?? 'blazer-trouser',
      fabric: fabric
        ? {
            family: fabric.family,
            colorHex: fabric.colorHex,
            swatchImage: fabric.swatchImage,
            textureImage: fabric.textureImage,
          }
        : null,
      fit,
      lapel: optionBySlug('LAPEL')?.slug,
      closure: optionBySlug('CLOSURE')?.slug,
      buttonCount: optionBySlug('BUTTON_COUNT')?.slug,
      buttonColorHex: optionBySlug('BUTTON_COLOR')?.colorHex ?? '#1B1714',
      pocket: optionBySlug('POCKET')?.slug,
      sleeve: optionBySlug('SLEEVE')?.slug,
      liningHex: optionBySlug('LINING')?.colorHex ?? '#0E5C4A',
      trim: optionBySlug('TRIM')?.slug,
      trimHex: optionBySlug('TRIM')?.colorHex ?? '#C6A15B',
      monogram,
      overlays: selectedOptions.map((o) => o.overlayUrl).filter((u): u is string => Boolean(u)),
    }),
    [baseStyle, fabric, fit, optionBySlug, monogram, selectedOptions],
  );

  const activeProfile = profiles.find((p) => p.id === state.measurementProfileId) ?? null;
  const measurementsReady =
    state.measurementMode === 'saved'
      ? Boolean(activeProfile) && profileCompleteness(activeProfile ?? {}).isComplete
      : profileCompleteness(state.measurementDraft).isComplete;

  /** Which steps can be advanced past, in order. */
  const canAdvance: Record<StepKey, boolean> = {
    style: Boolean(baseStyle),
    fabric: Boolean(fabric),
    details: true,
    fit: true,
    measurements: measurementsReady,
    review: measurementsReady && Boolean(baseStyle) && Boolean(fabric),
  };

  const index = stepIndex(step);

  // --- persistence ---------------------------------------------------------

  async function persistDesign(asDraft: boolean) {
    if (!baseStyle || !fabric) return null;

    const res = await fetch('/api/designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: state.savedDesignId ?? undefined,
        name: `${fabric.name} ${baseStyle.name.toLowerCase()}`,
        baseStyleId: baseStyle.id,
        fabricId: fabric.id,
        fit,
        optionIds: selectedOptions.map((o) => o.id),
        monogram: monogram || undefined,
        notes: state.notes || undefined,
        isDraft: asDraft,
        measurementProfileId:
          state.measurementMode === 'saved' ? state.measurementProfileId : undefined,
        measurementDraft:
          state.measurementMode === 'saved' ? undefined : state.measurementDraft,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? 'Could not save the design');
    }

    const body = (await res.json()) as { id: string };
    setSavedDesignId(body.id);
    return body.id;
  }

  async function onSaveDraft() {
    if (!isSignedIn) {
      toast('Sign in to save this design', {
        description: 'Your design stays in this tab either way — signing in keeps it for good.',
        action: { label: 'Sign in', onClick: () => router.push('/login?callbackUrl=/builder') },
      });
      return;
    }

    setSaving(true);
    try {
      await persistDesign(true);
      toast.success('Saved to your account', {
        description: 'Pick it up any time from Your designs.',
      });
    } catch (error) {
      toast.error('Could not save that', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  async function onAddToCart() {
    if (!baseStyle || !fabric || !price) return;

    setAdding(true);
    try {
      // The design row is created before the cart line, so the order always
      // has something durable to point at — a cart entry with no design
      // behind it would be unfulfillable.
      const designId = await persistDesign(false);
      if (!designId) throw new Error('Could not save the design');

      addToCart({
        kind: 'CUSTOM',
        customDesignId: designId,
        name: `${baseStyle.name} in ${fabric.name}`,
        descriptor: selectedOptions
          .filter((o) => ['LAPEL', 'POCKET', 'LINING'].includes(o.category))
          .map((o) => o.name)
          .join(' · '),
        unitPriceKobo: price.totalKobo,
        href: `/builder?design=${designId}`,
        measurementProfileId: state.measurementProfileId,
        designSnapshot: previewConfig,
      });

      toast.success('Added to your bag');
    } catch (error) {
      toast.error('Could not add that to your bag', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setAdding(false);
    }
  }

  // --- render --------------------------------------------------------------

  if (!hydrated) return <BuilderSkeleton />;

  return (
    <div className="lg:grid lg:min-h-[calc(100dvh-5rem)] lg:grid-cols-[minmax(0,45%)_minmax(0,55%)]">
      {/* ---------------------------------------------------------------- */}
      {/* Preview panel — sticky on desktop, a compact header on mobile     */}
      {/* ---------------------------------------------------------------- */}
      <aside className="motif-adire border-b border-ink/10 bg-cream/50 lg:sticky lg:top-20 lg:h-[calc(100dvh-5rem)] lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="relative flex-1 px-6 pb-4 pt-6 lg:px-10 lg:pb-6 lg:pt-10">
            <div className="mx-auto h-[38vh] max-w-sm lg:h-full lg:max-w-md">
              <GarmentPreview config={previewConfig} />
            </div>

            {!fabric ? (
              <p className="absolute inset-x-0 bottom-2 text-center text-xs text-ink-faint lg:bottom-6">
                Choose a cloth to see it applied
              </p>
            ) : null}
          </div>

          {/* Running price */}
          <div className="border-t border-ink/10 bg-ivory/70 px-6 py-4 backdrop-blur lg:px-10 lg:py-5">
            <div className="flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                  {baseStyle ? baseStyle.name : 'No cut chosen'}
                  {fabric ? ` · ${fabric.name}` : ''}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {price ? `${price.yardageMeters.toFixed(2)}m of cloth` : 'Price appears once you choose a cloth'}
                </p>
              </div>
              <p className="shrink-0 font-display text-2xl tabular-nums text-ink">
                {price ? formatMoney(price.totalKobo) : '—'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* Step panel                                                        */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col">
        {/* Progress */}
        <nav
          aria-label="Builder steps"
          className="hide-scrollbar sticky top-16 z-20 flex gap-1 overflow-x-auto border-b border-ink/10 bg-ivory/95 px-5 py-3 backdrop-blur sm:top-20 lg:px-10"
        >
          {STEPS.map((s, i) => {
            const done = i < index;
            const current = i === index;
            // Only allow jumping to a step whose prerequisites are met.
            const reachable = i <= index || STEPS.slice(0, i).every((p) => canAdvance[p.key]);

            return (
              <button
                key={s.key}
                type="button"
                disabled={!reachable}
                onClick={() => reachable && setStep(s.key)}
                aria-current={current ? 'step' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-2 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] transition-colors',
                  current && 'border-b-2 border-gold text-ink',
                  done && 'text-emerald',
                  !current && !done && 'text-ink-faint',
                  !reachable && 'cursor-not-allowed opacity-45',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center border text-[0.6rem]',
                    current && 'border-gold bg-gold text-ink',
                    done && 'border-emerald bg-emerald text-ivory',
                    !current && !done && 'border-ink/25',
                  )}
                >
                  {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                {s.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 px-5 py-8 sm:px-6 lg:px-10 lg:py-12">
          {preselect?.fromLabel && index === 0 ? (
            <p className="mb-7 border-l-2 border-gold bg-gold-wash/40 py-3 pl-4 pr-3 text-sm text-ink-muted">
              {preselect.fromLabel}
            </p>
          ) : null}

          <header className="mb-8">
            <p className="eyebrow">
              Step {index + 1} of {STEPS.length}
            </p>
            <h1 className="mt-3 text-display-sm text-ink">{STEPS[index].title}</h1>
          </header>

          {step === 'style' ? (
            <StepStyle
              baseStyles={baseStyles}
              fabrics={fabrics}
              selectedId={baseStyleId}
              onSelect={(id) => {
                setBaseStyle(id);
                applyDefaults(id);
              }}
            />
          ) : null}

          {step === 'fabric' ? (
            <StepFabric fabrics={fabrics} selectedId={fabricId} onSelect={setFabric} />
          ) : null}

          {step === 'details' ? (
            <StepDetails
              baseStyle={baseStyle}
              options={availableOptions}
              selected={options}
              onSelect={state.setOption}
              monogram={monogram}
              onMonogram={state.setMonogram}
            />
          ) : null}

          {step === 'fit' ? (
            <StepFit baseStyle={baseStyle} value={fit} onChange={state.setFit} />
          ) : null}

          {step === 'measurements' ? (
            <StepMeasurements
              profiles={profiles}
              isSignedIn={isSignedIn}
              mode={state.measurementMode}
              onMode={state.setMeasurementMode}
              profileId={state.measurementProfileId}
              onProfile={state.setMeasurementProfile}
              draft={state.measurementDraft}
              onPatch={state.patchMeasurements}
              fit={fit}
            />
          ) : null}

          {step === 'review' ? (
            <StepReview
              baseStyle={baseStyle}
              fabric={fabric}
              fit={fit}
              options={selectedOptions}
              price={price}
              monogram={monogram}
              notes={state.notes}
              onNotes={state.setNotes}
              profile={activeProfile}
              draft={state.measurementDraft}
              mode={state.measurementMode}
              onEditStep={setStep}
            />
          ) : null}
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Navigation                                                      */}
        {/* -------------------------------------------------------------- */}
        <div className="sticky bottom-0 z-20 border-t border-ink/10 bg-ivory/95 px-5 py-4 backdrop-blur sm:px-6 lg:px-10">
          {/* Mobile price line, since the preview panel scrolls away */}
          <div className="mb-3 flex items-baseline justify-between lg:hidden">
            <span className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">Total</span>
            <span className="font-display text-xl tabular-nums text-ink">
              {price ? formatMoney(price.totalKobo) : '—'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={state.back}
              disabled={index === 0}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            {step === 'review' ? (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={onSaveDraft}
                  disabled={saving || !price}
                  className="shrink-0"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span className="hidden sm:inline">Save design</span>
                </Button>

                <Button size="md" full onClick={onAddToCart} disabled={adding || !canAdvance.review}>
                  {adding ? 'Adding…' : `Add to bag — ${price ? formatMoney(price.totalKobo) : ''}`}
                </Button>
              </>
            ) : (
              <>
                <PriceSummary price={price} className="hidden flex-1 sm:flex" />

                <Button
                  size="md"
                  onClick={state.next}
                  disabled={!canAdvance[step]}
                  className="ml-auto min-w-[9rem]"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {step === 'measurements' && !measurementsReady ? (
            <p className="mt-2.5 text-xs text-ink-faint">
              Fill in the required measurements — or use the quick estimate — to continue.
            </p>
          ) : null}

          {step === 'review' && !isSignedIn ? (
            <p className="mt-2.5 text-xs text-ink-faint">
              You can check out as a guest.{' '}
              <Link href="/login?callbackUrl=/builder" className="link-underline text-ink">
                Sign in
              </Link>{' '}
              to keep this design and your measurements for next time.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BuilderSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,45%)_minmax(0,55%)]">
      <div className="bg-cream/50 p-10">
        <div className="skeleton mx-auto h-[40vh] max-w-sm lg:h-[60vh]" />
      </div>
      <div className="space-y-6 p-10">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-10 w-72" />
        <div className="grid grid-cols-2 gap-4 pt-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton aspect-[4/5]" />
          ))}
        </div>
      </div>
    </div>
  );
}
