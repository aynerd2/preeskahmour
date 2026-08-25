import type { Metadata } from 'next';
import Link from 'next/link';

import { SavedDesigns } from '@/components/account/saved-designs';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/section';
import { auth } from '@/lib/auth';
import { prisma, safeQuery } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Your designs',
  robots: { index: false, follow: false },
};

export default async function DesignsPage() {
  const session = await auth();

  const designs = await safeQuery(
    () =>
      prisma.customDesign.findMany({
        where: { userId: session!.user.id },
        orderBy: [{ isDraft: 'desc' }, { updatedAt: 'desc' }],
        include: {
          baseStyle: { select: { name: true, slug: true } },
          fabric: {
            select: { name: true, family: true, colorHex: true, swatchImage: true },
          },
          options: { include: { designOption: { select: { name: true, category: true } } } },
          _count: { select: { orderItems: true } },
        },
      }),
    [],
  );

  if (designs.length === 0) {
    return (
      <EmptyState
        title="No saved designs yet"
        body="Anything you build in the configurator can be saved and picked up later — including half-finished. Nothing is charged until you order."
        action={
          <Button asChild className="mt-2">
            <Link href="/builder">Open the builder</Link>
          </Button>
        }
      />
    );
  }

  return (
    <SavedDesigns
      designs={designs.map((design) => ({
        id: design.id,
        name: design.name,
        isDraft: design.isDraft,
        ordered: design._count.orderItems > 0,
        totalPriceKobo: design.totalPriceKobo,
        updatedAt: design.updatedAt.toISOString(),
        baseStyleName: design.baseStyle.name,
        baseStyleSlug: design.baseStyle.slug,
        fit: design.fit,
        fabric: design.fabric,
        optionNames: design.options.map((o) => o.designOption.name),
      }))}
    />
  );
}
