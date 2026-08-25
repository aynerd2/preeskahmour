import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { priceCustomDesign } from '@/lib/pricing';
import { customDesignSchema, measurementProfileSchema } from '@/lib/validators';
import { clientKey, limit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * Persist a design from the builder.
 *
 * Guests can save too — the row is created without a userId so the design
 * exists for the cart to reference. It is claimed by the account at checkout
 * or at sign-in. Requiring an account before you can even price a suit is the
 * fastest way to lose the sale.
 *
 * The price is ALWAYS recomputed here from the catalogue. The client sends
 * option ids, never money.
 */
const bodySchema = customDesignSchema.extend({
  // Measurements typed in the builder by a guest, saved alongside the design.
  measurementDraft: measurementProfileSchema.partial().optional().nullable(),
});

export async function POST(request: Request) {
  const rate = limit(clientKey(request, 'designs'), 30, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Slow down a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
    );
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'That design is not valid.', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const input = parsed.data;

  try {
    const [baseStyle, fabric, options] = await Promise.all([
      prisma.baseStyle.findFirst({ where: { id: input.baseStyleId, isActive: true } }),
      prisma.fabric.findUnique({ where: { id: input.fabricId } }),
      prisma.designOption.findMany({
        where: { id: { in: input.optionIds }, isActive: true },
      }),
    ]);

    if (!baseStyle) {
      return NextResponse.json({ error: 'That cut is no longer available.' }, { status: 404 });
    }
    if (!fabric) {
      return NextResponse.json({ error: 'That cloth is no longer available.' }, { status: 404 });
    }
    if (!fabric.inStock) {
      return NextResponse.json(
        { error: `${fabric.name} has just gone out of stock. Choose another cloth.` },
        { status: 409 },
      );
    }
    if (!baseStyle.supportedFits.includes(input.fit)) {
      return NextResponse.json(
        { error: `${baseStyle.name} is not made in a ${input.fit.toLowerCase()} fit.` },
        { status: 422 },
      );
    }

    // Drop any option that does not belong to this cut, rather than trusting
    // whatever ids the client sent.
    const validOptions = options.filter(
      (option) =>
        (option.baseStyleId === null || option.baseStyleId === baseStyle.id) &&
        baseStyle.optionCategories.includes(option.category),
    );

    const price = priceCustomDesign({
      baseStyle: {
        name: baseStyle.name,
        basePriceKobo: baseStyle.basePriceKobo,
        yardageMeters: baseStyle.yardageMeters,
      },
      fabric: { name: fabric.name, pricePerMeterKobo: fabric.pricePerMeterKobo },
      options: validOptions.map((o) => ({
        id: o.id,
        name: o.name,
        category: o.category,
        priceModifierKobo: o.priceModifierKobo,
      })),
      fit: input.fit,
      monogram: input.monogram,
    });

    // A guest who typed measurements gets a profile row so the atelier has
    // something concrete to cut from; it is attached to the account later.
    let measurementProfileId = input.measurementProfileId ?? null;

    if (measurementProfileId) {
      // Never let someone attach a profile belonging to another account.
      const owned = await prisma.measurementProfile.findFirst({
        where: { id: measurementProfileId, userId },
      });
      if (!owned) measurementProfileId = null;
    }

    if (!measurementProfileId && input.measurementDraft) {
      const draft = input.measurementDraft;
      const hasAny = Object.values(draft).some((v) => typeof v === 'number');

      if (hasAny) {
        const created = await prisma.measurementProfile.create({
          data: {
            userId,
            name: draft.name ?? 'Measurements for this design',
            source: draft.source ?? 'MANUAL',
            heightCm: draft.heightCm ?? null,
            weightKg: draft.weightKg ?? null,
            fitPreference: input.fit,
            braBandCm: draft.braBandCm ?? null,
            torsoLength: draft.torsoLength ?? null,
            shoulderSlope: draft.shoulderSlope ?? null,
            pregnancyWeeks: draft.pregnancyWeeks ?? null,
            bustCm: draft.bustCm ?? null,
            underbustCm: draft.underbustCm ?? null,
            waistCm: draft.waistCm ?? null,
            hipCm: draft.hipCm ?? null,
            shoulderCm: draft.shoulderCm ?? null,
            backWidthCm: draft.backWidthCm ?? null,
            jacketLengthCm: draft.jacketLengthCm ?? null,
            sleeveLengthCm: draft.sleeveLengthCm ?? null,
            bicepCm: draft.bicepCm ?? null,
            wristCm: draft.wristCm ?? null,
            neckCm: draft.neckCm ?? null,
            inseamCm: draft.inseamCm ?? null,
            outseamCm: draft.outseamCm ?? null,
            thighCm: draft.thighCm ?? null,
            kneeCm: draft.kneeCm ?? null,
            ankleCm: draft.ankleCm ?? null,
            skirtLengthCm: draft.skirtLengthCm ?? null,
            notes: draft.notes ?? null,
          },
        });
        measurementProfileId = created.id;
      }
    }

    const snapshot = {
      baseStyle: { id: baseStyle.id, slug: baseStyle.slug, name: baseStyle.name },
      fabric: {
        id: fabric.id,
        slug: fabric.slug,
        name: fabric.name,
        family: fabric.family,
        colorHex: fabric.colorHex,
        colorName: fabric.colorName,
        swatchImage: fabric.swatchImage,
        textureImage: fabric.textureImage,
        origin: fabric.origin,
      },
      fit: input.fit,
      monogram: input.monogram || null,
      options: validOptions.map((o) => ({
        id: o.id,
        slug: o.slug,
        name: o.name,
        category: o.category,
        colorHex: o.colorHex,
        overlayUrl: o.overlayUrl,
        priceModifierKobo: o.priceModifierKobo,
      })),
      price: {
        lines: price.lines,
        totalKobo: price.totalKobo,
        yardageMeters: price.yardageMeters,
      },
      capturedAt: new Date().toISOString(),
    };

    const data = {
      userId,
      name: input.name,
      baseStyleId: baseStyle.id,
      fabricId: fabric.id,
      fit: input.fit,
      measurementProfileId,
      monogram: input.monogram || null,
      notes: input.notes || null,
      totalPriceKobo: price.totalKobo,
      snapshot,
      isDraft: input.isDraft,
    };

    // Updating an existing design: only ever your own, and never one that has
    // already been ordered — an order line must not change under the atelier.
    if (input.id) {
      const existing = await prisma.customDesign.findFirst({
        where: { id: input.id, userId },
        include: { _count: { select: { orderItems: true } } },
      });

      if (existing && existing._count.orderItems === 0) {
        const updated = await prisma.customDesign.update({
          where: { id: existing.id },
          data: {
            ...data,
            options: {
              deleteMany: {},
              create: validOptions.map((o) => ({ designOptionId: o.id })),
            },
          },
        });
        return NextResponse.json({ id: updated.id, totalKobo: price.totalKobo });
      }
    }

    const created = await prisma.customDesign.create({
      data: {
        ...data,
        options: { create: validOptions.map((o) => ({ designOptionId: o.id })) },
      },
    });

    return NextResponse.json({ id: created.id, totalKobo: price.totalKobo });
  } catch (error) {
    console.error('[api/designs] failed:', error);
    return NextResponse.json({ error: 'Could not save that design.' }, { status: 500 });
  }
}

/** List the signed-in customer's saved designs. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  }

  const designs = await prisma.customDesign.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      baseStyle: { select: { name: true, slug: true } },
      fabric: { select: { name: true, family: true, colorHex: true, swatchImage: true } },
    },
  });

  return NextResponse.json({ designs });
}

const deleteSchema = z.object({ id: z.string().cuid() });

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  }

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Which design?' }, { status: 422 });
  }

  // Scoped to the owner, and never a design that is already on an order.
  const design = await prisma.customDesign.findFirst({
    where: { id: parsed.data.id, userId: session.user.id },
    include: { _count: { select: { orderItems: true } } },
  });

  if (!design) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  if (design._count.orderItems > 0) {
    return NextResponse.json(
      { error: 'This design is on an order, so it cannot be deleted.' },
      { status: 409 },
    );
  }

  await prisma.customDesign.delete({ where: { id: design.id } });
  return NextResponse.json({ ok: true });
}
