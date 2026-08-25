'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DesignOptionCategory, FitPreference } from '@prisma/client';

import type { MeasurementKey } from '@/lib/measurements';

/**
 * Configurator state.
 *
 * Everything the wizard knows lives here, in one flat store. That is what
 * makes the live preview instant: selecting a lapel is a synchronous set()
 * and a re-render, with no fetch and no round trip. Prices are recomputed
 * from the catalogue the page already loaded.
 *
 * Persisted to sessionStorage rather than localStorage: a half-built design
 * should survive an accidental refresh or a trip to the fabric library, but
 * it should not still be sitting there in a fortnight pretending to be
 * current — especially since prices may have moved. Anything worth keeping
 * gets saved to the account as a draft CustomDesign.
 */

export const STEPS = [
  { key: 'style', label: 'Style', title: 'Choose your cut' },
  { key: 'fabric', label: 'Cloth', title: 'Choose your cloth' },
  { key: 'details', label: 'Details', title: 'The details' },
  { key: 'fit', label: 'Fit', title: 'How should it sit?' },
  { key: 'measurements', label: 'Measure', title: 'Your measurements' },
  { key: 'review', label: 'Review', title: 'Everything, once more' },
] as const;

export type StepKey = (typeof STEPS)[number]['key'];

export type MeasurementDraft = Partial<Record<MeasurementKey, number | null>> & {
  name?: string;
  source?: 'MANUAL' | 'ESTIMATED' | 'ATELIER';
  heightCm?: number | null;
  weightKg?: number | null;
  braBandCm?: number | null;
  torsoLength?: 'SHORT' | 'AVERAGE' | 'LONG';
  shoulderSlope?: 'SQUARE' | 'AVERAGE' | 'SLOPED';
  pregnancyWeeks?: number | null;
  notes?: string | null;
};

type BuilderState = {
  step: StepKey;
  baseStyleId: string | null;
  fabricId: string | null;
  fit: FitPreference;
  /** One selected option id per category. */
  options: Partial<Record<DesignOptionCategory, string>>;
  monogram: string;
  notes: string;

  /** Either an existing saved profile, or the numbers typed in this session. */
  measurementProfileId: string | null;
  measurementDraft: MeasurementDraft;
  measurementMode: 'saved' | 'manual' | 'estimate';

  /** Set once the design has been persisted, so re-saving updates in place. */
  savedDesignId: string | null;
  hydrated: boolean;

  setStep: (step: StepKey) => void;
  next: () => void;
  back: () => void;
  setBaseStyle: (id: string, resetOptions?: boolean) => void;
  setFabric: (id: string) => void;
  setFit: (fit: FitPreference) => void;
  setOption: (category: DesignOptionCategory, optionId: string) => void;
  setOptions: (options: Partial<Record<DesignOptionCategory, string>>) => void;
  setMonogram: (value: string) => void;
  setNotes: (value: string) => void;
  setMeasurementMode: (mode: 'saved' | 'manual' | 'estimate') => void;
  setMeasurementProfile: (id: string | null) => void;
  patchMeasurements: (patch: MeasurementDraft) => void;
  setSavedDesignId: (id: string | null) => void;
  reset: () => void;
  setHydrated: () => void;
};

const initial = {
  step: 'style' as StepKey,
  baseStyleId: null,
  fabricId: null,
  fit: 'REGULAR' as FitPreference,
  options: {},
  monogram: '',
  notes: '',
  measurementProfileId: null,
  measurementDraft: {} as MeasurementDraft,
  measurementMode: 'manual' as const,
  savedDesignId: null,
};

export const useBuilder = create<BuilderState>()(
  persist(
    (set, get) => ({
      ...initial,
      hydrated: false,

      setStep: (step) => set({ step }),

      next: () => {
        const index = STEPS.findIndex((s) => s.key === get().step);
        const nextStep = STEPS[Math.min(STEPS.length - 1, index + 1)];
        set({ step: nextStep.key });
      },

      back: () => {
        const index = STEPS.findIndex((s) => s.key === get().step);
        const prevStep = STEPS[Math.max(0, index - 1)];
        set({ step: prevStep.key });
      },

      setBaseStyle: (id, resetOptions = true) =>
        set((state) => ({
          baseStyleId: id,
          // Changing the cut can invalidate selections — a wrap jacket has no
          // lapel. The caller re-applies defaults for the new style.
          options: resetOptions ? {} : state.options,
          savedDesignId: null,
        })),

      setFabric: (id) => set({ fabricId: id, savedDesignId: null }),
      setFit: (fit) => set({ fit, savedDesignId: null }),

      setOption: (category, optionId) =>
        set((state) => ({
          options: { ...state.options, [category]: optionId },
          savedDesignId: null,
        })),

      setOptions: (options) =>
        set((state) => ({ options: { ...state.options, ...options } })),

      setMonogram: (value) =>
        set({ monogram: value.replace(/[^A-Za-z.\s]/g, '').slice(0, 4), savedDesignId: null }),

      setNotes: (value) => set({ notes: value.slice(0, 1000) }),

      setMeasurementMode: (measurementMode) => set({ measurementMode }),
      setMeasurementProfile: (measurementProfileId) => set({ measurementProfileId }),

      patchMeasurements: (patch) =>
        set((state) => ({ measurementDraft: { ...state.measurementDraft, ...patch } })),

      setSavedDesignId: (savedDesignId) => set({ savedDesignId }),

      reset: () => set({ ...initial }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'preeskahmour.builder.v1',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) =>
        ({
          step: state.step,
          baseStyleId: state.baseStyleId,
          fabricId: state.fabricId,
          fit: state.fit,
          options: state.options,
          monogram: state.monogram,
          notes: state.notes,
          measurementProfileId: state.measurementProfileId,
          measurementDraft: state.measurementDraft,
          measurementMode: state.measurementMode,
          savedDesignId: state.savedDesignId,
        }) as BuilderState,
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

export function stepIndex(step: StepKey) {
  return STEPS.findIndex((s) => s.key === step);
}
