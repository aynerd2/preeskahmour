import type { FitPreference } from '@prisma/client';

/**
 * Measurements: the field dictionary + the quick-estimate heuristic.
 *
 * ⚠️  READ THIS BEFORE TRUSTING `estimateMeasurements()`.
 *
 * This is a HEURISTIC. It is NOT computer vision, NOT a 3D body scan, NOT
 * machine learning, and it has not been fitted to a real anthropometric
 * dataset. It is a set of stature-proportion constants (each dimension
 * expressed as a fraction of standing height) nudged by a girth term derived
 * from BMI. It exists so a first-time customer can get a *plausible starting
 * pattern* in thirty seconds instead of abandoning the builder because they
 * cannot find a tape measure.
 *
 * Consequences, which the UI states plainly to the customer:
 *   - Every estimated profile is flagged `source: ESTIMATED` in the database.
 *   - The atelier confirms estimated measurements over WhatsApp or video call
 *     before a single piece of cloth is cut.
 *   - Estimated profiles carry a stated tolerance (see `TOLERANCE_CM`), and
 *     garments cut from them are made with extra seam allowance.
 *
 * If a real fit model or a 3D scanning partner is introduced later, replace
 * the body of `estimateMeasurements` only — the input and output shapes are
 * the contract that the rest of the app depends on.
 */

// ---------------------------------------------------------------------------
// Field dictionary — the single source of truth for forms, the measurement
// guide page, the studio order sheet and the PDF spec the tailor works from.
// ---------------------------------------------------------------------------

export type MeasurementGroup = 'Upper body' | 'Arm' | 'Lower body' | 'Lengths';

export type MeasurementField = {
  key: MeasurementKey;
  label: string;
  group: MeasurementGroup;
  /** Plain-language instruction shown beside the input and on the guide page. */
  howTo: string;
  /** Sanity bounds in centimetres — also used by the Zod schema. */
  min: number;
  max: number;
  /** Required for a profile to be considered complete enough to cut from. */
  core: boolean;
};

export type MeasurementKey =
  | 'bustCm'
  | 'underbustCm'
  | 'waistCm'
  | 'hipCm'
  | 'shoulderCm'
  | 'backWidthCm'
  | 'neckCm'
  | 'bicepCm'
  | 'wristCm'
  | 'sleeveLengthCm'
  | 'jacketLengthCm'
  | 'inseamCm'
  | 'outseamCm'
  | 'thighCm'
  | 'kneeCm'
  | 'ankleCm'
  | 'skirtLengthCm';

export const MEASUREMENT_FIELDS: MeasurementField[] = [
  {
    key: 'bustCm',
    label: 'Bust',
    group: 'Upper body',
    howTo:
      'Around the fullest part of the bust, tape level all the way round. Wear the bra you intend to wear with the suit. Breathe out normally — do not pull tight.',
    min: 60,
    max: 175,
    core: true,
  },
  {
    key: 'underbustCm',
    label: 'Under-bust',
    group: 'Upper body',
    howTo: 'Directly beneath the bust, where a bra band sits. Snug but not compressing.',
    min: 55,
    max: 160,
    core: false,
  },
  {
    key: 'waistCm',
    label: 'Natural waist',
    group: 'Upper body',
    howTo:
      'The narrowest part of your torso, usually about 2cm above the navel. Bend sideways — the crease that forms is your natural waist.',
    min: 50,
    max: 170,
    core: true,
  },
  {
    key: 'hipCm',
    label: 'Hip',
    group: 'Lower body',
    howTo:
      'Around the fullest part of the seat, roughly 20cm below the waist, feet together.',
    min: 65,
    max: 185,
    core: true,
  },
  {
    key: 'shoulderCm',
    label: 'Shoulder to shoulder',
    group: 'Upper body',
    howTo:
      'Across the back, from the bony point of one shoulder to the other. Easiest with help — this is the one measurement we ask you not to guess.',
    min: 30,
    max: 60,
    core: true,
  },
  {
    key: 'backWidthCm',
    label: 'Back width',
    group: 'Upper body',
    howTo: 'Across the back at armhole level, from one armhole crease to the other.',
    min: 28,
    max: 58,
    core: false,
  },
  {
    key: 'neckCm',
    label: 'Neck',
    group: 'Upper body',
    howTo: 'Around the base of the neck, one finger held under the tape.',
    min: 25,
    max: 50,
    core: false,
  },
  {
    key: 'bicepCm',
    label: 'Bicep',
    group: 'Arm',
    howTo: 'Around the fullest part of the upper arm, arm relaxed at your side.',
    min: 18,
    max: 60,
    core: false,
  },
  {
    key: 'wristCm',
    label: 'Wrist',
    group: 'Arm',
    howTo: 'Around the wrist bone, where a cuff would close.',
    min: 12,
    max: 28,
    core: false,
  },
  {
    key: 'sleeveLengthCm',
    label: 'Sleeve length',
    group: 'Arm',
    howTo:
      'From the shoulder point, over a slightly bent elbow, to the wrist bone. Keep the arm soft, not straight.',
    min: 40,
    max: 80,
    core: true,
  },
  {
    key: 'jacketLengthCm',
    label: 'Jacket length',
    group: 'Lengths',
    howTo:
      'From the bone at the base of your neck, straight down the back, to where you want the jacket to end.',
    min: 45,
    max: 110,
    core: true,
  },
  {
    key: 'inseamCm',
    label: 'Inseam',
    group: 'Lower body',
    howTo:
      'From the crotch seam to the ankle bone, down the inside of the leg. Measure a well-fitting pair of trousers flat instead, if that is easier.',
    min: 55,
    max: 100,
    core: true,
  },
  {
    key: 'outseamCm',
    label: 'Outseam',
    group: 'Lower body',
    howTo: 'From the natural waist down the outside of the leg to the ankle bone.',
    min: 80,
    max: 130,
    core: false,
  },
  {
    key: 'thighCm',
    label: 'Thigh',
    group: 'Lower body',
    howTo: 'Around the fullest part of the thigh, standing with weight evenly on both feet.',
    min: 35,
    max: 100,
    core: false,
  },
  {
    key: 'kneeCm',
    label: 'Knee',
    group: 'Lower body',
    howTo: 'Around the knee, leg straight.',
    min: 25,
    max: 70,
    core: false,
  },
  {
    key: 'ankleCm',
    label: 'Ankle opening',
    group: 'Lower body',
    howTo: 'Around the ankle — or measure the hem opening of trousers you like.',
    min: 15,
    max: 50,
    core: false,
  },
  {
    key: 'skirtLengthCm',
    label: 'Skirt length',
    group: 'Lengths',
    howTo: 'From the natural waist to where you want the skirt hem to fall.',
    min: 30,
    max: 130,
    core: false,
  },
];

export const CORE_MEASUREMENT_KEYS = MEASUREMENT_FIELDS.filter((f) => f.core).map((f) => f.key);

export function measurementField(key: MeasurementKey) {
  return MEASUREMENT_FIELDS.find((f) => f.key === key)!;
}

// ---------------------------------------------------------------------------
// Unit helpers
// ---------------------------------------------------------------------------

export const cmToIn = (cm: number) => cm / 2.54;
export const inToCm = (inches: number) => inches * 2.54;

export function formatCm(value: number | null | undefined, unit: 'cm' | 'in' = 'cm') {
  if (value == null) return '—';
  return unit === 'cm' ? `${value.toFixed(1)} cm` : `${cmToIn(value).toFixed(1)}"`;
}

// ---------------------------------------------------------------------------
// The heuristic
// ---------------------------------------------------------------------------

export type TorsoLength = 'SHORT' | 'AVERAGE' | 'LONG';
export type ShoulderSlope = 'SQUARE' | 'AVERAGE' | 'SLOPED';

export type EstimateInput = {
  heightCm: number;
  weightKg: number;
  fitPreference?: FitPreference;
  /** Optional: a known bra band size sharpens the upper-body numbers a lot. */
  braBandCm?: number | null;
  torsoLength?: TorsoLength;
  shoulderSlope?: ShoulderSlope;
  /** For maternity cuts: weeks pregnant at the time of ordering. */
  pregnancyWeeks?: number | null;
};

export type EstimateResult = {
  values: Record<MeasurementKey, number>;
  /** ± centimetres we expect to be out by, per group. Shown to the customer. */
  tolerance: number;
  confidence: 'low' | 'moderate';
  /** Human-readable notes explaining what the estimate assumed. */
  notes: string[];
};

/**
 * Stature fractions. Each value is "this dimension ÷ standing height" for a
 * reference body at BMI 22. Sourced from standard tailoring drafting
 * proportion tables, not from a measured population — treat as approximate.
 */
const STATURE_FRACTION: Record<MeasurementKey, number> = {
  bustCm: 0.505,
  underbustCm: 0.432,
  waistCm: 0.415,
  hipCm: 0.545,
  shoulderCm: 0.235,
  backWidthCm: 0.215,
  neckCm: 0.19,
  bicepCm: 0.165,
  wristCm: 0.095,
  sleeveLengthCm: 0.345,
  jacketLengthCm: 0.395,
  inseamCm: 0.455,
  outseamCm: 0.615,
  thighCm: 0.32,
  kneeCm: 0.21,
  ankleCm: 0.135,
  skirtLengthCm: 0.36,
};

/**
 * Centimetres added per BMI point above 22 (subtracted below it). Girth
 * dimensions respond strongly; length dimensions barely respond at all.
 */
const GIRTH_SENSITIVITY: Record<MeasurementKey, number> = {
  bustCm: 1.6,
  underbustCm: 1.45,
  waistCm: 2.0,
  hipCm: 1.7,
  shoulderCm: 0.25,
  backWidthCm: 0.3,
  neckCm: 0.5,
  bicepCm: 0.9,
  wristCm: 0.15,
  sleeveLengthCm: 0.05,
  jacketLengthCm: 0.1,
  inseamCm: -0.05,
  outseamCm: 0.05,
  thighCm: 1.4,
  kneeCm: 0.7,
  ankleCm: 0.3,
  skirtLengthCm: 0.05,
};

/** How far the torso-length answer shifts vertical measurements, in cm. */
const TORSO_SHIFT: Record<TorsoLength, number> = { SHORT: -2.5, AVERAGE: 0, LONG: 2.5 };

/** How the shoulder-slope answer shifts shoulder and back numbers, in cm. */
const SHOULDER_SHIFT: Record<ShoulderSlope, number> = { SQUARE: 0.8, AVERAGE: 0, SLOPED: -0.8 };

/** Stated accuracy of an estimated profile. Drives the copy in the builder. */
export const TOLERANCE_CM = 3.5;

export function estimateMeasurements(input: EstimateInput): EstimateResult {
  const heightCm = clampNum(input.heightCm, 130, 210);
  const weightKg = clampNum(input.weightKg, 35, 200);
  const torso = input.torsoLength ?? 'AVERAGE';
  const slope = input.shoulderSlope ?? 'AVERAGE';

  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  // Girth term, clamped so extreme BMIs do not produce absurd circumferences.
  const girthDelta = clampNum(bmi - 22, -8, 18);

  const notes: string[] = [];
  const values = {} as Record<MeasurementKey, number>;

  for (const field of MEASUREMENT_FIELDS) {
    const key = field.key;
    let value = heightCm * STATURE_FRACTION[key] + girthDelta * GIRTH_SENSITIVITY[key];

    // Vertical measurements move with a long or short torso.
    if (key === 'jacketLengthCm' || key === 'skirtLengthCm' || key === 'outseamCm') {
      value += TORSO_SHIFT[torso];
    }
    if (key === 'inseamCm') {
      // A long torso means proportionally shorter legs, and vice versa.
      value -= TORSO_SHIFT[torso];
    }
    if (key === 'shoulderCm' || key === 'backWidthCm') {
      value += SHOULDER_SHIFT[slope];
    }

    values[key] = round(clampNum(value, field.min, field.max));
  }

  notes.push(
    `Derived from ${heightCm.toFixed(0)}cm / ${weightKg.toFixed(0)}kg (BMI ${bmi.toFixed(1)}) using our proportion table.`,
  );

  // A known bra band is a real measured number — trust it over the estimate
  // and re-anchor the bust and under-bust on it.
  if (input.braBandCm && input.braBandCm > 55 && input.braBandCm < 130) {
    values.underbustCm = round(input.braBandCm);
    // Keep the estimated cup depth, but never let bust fall below band + 8cm.
    const cupDepth = Math.max(8, values.bustCm - (heightCm * STATURE_FRACTION.underbustCm));
    values.bustCm = round(clampNum(input.braBandCm + cupDepth, 60, 175));
    notes.push('Bust and under-bust anchored to the bra band size you gave us.');
  }

  // Maternity: add a bump allowance on top of the pre-pregnancy estimate.
  // Roughly 1.1cm of waist growth per week from week 8, tapering into the hip
  // and bust. The garment itself then gets expansion panels on top of this.
  if (input.pregnancyWeeks && input.pregnancyWeeks > 0) {
    const weeks = clampNum(input.pregnancyWeeks, 1, 42);
    const waistGrowth = Math.max(0, (weeks - 8) * 1.1);
    const hipGrowth = Math.max(0, (weeks - 12) * 0.35);
    const bustGrowth = Math.min(9, Math.max(0, (weeks - 6) * 0.28));

    values.waistCm = round(clampNum(values.waistCm + waistGrowth, 50, 170));
    values.hipCm = round(clampNum(values.hipCm + hipGrowth, 65, 185));
    values.bustCm = round(clampNum(values.bustCm + bustGrowth, 60, 175));
    values.underbustCm = round(clampNum(values.underbustCm + bustGrowth * 0.6, 55, 160));
    // Front hem rises over a bump; the pattern compensates by lengthening.
    values.jacketLengthCm = round(clampNum(values.jacketLengthCm + weeks * 0.06, 45, 110));

    notes.push(
      `Includes a bump allowance for week ${weeks}. Your maternity panels add a further 14cm of adjustable room on top of this.`,
    );
  }

  if (input.fitPreference && input.fitPreference !== 'REGULAR') {
    // Deliberately does NOT alter the numbers. Fit preference is about the
    // ease the pattern cutter adds, not about the body underneath.
    notes.push(
      `Your ${input.fitPreference.toLowerCase()} fit preference is applied by the cutter as ease — it does not change these body measurements.`,
    );
  }

  return {
    values,
    tolerance: TOLERANCE_CM,
    // Moderate only when the customer gave us at least one real measured input.
    confidence: input.braBandCm ? 'moderate' : 'low',
    notes,
  };
}

/**
 * How complete is a profile? Used to gate "ready to cut" in the builder and
 * to show a progress ring on the account page.
 */
export function profileCompleteness(profile: Partial<Record<MeasurementKey, number | null>>) {
  const filled = CORE_MEASUREMENT_KEYS.filter((k) => profile[k] != null).length;
  return {
    filled,
    total: CORE_MEASUREMENT_KEYS.length,
    percent: Math.round((filled / CORE_MEASUREMENT_KEYS.length) * 100),
    isComplete: filled === CORE_MEASUREMENT_KEYS.length,
    missing: CORE_MEASUREMENT_KEYS.filter((k) => profile[k] == null),
  };
}

function clampNum(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}
