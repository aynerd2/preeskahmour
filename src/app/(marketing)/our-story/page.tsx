import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { Section, SectionHeading } from '@/components/shared/section';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/constants';
import { getContent } from '@/lib/site-content';
import { getTestimonials } from '@/lib/queries';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent('ourStory.page');
  return {
    title: 'Our story',
    description: content.lede,
    alternates: { canonical: '/our-story' },
  };
}

export default async function OurStoryPage() {
  const [content, testimonials] = await Promise.all([
    getContent('ourStory.page'),
    getTestimonials(false, 2),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={content.eyebrow}
        title={content.headline}
        lede={content.lede}
        image={{ url: content.hero.url, alt: content.hero.alt }}
      />

      {/* Portrait + opening */}
      <Section className="container" size="lg">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-16">
          <Reveal className="relative aspect-[4/5] overflow-hidden bg-cream lg:sticky lg:top-28 lg:self-start">
            <Image
              src={content.portrait.url}
              alt={content.portrait.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-cover"
            />
          </Reveal>

          <div className="space-y-14">
            {content.sections.map((section, i) => (
              <Reveal key={section.heading} delay={i * 60} as="section">
                <h2 className="text-display-sm text-ink">{section.heading}</h2>
                <p className="mt-5 max-w-2xl text-[1.05rem] leading-[1.75] text-ink-muted">
                  {section.body}
                </p>

                {section.image ? (
                  <div className="relative mt-8 aspect-[7/5] w-full overflow-hidden bg-cream">
                    <Image
                      src={section.image.url}
                      alt={section.image.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Pull quote */}
      {content.pullQuote ? (
        <Section size="lg" className="motif-asooke border-y border-ink/10 bg-cream/50">
          <div className="container">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="font-display text-display-sm leading-[1.35] text-ink">
                &ldquo;{content.pullQuote}&rdquo;
              </p>
              <p className="mt-7 text-[0.66rem] uppercase tracking-[0.2em] text-ink-muted">
                {BRAND.founder} · Founder
              </p>
            </Reveal>
          </div>
        </Section>
      ) : null}

      {/* Timeline */}
      <Section className="container" size="lg">
        <SectionHeading eyebrow="The house, so far" title="A short history" />

        <ol className="mt-12 border-l border-ink/12">
          {content.timeline.map((entry, i) => (
            <Reveal
              key={entry.year}
              as="li"
              delay={Math.min(i * 70, 350)}
              className="relative grid gap-2 pb-12 pl-8 last:pb-0 sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-8"
            >
              {/* Node on the rule */}
              <span
                className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rotate-45 bg-gold"
                aria-hidden
              />
              <p className="font-display text-xl text-emerald">{entry.year}</p>
              <div>
                <h3 className="font-display text-lg text-ink">{entry.title}</h3>
                <p className="mt-2 max-w-xl text-[0.98rem] leading-relaxed text-ink-muted">
                  {entry.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* What we hold to */}
      <Section size="lg" className="bg-ink text-ivory">
        <div className="container">
          <SectionHeading
            eyebrow="What we hold to"
            title="Four things we will not compromise on"
            tone="ivory"
          />

          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {PRINCIPLES.map((principle, i) => (
              <Reveal key={principle.title} delay={i * 80}>
                <p className="font-display text-3xl text-gold">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 font-display text-xl text-ivory">{principle.title}</h3>
                <p className="mt-3 max-w-md text-[0.96rem] leading-relaxed text-ivory/65">
                  {principle.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Two voices */}
      {testimonials.length > 0 ? (
        <Section className="container" size="md">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            {testimonials.map((testimonial, i) => (
              <Reveal key={testimonial.id} delay={i * 90} as="article">
                <blockquote className="font-display text-[1.25rem] leading-relaxed text-ink">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <p className="mt-5 text-[0.66rem] uppercase tracking-[0.16em] text-ink-muted">
                  {testimonial.authorName}
                  {testimonial.location ? ` · ${testimonial.location}` : ''}
                </p>
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Close */}
      <Section size="lg" className="border-t border-ink/10">
        <div className="container max-w-2xl text-center">
          <h2 className="text-display-md text-ink">Come and be measured</h2>
          <p className="mx-auto mt-5 text-[1.02rem] leading-relaxed text-ink-muted">
            In the Ikoyi atelier, or on a video call from anywhere. Either way, the same person
            drafts your pattern.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/builder">Design your suit</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Book an appointment</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

/**
 * House principles. Deliberately hard-coded rather than made editable —
 * these are the things that should require a conversation to change, not a
 * quick edit in the studio at midnight.
 */
const PRINCIPLES = [
  {
    title: 'The cloth is named, and so are its makers',
    body: 'Every fabric page says where the cloth comes from and who made it. If it is hand-woven or hand-dyed, we say so and we price it accordingly.',
  },
  {
    title: 'One pattern, one person',
    body: 'No graded sizes, no nesting, no "close enough". Your pattern is drafted for your measurements and kept on file for the next piece.',
  },
  {
    title: 'Construction you cannot see',
    body: 'Canvassed fronts, hand-worked buttonholes, hand-felled linings. The parts nobody photographs are the parts that decide whether a jacket lasts.',
  },
  {
    title: 'We fix what we make',
    body: 'First alteration free, always. Bring a piece back years later and we will repair it — we keep your pattern for exactly that reason.',
  },
];
