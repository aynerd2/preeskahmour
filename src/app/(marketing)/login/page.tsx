import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/auth-forms';
import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect(session.user.role === 'ADMIN' ? '/studio' : '/account');

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="Sign in"
        lede="Your measurements, your saved designs and every order you have placed with us."
        align="center"
      />
      <div className="container pb-24">
        <div className="mx-auto max-w-md">
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
