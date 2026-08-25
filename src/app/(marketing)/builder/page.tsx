import type { Metadata } from 'next';

import { BuilderShell } from '@/components/builder/builder-shell';
import { auth } from '@/lib/auth';
import { prisma, safeQuery } from '@/lib/prisma';
import { getBaseStyles, getDesignOptions, getFabrics } from '@/lib/queries';

// The catalogue must be current — a retired fabric should disappear from the
// builder immediately, not after a cache window.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Design your suit',
  description:
    'Choose your cut, your cloth and every detail down to the lining, then give us your measurements. Six steps, about four minutes, with the price visible throughout.',
  alternates: { canonical: '/builder' },
};

type SearchParams = Promise<{
  product?: string;
  fabric?: string;
  style?: string;
  step?: string;
  design?: string;
}>;

export default async function BuilderPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const session = await auth();

  const [baseStyles, fabrics, designOptions] = await Promise.all([
    getBaseStyles(),
    getFabrics({ inStockOnly: true }),
    getDesignOptions(),
  ]);

  // Saved measurement profiles, so a returning customer never re-types them.
  const profiles = session?.user?.id
    ? await safeQuery(
        () =>
          prisma.measurementProfile.findMany({
            where: { userId: session.user.id },
            orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
          }),
        [],
      )
    : [];

  // Deep links: /builder?product=… pre-fills from a shop piece,
  // /builder?fabric=… from the fabric library, /builder?design=… reopens a draft.
  const preselect = await resolvePreselect(params);

  return (
    <BuilderShell
      baseStyles={baseStyles}
      fabrics={fabrics}
      designOptions={designOptions}
      profiles={profiles}
      preselect={preselect}
      isSignedIn={Boolean(session?.user)}
      initialStep={params.step}
    />
  );
}

export type BuilderPreselect = {
  baseStyleId?: string;
  fabricId?: string;
  optionIds?: string[];
  fit?: 'REGULAR' | 'SLIM' | 'RELAXED' | 'MATERNITY';
  designId?: string;
  monogram?: string;
  measurementProfileId?: string;
  /** Shown as a note at the top of step 1 so the deep link is explained. */
  fromLabel?: string;
};

async function resolvePreselect(params: {
  product?: string;
  fabric?: string;
  style?: string;
  design?: string;
}): Promise<BuilderPreselect | null> {
  // Reopening a saved draft takes priority over everything else.
  if (params.design) {
    const design = await safeQuery(
      () =>
        prisma.customDesign.findUnique({
          where: { id: params.design },
          include: { options: true },
        }),
      null,
    );

    if (design) {
      return {
        designId: design.id,
        baseStyleId: design.baseStyleId,
        fabricId: design.fabricId,
        fit: design.fit,
        optionIds: design.options.map((o) => o.designOptionId),
        monogram: design.monogram ?? undefined,
        measurementProfileId: design.measurementProfileId ?? undefined,
        fromLabel: `Picking up “${design.name}” where you left off.`,
      };
    }
  }

  if (params.product) {
    const product = await safeQuery(
      () =>
        prisma.product.findUnique({
          where: { slug: params.product },
          select: { name: true, baseStyleId: true, fabricId: true },
        }),
      null,
    );

    if (product) {
      return {
        baseStyleId: product.baseStyleId ?? undefined,
        fabricId: product.fabricId ?? undefined,
        fromLabel: `Starting from ${product.name}. Change anything you like.`,
      };
    }
  }

  if (params.fabric) {
    const fabric = await safeQuery(
      () =>
        prisma.fabric.findUnique({
          where: { slug: params.fabric },
          select: { id: true, name: true, inStock: true },
        }),
      null,
    );

    if (fabric?.inStock) {
      return {
        fabricId: fabric.id,
        fromLabel: `${fabric.name} is selected. Choose the cut it should be made in.`,
      };
    }
  }

  if (params.style) {
    const style = await safeQuery(
      () =>
        prisma.baseStyle.findUnique({
          where: { slug: params.style },
          select: { id: true, name: true },
        }),
      null,
    );

    if (style) {
      return { baseStyleId: style.id, fromLabel: `${style.name} selected.` };
    }
  }

  return null;
}
