import { redirect } from 'next/navigation';

import { AccountNav } from '@/components/account/account-nav';
import { PageHeader } from '@/components/shared/page-header';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Account shell. Middleware already blocks anonymous access to /account/*,
 * but this checks again — middleware can be misconfigured, and a page that
 * assumes a session where there might not be one is a page that throws.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/account');

  const firstName = session.user.name?.split(' ')[0];

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title={firstName ? `Hello, ${firstName}` : 'Your account'}
        lede="Your orders, your measurements and the designs you have saved."
      />

      <div className="container pb-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-16">
          <AccountNav isAdmin={session.user.role === 'ADMIN'} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </>
  );
}
