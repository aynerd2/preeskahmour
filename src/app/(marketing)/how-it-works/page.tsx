import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { Section, SectionHeading } from '@/components/shared/section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { getContent } from '@/lib/site-content';
import { absoluteUrl } from '@/lib/utils';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent('howItWorks.page');
  return {
    title: 'How it works',
    description: content.lede,
    alternates: { canonical: '/how-it-works' },
  };
}

export default async function HowItWorksPage() {
  const content = await getContent('howItWorks.page');

  // FAQ structured data — these are exactly the questions people search for
  // before ordering made-to-measure, so they are worth surfacing in results.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PageHeader
        eyebrow={content.eyebrow}
        title={content.headline}
        lede={content.lede}
        image={{ url: content.hero.url, alt: content.hero.alt }}
      />

      {/* The four steps, alternating sides */}
      <Section className="container" size="lg">
        <ol className="space-y-20 sm:space-y-28">
          {content.steps.map((step, index) => (
            <li key={step.title}>
              <div
                className={`grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16 ${
                  index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <Reveal className="relative aspect-[4/3] overflow-hidden bg-cream">
                  <Image
                    src={step.image.url}
                    alt={step.image.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </Reveal>

                <Reveal delay={100}>
                  <p className="font-display text-5xl text-gold sm:text-6xl">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h2 className="mt-4 text-display-sm text-ink">{step.title}</h2>
                  <p className="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-ink-muted">
                    {step.body}
                  </p>
                </Reveal>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* What "made to measure" actually means here */}
      <Section className="motif-diamond border-y border-ink/10 bg-cream/40">
        <div className="container">
          <SectionHeading
            eyebrow="The distinction"
            title="Made to measure, not made to a size"
            body="These words get used loosely. Here is precisely what we do and do not do, so you know what you are buying."
          />

          <div className="mt-12 grid gap-px bg-ink/10 md:grid-cols-3">
            <Definition
              term="Off the peg"
              body="A garment cut to a standard size chart and sold as-is. Fast and cheap. It fits the average of a thousand bodies, which means it fits nobody exactly."
              us={false}
            />
            <Definition
              term="Made to measure"
              body="A house pattern adjusted to your specific measurements, then cut and made for you alone. This is what we do — with a canvassed front, hand-finished details and two fittings included."
              us
            />
            <Definition
              term="Bespoke"
              body="A pattern drafted from nothing over multiple in-person fittings, usually across months. We do this too, by appointment, for bridal and archive commissions."
              us={false}
            />
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="container" size="lg">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Questions"
              title="Asked and answered"
              body="If yours is not here, message us on WhatsApp — someone in the atelier will answer, not a bot."
            />
            <Button asChild variant="outline" className="mt-7">
              <Link href="/contact">Ask us something</Link>
            </Button>
          </div>

          <Accordion type="single" collapsible className="border-t border-ink/12">
            {content.faq.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* Close */}
      <Section size="lg" className="bg-emerald-deep text-ivory">
        <div className="container max-w-2xl text-center">
          <h2 className="text-display-md text-ivory">Ready when you are</h2>
          <p className="mx-auto mt-5 text-[1.02rem] leading-relaxed text-ivory/70">
            Four minutes in the builder gets you a full quote and a saved design. Nothing is
            charged until you decide.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gold">
              <Link href="/builder">Design your suit</Link>
            </Button>
            <Button asChild size="lg" variant="outline-light">
              <Link href={absoluteUrl('/measurement-guide')}>Read the measuring guide</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

function Definition({ term, body, us }: { term: string; body: string; us: boolean }) {
  return (
    <div className={`bg-background p-7 sm:p-9 ${us ? 'ring-1 ring-inset ring-gold' : ''}`}>
      {us ? <p className="eyebrow mb-3 text-gold-deep">What we do</p> : <p className="eyebrow mb-3">&nbsp;</p>}
      <h3 className="font-display text-xl text-ink">{term}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
