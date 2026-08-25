import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Clock, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

import { ContactForm } from '@/components/forms/contact-form';
import { PageHeader } from '@/components/shared/page-header';
import { Section } from '@/components/shared/section';
import { Skeleton } from '@/components/ui/skeleton';
import { BRAND } from '@/lib/constants';
import { getContent } from '@/lib/site-content';
import { absoluteUrl } from '@/lib/utils';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Talk to the Preeskahmour atelier in Lagos about a commission, a fitting, your own cloth, or an order already with us.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const contact = await getContent('site.contact');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: BRAND.name,
    description: BRAND.descriptor,
    email: contact.email,
    telephone: contact.phone,
    url: absoluteUrl(),
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.addressLines[0],
      addressLocality: 'Lagos',
      addressCountry: 'NG',
    },
    sameAs: [BRAND.instagram],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Contact"
        title="Talk to the atelier"
        lede="A real person reads every message. If you are asking about sizing, an order already with us, or cloth you want to send in, say so and it goes straight to the right desk."
      />

      <div className="container pb-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:gap-20">
          <div>
            <Suspense fallback={<ContactFormSkeleton />}>
              <ContactForm />
            </Suspense>
          </div>

          <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
            <div>
              <h2 className="eyebrow mb-5">Faster than a form</h2>
              <ul className="space-y-4">
                <ContactRow
                  icon={<MessageCircle className="h-4 w-4" />}
                  label="WhatsApp"
                  value={contact.whatsapp}
                  href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`}
                  note="Fastest for fitting questions and photos of cloth."
                />
                <ContactRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Telephone"
                  value={contact.phone}
                  href={`tel:${contact.phone.replace(/\s/g, '')}`}
                />
                <ContactRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={contact.email}
                  href={`mailto:${contact.email}`}
                />
                <ContactRow
                  icon={<Instagram className="h-4 w-4" />}
                  label="Instagram"
                  value={BRAND.instagramHandle}
                  href={BRAND.instagram}
                  external
                />
              </ul>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <h2 className="eyebrow mb-5">The atelier</h2>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-ink-muted">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden />
                  <span>
                    {contact.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-ink-muted">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden />
                  {contact.hours}
                </li>
              </ul>

              <p className="mt-6 border-l-2 border-gold py-1 pl-4 text-sm leading-relaxed text-ink-muted">
                {contact.appointmentNote}
              </p>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <h2 className="eyebrow mb-4">Might answer it faster</h2>
              <ul className="space-y-2.5 text-sm">
                <QuickLink href="/how-it-works">How made-to-measure works here</QuickLink>
                <QuickLink href="/measurement-guide">How to measure yourself</QuickLink>
                <QuickLink href="/returns">Alterations, returns &amp; care</QuickLink>
                <QuickLink href="/corporate">Corporate &amp; bulk orders</QuickLink>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <Section size="sm" className="motif-adire border-t border-ink/10 bg-cream/50">
        <div className="container max-w-2xl text-center">
          <h2 className="text-display-sm text-ink">Ordering from outside Nigeria?</h2>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-muted">
            We ship worldwide and run fittings over video call in any timezone — Houston, London and
            Toronto are regulars. Say where you are when you write and we will offer times that
            actually work for you.
          </p>
        </div>
      </Section>
    </>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  note,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  note?: string;
  external?: boolean;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-gold-deep" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
          {label}
        </span>
        <a
          href={href}
          {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
          className="link-underline block break-words text-sm text-ink"
        >
          {value}
        </a>
        {note ? <span className="mt-1 block text-xs text-ink-faint">{note}</span> : null}
      </span>
    </li>
  );
}

function QuickLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="link-underline text-ink-muted hover:text-ink">
        {children}
      </Link>
    </li>
  );
}

function ContactFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-[72px]" />
        <Skeleton className="h-[72px]" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-[72px]" />
        <Skeleton className="h-[72px]" />
      </div>
      <Skeleton className="h-[170px]" />
      <Skeleton className="h-14 w-40" />
    </div>
  );
}
