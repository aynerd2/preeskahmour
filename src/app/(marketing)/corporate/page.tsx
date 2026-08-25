import type { Metadata } from 'next';
import Link from 'next/link';

import { B2BForm } from '@/components/forms/b2b-form';
import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { Section, SectionHeading } from '@/components/shared/section';
import { Button } from '@/components/ui/button';
import { getContent } from '@/lib/site-content';
import { getTestimonials } from '@/lib/queries';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent('corporate.page');
  return {
    title: 'Corporate & bulk orders',
    description: content.lede,
    alternates: { canonical: '/corporate' },
  };
}

export default async function CorporatePage() {
  const [content, testimonials] = await Promise.all([
    getContent('corporate.page'),
    getTestimonials(false, 6),
  ]);

  // Prefer a quote from someone who ordered for a team.
  const quote =
    testimonials.find((t) => /team|office|procurement|staff/i.test(t.quote)) ?? testimonials[0];

  return (
    <>
      <PageHeader
        eyebrow={content.eyebrow}
        title={content.headline}
        lede={content.lede}
        image={{ url: content.hero.url, alt: content.hero.alt }}
      />

      {/* What you get */}
      <Section className="container" size="lg">
        <SectionHeading
          eyebrow="How it works for teams"
          title="One contact, one fitting session, one delivery date"
          body="Six pieces or more goes through the corporate desk. That changes how we work with you — here is what that means in practice."
        />

        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {content.bullets.map((bullet, i) => (
            <Reveal key={bullet.title} delay={Math.min(i * 70, 350)}>
              <p className="font-display text-3xl text-gold">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 font-display text-lg text-ink">{bullet.title}</h3>
              <p className="mt-2.5 text-[0.96rem] leading-relaxed text-ink-muted">{bullet.body}</p>
            </Reveal>
          ))}
        </div>

        <p className="mt-12 border-l-2 border-gold py-1 pl-5 text-sm text-ink-muted">
          {content.minimumNote}
        </p>
      </Section>

      {/* Process */}
      <Section className="motif-diamond border-y border-ink/10 bg-cream/40">
        <div className="container">
          <SectionHeading eyebrow="The sequence" title="From first call to delivered rail" />

          <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step, i) => (
              <Reveal key={step.title} delay={i * 80} as="li" className="border-t border-ink/15 pt-5">
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
                  Step {i + 1}
                </p>
                <h3 className="mt-2.5 font-display text-lg text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
                <p className="mt-3 text-[0.62rem] uppercase tracking-[0.14em] text-emerald">
                  {step.timing}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {quote ? (
        <Section className="container" size="md">
          <Reveal className="mx-auto max-w-3xl text-center">
            <blockquote className="font-display text-display-sm leading-[1.4] text-ink">
              &ldquo;{quote.quote}&rdquo;
            </blockquote>
            <p className="mt-6 text-[0.66rem] uppercase tracking-[0.18em] text-ink-muted">
              {quote.authorName}
              {quote.authorRole ? ` · ${quote.authorRole}` : ''}
              {quote.location ? ` · ${quote.location}` : ''}
            </p>
          </Reveal>
        </Section>
      ) : null}

      {/* Enquiry form */}
      <Section id="enquiry" className="container" size="lg">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Start here"
              title="Tell us about the order"
              body="Give us the outline and we will come back within a working day with next steps and an indicative quote your procurement team can actually read."
            />

            <div className="mt-8 space-y-3 border-t border-ink/10 pt-8">
              <p className="text-sm text-ink-muted">
                Prefer to talk it through first?
              </p>
              <Button asChild variant="outline">
                <Link href="/contact">Contact the atelier</Link>
              </Button>
            </div>
          </div>

          <B2BForm />
        </div>
      </Section>
    </>
  );
}

/**
 * The corporate sequence. Hard-coded rather than editable — these are
 * commitments about timing that should not be changed without a conversation.
 */
const PROCESS = [
  {
    title: 'Scoping call',
    body: 'Twenty minutes to establish headcount, cuts, cloth and the date it all has to be ready by.',
    timing: 'Within 1 working day',
  },
  {
    title: 'Cloth and quote',
    body: 'A physical swatch pack to your office, and an itemised proforma invoice with tiered pricing.',
    timing: 'Within 1 week',
  },
  {
    title: 'On-site fitting',
    body: 'We come to you and measure everyone in a single session. Each person picks their cut from the approved set.',
    timing: 'Half a day',
  },
  {
    title: 'Cut and deliver',
    body: 'Everything is made in Lagos and delivered together, labelled by name, on one date.',
    timing: '4–8 weeks',
  },
];
