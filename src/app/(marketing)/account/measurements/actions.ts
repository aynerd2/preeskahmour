'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { measurementProfileSchema } from '@/lib/validators';

/**
 * Measurement profile CRUD.
 *
 * Every action re-checks ownership against the session rather than trusting
 * the id in the payload — a profile is the most personal thing this site
 * stores, and an IDOR here would expose someone's body measurements.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveMeasurementProfile(formData: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, error: 'Sign in first.' };
  }

  const raw = Object.fromEntries(formData.entries());
  // Empty inputs come through as '' and must become null, not 0.
  const cleaned = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, v === '' ? null : v]),
  );

  const parsed = measurementProfileSchema.safeParse({
    ...cleaned,
    isDefault: raw.isDefault === 'on' || raw.isDefault === 'true',
  });

  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { ok: false, error: first ?? 'Check the measurements you entered.' };
  }

  const { id, ...data } = parsed.data;

  try {
    if (id) {
      const owned = await prisma.measurementProfile.findFirst({
        where: { id, userId: user.id },
        select: { id: true },
      });
      if (!owned) return { ok: false, error: 'That profile could not be found.' };

      await prisma.measurementProfile.update({ where: { id: owned.id }, data });
    } else {
      await prisma.measurementProfile.create({ data: { ...data, userId: user.id } });
    }

    // Only one default at a time.
    if (data.isDefault) {
      await prisma.measurementProfile.updateMany({
        where: { userId: user.id, ...(id ? { id: { not: id } } : {}) },
        data: { isDefault: false },
      });
    }

    revalidatePath('/account/measurements');
    revalidatePath('/account');
    return { ok: true };
  } catch (error) {
    console.error('[measurements] save failed:', error);
    return { ok: false, error: 'Could not save that.' };
  }
}

export async function deleteMeasurementProfile(id: string): Promise<ActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, error: 'Sign in first.' };
  }

  const profile = await prisma.measurementProfile.findFirst({
    where: { id, userId: user.id },
    include: { _count: { select: { customDesigns: true } } },
  });

  if (!profile) return { ok: false, error: 'That profile could not be found.' };

  if (profile._count.customDesigns > 0) {
    // Orders reference a frozen snapshot, but live designs point at the row —
    // deleting it would leave them without measurements to be cut from.
    return {
      ok: false,
      error:
        'This profile is attached to a saved design. Change the design first, or keep the profile.',
    };
  }

  await prisma.measurementProfile.delete({ where: { id } });
  revalidatePath('/account/measurements');
  return { ok: true };
}

export async function setDefaultProfile(id: string): Promise<ActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, error: 'Sign in first.' };
  }

  const owned = await prisma.measurementProfile.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!owned) return { ok: false, error: 'That profile could not be found.' };

  await prisma.$transaction([
    prisma.measurementProfile.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    prisma.measurementProfile.update({ where: { id }, data: { isDefault: true } }),
  ]);

  revalidatePath('/account/measurements');
  return { ok: true };
}
