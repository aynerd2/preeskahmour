import type { Metadata } from 'next';

import { MeasurementManager } from '@/components/account/measurement-manager';
import { auth } from '@/lib/auth';
import { prisma, safeQuery } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Your measurements',
  robots: { index: false, follow: false },
};

export default async function MeasurementsPage() {
  const session = await auth();

  const profiles = await safeQuery(
    () =>
      prisma.measurementProfile.findMany({
        where: { userId: session!.user.id },
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      }),
    [],
  );

  return <MeasurementManager profiles={profiles} />;
}
