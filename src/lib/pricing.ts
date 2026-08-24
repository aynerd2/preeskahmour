import type { FitPreference } from '@prisma/client';
import { FREE_SHIPPING_THRESHOLD_KOBO, SHIPPING_RATES } from './constants';

/**
 * The pricing engine.
 *
 * One rule: this module is the ONLY place a garment price is computed. The
 * builder, the cart, the API and /studio all call `priceCustomDesign` so a
 * quote can never disagree with an invoice.
 *
 * A made-to-measure price is:
 *
 *     base style          (the labour: pattern, cutting, fittings, finishing)
 *   + cloth               (price/metre × metres, adjusted for the cut)
 *   + design upgrades     (peak lapels, contrast lining, hand embroidery…)
 *   + fit surcharge       (maternity panels are real extra construction)
 *   + monogram
 *
 * All figures are integer kobo.
 */

export type PriceLine = {
  key: string;
  label: string;
  detail?: string;
  amountKobo: number;
};

export type PriceBreakdown = {
  lines: PriceLine[];
  subtotalKobo: number;
  totalKobo: number;
  /** Metres of cloth this configuration consumes, after the fit adjustment. */
  yardageMeters: number;
};

/**
 * Cloth consumption multiplier by fit. A relaxed cut genuinely eats more
 * cloth; maternity eats the most because of the expansion panels and the
 * rebalanced front hem.
 */
export const FIT_YARDAGE_MULTIPLIER: Record<FitPreference, number> = {
  SLIM: 0.94,
  REGULAR: 1,
  RELAXED: 1.12,
  MATERNITY: 1.2,
};

/**
 * Extra construction charged on top of the base style, in kobo. Maternity is
 * not a size — it is hidden side panels, a ribbed under-bust stay and a
 * re-drafted hem, so it carries a real surcharge.
 */
export const FIT_SURCHARGE_KOBO: Record<FitPreference, number> = {
  SLIM: 0,
  REGULAR: 0,
  RELAXED: 0,
  MATERNITY: 1_800_000, // NGN 18,000
};

export const MONOGRAM_PRICE_KOBO = 750_000; // NGN 7,500

export type PriceableBaseStyle = {
  name: string;
  basePriceKobo: number;
  yardageMeters: number;
};

export type PriceableFabric = {
  name: string;
  pricePerMeterKobo: number;
};

export type PriceableOption = {
  id: string;
  name: string;
  category: string;
  priceModifierKobo: number;
};

export function priceCustomDesign(args: {
  baseStyle: PriceableBaseStyle;
  fabric: PriceableFabric;
  options: PriceableOption[];
  fit: FitPreference;
  monogram?: string | null;
  quantity?: number;
}): PriceBreakdown {
  const { baseStyle, fabric, options, fit } = args;
  const quantity = Math.max(1, args.quantity ?? 1);

  const yardageMeters =
    Math.round(baseStyle.yardageMeters * FIT_YARDAGE_MULTIPLIER[fit] * 100) / 100;

  const lines: PriceLine[] = [
    {
      key: 'base',
      label: baseStyle.name,
      detail: 'Pattern, cutting, two fittings and hand finishing',
      amountKobo: baseStyle.basePriceKobo,
    },
    {
      key: 'cloth',
      label: fabric.name,
      detail: `${yardageMeters.toFixed(2)}m at ${formatKoboPlain(fabric.pricePerMeterKobo)}/m`,
      amountKobo: Math.round(fabric.pricePerMeterKobo * yardageMeters),
    },
  ];

  for (const option of options) {
    if (option.priceModifierKobo === 0) continue;
    lines.push({
      key: `option:${option.id}`,
      label: option.name,
      detail: option.category,
      amountKobo: option.priceModifierKobo,
    });
  }

  if (FIT_SURCHARGE_KOBO[fit] > 0) {
    lines.push({
      key: 'fit',
      label: 'Maternity construction',
      detail: 'Expansion panels, under-bust stay, rebalanced hem',
      amountKobo: FIT_SURCHARGE_KOBO[fit],
    });
  }

  if (args.monogram && args.monogram.trim()) {
    lines.push({
      key: 'monogram',
      label: `Monogram “${args.monogram.trim().toUpperCase()}”`,
      detail: 'Hand-embroidered inside the left facing',
      amountKobo: MONOGRAM_PRICE_KOBO,
    });
  }

  const subtotalKobo = lines.reduce((sum, l) => sum + l.amountKobo, 0);

  return {
    lines,
    subtotalKobo,
    totalKobo: subtotalKobo * quantity,
    yardageMeters,
  };
}

/**
 * The cheapest a given base style can be made — used for "from ₦x" copy on
 * the builder's style cards and in navigation.
 */
export function priceFrom(baseStyle: PriceableBaseStyle, cheapestFabricPerMeter: number) {
  return baseStyle.basePriceKobo + Math.round(cheapestFabricPerMeter * baseStyle.yardageMeters);
}

export type ShippingZone = keyof typeof SHIPPING_RATES;

export function shippingForZone(zone: ShippingZone, subtotalKobo: number) {
  if (zone !== 'INTERNATIONAL' && subtotalKobo >= FREE_SHIPPING_THRESHOLD_KOBO) return 0;
  return SHIPPING_RATES[zone];
}

/** Nigerian states map to the Lagos rate or the wider-Nigeria rate. */
export function zoneForAddress(state: string, country: string): ShippingZone {
  if (country.trim().toLowerCase() !== 'nigeria') return 'INTERNATIONAL';
  return state.trim().toLowerCase() === 'lagos' ? 'LAGOS' : 'NIGERIA';
}

/** Bare number formatting for price *details*, where the ₦ would be noisy. */
function formatKoboPlain(kobo: number) {
  return `₦${Math.round(kobo / 100).toLocaleString('en-NG')}`;
}
