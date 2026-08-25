import 'server-only';

import { Prisma } from '@prisma/client';

import { prisma } from './prisma';
import { priceCustomDesign } from './pricing';

/**
 * Turns the cart the browser sent into priced order lines.
 *
 * The single rule this file exists to enforce: the client sends ids and
 * quantities, never money. Every figure below is re-derived from the
 * database at the moment of checkout. A tampered localStorage cart claiming a
 * ₦300,000 suit costs ₦1 produces an order for ₦300,000.
 *
 * Each line freezes a snapshot of the design and the measurements it is to be
 * cut to, so the atelier's copy cannot drift when the catalogue changes.
 */

export type RequestedLine = {
  kind: 'PRODUCT' | 'CUSTOM';
  productId?: string;
  customDesignId?: string;
  quantity: number;
};

export type BuiltLine = Prisma.OrderItemCreateWithoutOrderInput;

export type BuildResult =
  | { ok: true; lines: BuiltLine[]; subtotalKobo: number }
  | { ok: false; error: string };

export async function buildOrderLines(
  requested: RequestedLine[],
  /** Applied to ready-to-wear lines, which carry no measurements of their own. */
  fallbackMeasurementProfileId?: string | null,
): Promise<BuildResult> {
  if (requested.length === 0) return { ok: false, error: 'Your bag is empty.' };

  const productIds = requested.filter((l) => l.productId).map((l) => l.productId!);
  const designIds = requested.filter((l) => l.customDesignId).map((l) => l.customDesignId!);

  const [products, designs, fallbackProfile] = await Promise.all([
    productIds.length
      ? prisma.product.findMany({
          where: { id: { in: productIds }, isActive: true },
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            fabric: { select: { name: true } },
          },
        })
      : [],
    designIds.length
      ? prisma.customDesign.findMany({
          where: { id: { in: designIds } },
          include: {
            baseStyle: true,
            fabric: true,
            options: { include: { designOption: true } },
            measurementProfile: true,
          },
        })
      : [],
    fallbackMeasurementProfileId
      ? prisma.measurementProfile.findUnique({ where: { id: fallbackMeasurementProfileId } })
      : null,
  ]);

  const lines: BuiltLine[] = [];

  for (const item of requested) {
    const quantity = Math.max(1, Math.min(20, Math.trunc(item.quantity)));

    if (item.kind === 'PRODUCT') {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return { ok: false, error: 'One of the pieces in your bag is no longer available.' };
      }

      const unit = product.priceKobo;
      lines.push({
        product: { connect: { id: product.id } },
        name: product.name,
        descriptor: [product.fabric?.name, product.silhouette].filter(Boolean).join(' · '),
        imageUrl: product.images[0]?.url ?? null,
        unitPriceKobo: unit,
        quantity,
        totalKobo: unit * quantity,
        measurementSnapshot: fallbackProfile
          ? (serialiseProfile(fallbackProfile) as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        designSnapshot: Prisma.JsonNull,
      });
      continue;
    }

    const design = designs.find((d) => d.id === item.customDesignId);
    if (!design) {
      return { ok: false, error: 'One of your designs could not be found. Try rebuilding it.' };
    }
    if (!design.fabric.inStock) {
      return {
        ok: false,
        error: `${design.fabric.name} has gone out of stock. Open the design and choose another cloth.`,
      };
    }

    // Recomputed here rather than trusting design.totalPriceKobo, so a price
    // change between saving a draft and checking out is picked up.
    const price = priceCustomDesign({
      baseStyle: {
        name: design.baseStyle.name,
        basePriceKobo: design.baseStyle.basePriceKobo,
        yardageMeters: design.baseStyle.yardageMeters,
      },
      fabric: { name: design.fabric.name, pricePerMeterKobo: design.fabric.pricePerMeterKobo },
      options: design.options.map((o) => ({
        id: o.designOption.id,
        name: o.designOption.name,
        category: o.designOption.category,
        priceModifierKobo: o.designOption.priceModifierKobo,
      })),
      fit: design.fit,
      monogram: design.monogram,
    });

    const profile = design.measurementProfile ?? fallbackProfile;

    lines.push({
      customDesign: { connect: { id: design.id } },
      name: `${design.baseStyle.name} in ${design.fabric.name}`,
      descriptor: [
        design.fabric.name,
        ...design.options
          .filter((o) => ['LAPEL', 'POCKET', 'LINING'].includes(o.designOption.category))
          .map((o) => o.designOption.name),
        `${design.fit.charAt(0)}${design.fit.slice(1).toLowerCase()} fit`,
      ].join(' · '),
      imageUrl: design.fabric.swatchImage ?? null,
      unitPriceKobo: price.subtotalKobo,
      quantity,
      totalKobo: price.subtotalKobo * quantity,
      measurementSnapshot: profile
        ? (serialiseProfile(profile) as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      designSnapshot: {
        ...(design.snapshot as object | null),
        priceAtCheckout: {
          lines: price.lines,
          subtotalKobo: price.subtotalKobo,
          yardageMeters: price.yardageMeters,
        },
      } as Prisma.InputJsonValue,
    });
  }

  const subtotalKobo = lines.reduce((sum, l) => sum + (l.totalKobo ?? 0), 0);
  return { ok: true, lines, subtotalKobo };
}

/**
 * Flattens a measurement profile into the JSON the atelier works from. Kept
 * explicit rather than spreading the row, so adding a database column never
 * silently leaks into an order snapshot.
 */
function serialiseProfile(profile: {
  name: string;
  source: string;
  heightCm: number | null;
  weightKg: number | null;
  fitPreference: string;
  bustCm: number | null;
  underbustCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  shoulderCm: number | null;
  backWidthCm: number | null;
  jacketLengthCm: number | null;
  sleeveLengthCm: number | null;
  bicepCm: number | null;
  wristCm: number | null;
  neckCm: number | null;
  inseamCm: number | null;
  outseamCm: number | null;
  thighCm: number | null;
  kneeCm: number | null;
  ankleCm: number | null;
  skirtLengthCm: number | null;
  pregnancyWeeks: number | null;
  notes: string | null;
}) {
  return {
    name: profile.name,
    source: profile.source,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    fitPreference: profile.fitPreference,
    bustCm: profile.bustCm,
    underbustCm: profile.underbustCm,
    waistCm: profile.waistCm,
    hipCm: profile.hipCm,
    shoulderCm: profile.shoulderCm,
    backWidthCm: profile.backWidthCm,
    jacketLengthCm: profile.jacketLengthCm,
    sleeveLengthCm: profile.sleeveLengthCm,
    bicepCm: profile.bicepCm,
    wristCm: profile.wristCm,
    neckCm: profile.neckCm,
    inseamCm: profile.inseamCm,
    outseamCm: profile.outseamCm,
    thighCm: profile.thighCm,
    kneeCm: profile.kneeCm,
    ankleCm: profile.ankleCm,
    skirtLengthCm: profile.skirtLengthCm,
    pregnancyWeeks: profile.pregnancyWeeks,
    notes: profile.notes,
    // Flagged so the atelier knows to confirm before cutting.
    requiresConfirmation: profile.source === 'ESTIMATED',
  };
}
