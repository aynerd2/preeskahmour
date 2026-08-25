import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { RegisterForm } from '@/components/auth/auth-forms';
import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create an account',
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect('/account');

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="Create an account"
        lede="So you never type your measurements twice, and your designs are waiting when you come back."
        align="center"
      />
      <div className="container pb-24">
        <div className="mx-auto max-w-md">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
