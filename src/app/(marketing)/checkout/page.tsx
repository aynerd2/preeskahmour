import type { Metadata } from 'next';
import Link from 'next/link';

import { CheckoutForm } from '@/components/checkout/checkout-form';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { prisma, safeQuery } from '@/lib/prisma';
import { availableProviders } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your Preeskahmour order.',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await auth();
  const providers = availableProviders();

  const [addresses, profiles, user] = session?.user?.id
    ? await Promise.all([
        safeQuery(
          () =>
            prisma.address.findMany({
              where: { userId: session.user.id },
              orderBy: { isDefault: 'desc' },
            }),
          [],
        ),
        safeQuery(
          () =>
            prisma.measurementProfile.findMany({
              where: { userId: session.user.id },
              orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
              select: { id: true, name: true, source: true, isDefault: true },
            }),
          [],
        ),
        safeQuery(
          () =>
            prisma.user.findUnique({
              where: { id: session.user.id },
              select: { name: true, email: true, phone: true },
            }),
          null,
        ),
      ])
    : [[], [], null];

  // Honest failure: if neither rail has keys, say so and give people a way to
  // order anyway, rather than showing a pay button that cannot work.
  if (providers.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Checkout"
          title="Online payment is not switched on yet"
          lede="No payment provider is configured for this deployment, so we cannot take a card here right now. Your bag is safe — send us the order and we will invoice you directly."
        />
        <div className="container pb-24">
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/contact?topic=An+existing+order">Send us your order</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/cart">Back to your bag</Link>
            </Button>
          </div>
          <p className="mt-8 max-w-xl text-xs leading-relaxed text-ink-faint">
            Developer note: add <code className="bg-cream px-1">PAYSTACK_SECRET_KEY</code> or{' '}
            <code className="bg-cream px-1">STRIPE_SECRET_KEY</code> to <code>.env</code> — see{' '}
            <code>.env.example</code>.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Checkout"
        title="Where is it going?"
        lede="Made-to-measure pieces are cut for you once this is paid. Nothing is charged until you confirm on the payment page."
      />

      <div className="container pb-24">
        <CheckoutForm
          providers={providers}
          addresses={addresses}
          measurementProfiles={profiles}
          defaults={{
            email: user?.email ?? '',
            customerName: user?.name ?? '',
            phone: user?.phone ?? '',
          }}
          isSignedIn={Boolean(session?.user)}
        />
      </div>
    </>
  );
}
