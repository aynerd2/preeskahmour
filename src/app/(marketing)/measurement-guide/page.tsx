import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Info } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { Section, SectionHeading } from '@/components/shared/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MEASUREMENT_FIELDS, TOLERANCE_CM, type MeasurementGroup } from '@/lib/measurements';
import { getContent } from '@/lib/site-content';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent('measurementGuide.page');
  return {
    title: 'Measurement guide',
    description: content.lede,
    alternates: { canonical: '/measurement-guide' },
  };
}

const GROUP_ORDER: MeasurementGroup[] = ['Upper body', 'Arm', 'Lower body', 'Lengths'];

export default async function MeasurementGuidePage() {
  const content = await getContent('measurementGuide.page');

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    fields: MEASUREMENT_FIELDS.filter((f) => f.group === group),
  })).filter((g) => g.fields.length > 0);

  return (
    <>
      <PageHeader eyebrow="Size help" title={content.headline} lede={content.lede} />

      <div className="container pb-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
          {/* The measurements */}
          <div className="order-2 lg:order-1">
            <div className="space-y-14">
              {grouped.map((section) => (
                <section key={section.group}>
                  <h2 className="border-b border-ink/12 pb-3 font-display text-xl text-ink">
                    {section.group}
                  </h2>

                  <ol className="mt-6 space-y-7">
                    {section.fields.map((field) => (
                      <Reveal key={field.key} as="li" className="flex gap-5">
                        <span
                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-gold/50 font-display text-sm text-gold-deep"
                          aria-hidden
                        >
                          {MEASUREMENT_FIELDS.indexOf(field) + 1}
                        </span>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="font-display text-[1.1rem] text-ink">{field.label}</h3>
                            {field.core ? (
                              <Badge variant="emerald">Required</Badge>
                            ) : (
                              <Badge>Helpful</Badge>
                            )}
                          </div>
                          <p className="mt-2 text-[0.96rem] leading-relaxed text-ink-muted">
                            {field.howTo}
                          </p>
                        </div>
                      </Reveal>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          </div>

          {/* Diagram + tips */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-cream">
              <Image
                src={content.diagram.url}
                alt={content.diagram.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover"
              />
            </div>

            <div className="mt-8 border border-ink/12 p-6">
              <h2 className="font-display text-lg text-ink">Before you start</h2>
              <ul className="mt-4 space-y-3">
                {content.tips.map((tip) => (
                  <li key={tip} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" aria-hidden />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* The estimator — with its limits stated plainly */}
      <Section className="motif-adire border-y border-ink/10 bg-cream/50">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="No tape measure?"
                title="Let us estimate them for you"
                body={content.estimatorNote}
              />
              <Button asChild size="lg" className="mt-8">
                <Link href="/builder?step=measurements">Try the quick estimate</Link>
              </Button>
            </div>

            <Reveal delay={100} className="border border-ink/15 bg-background p-7 sm:p-9">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden />
                <div>
                  <h3 className="font-display text-lg text-ink">
                    What the estimate is, and what it is not
                  </h3>
                  <div className="mt-4 space-y-3.5 text-sm leading-relaxed text-ink-muted">
                    <p>
                      It is a proportion table. We take your height and weight, adjust for a few
                      fit questions, and produce a plausible starting pattern. That is genuinely
                      useful — it is how tailors have drafted from limited information for a very
                      long time.
                    </p>
                    <p>
                      It is <strong className="text-ink">not</strong> a body scan, computer vision
                      or machine learning, and we will not pretend otherwise. It typically lands
                      within about {TOLERANCE_CM}cm.
                    </p>
                    <p>
                      So: every estimated profile is flagged in your account, confirmed with you on
                      a short video call before we cut, and the garment is made with extra seam
                      allowance so it can be let out rather than remade.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Help */}
      <Section className="container" size="sm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-display-sm text-ink">Still not sure?</h2>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-muted">
            Book a fifteen-minute video call and we will talk you through it with a tape in your
            hand. It costs nothing and it is by far the most reliable way to get this right.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/contact?topic=Sizing">Book a measuring call</Link>
            </Button>
            <Button asChild>
              <Link href="/builder">Start designing</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
