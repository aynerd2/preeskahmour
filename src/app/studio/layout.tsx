import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Fraunces, Inter } from 'next/font/google';

import { StudioNav } from '@/components/studio/studio-nav';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/components/auth-provider';
import { auth } from '@/lib/auth';
import { isCloudinaryConfigured } from '@/lib/cloudinary';
import { prisma, safeQuery } from '@/lib/prisma';

import '../globals.css';

const display = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap', axes: ['SOFT', 'WONK', 'opsz'] });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: 'Studio', template: '%s · Preeskahmour Studio' },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The studio.
 *
 * Deliberately outside the (marketing) group: it gets its own chrome, no
 * site header or footer, and its own root layout so nothing about the public
 * site's shell leaks in.
 *
 * Middleware already gates /studio on the ADMIN role. This checks again —
 * defence in depth, and every page below can then assume a session exists.
 */
export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/login?callbackUrl=/studio');

  // Badge counts for the sidebar, so unread enquiries are visible at a glance.
  const [newEnquiries, newMessages, openOrders] = await Promise.all([
    safeQuery(() => prisma.b2BEnquiry.count({ where: { status: 'NEW' } }), 0),
    safeQuery(() => prisma.contactMessage.count({ where: { status: 'NEW' } }), 0),
    safeQuery(
      () =>
        prisma.order.count({
          where: { status: { notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'] } },
        }),
      0,
    ),
  ]);

  return (
    <html lang="en-NG" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-ivory-deep text-ink">
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <div className="lg:grid lg:min-h-dvh lg:grid-cols-[240px_minmax(0,1fr)]">
              <StudioNav
                name={session.user.name ?? 'Studio'}
                counts={{ enquiries: newEnquiries + newMessages, orders: openOrders }}
                cloudinaryReady={isCloudinaryConfigured()}
              />
              <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
            </div>
          </TooltipProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
