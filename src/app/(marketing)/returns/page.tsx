import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { Section } from '@/components/shared/section';
import { Button } from '@/components/ui/button';
import { getContent } from '@/lib/site-content';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent('returns.page');
  return {
    title: 'Alterations, returns & care',
    description: content.lede,
    alternates: { canonical: '/returns' },
  };
}

export default async function ReturnsPage() {
  const content = await getContent('returns.page');

  return (
    <>
      <PageHeader eyebrow="Care" title={content.headline} lede={content.lede} />

      <div className="container pb-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-20">
          {/* Section index — a genuinely useful thing on a policy page */}
          <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-4">On this page</p>
            <ul className="space-y-2.5">
              {content.sections.map((section) => (
                <li key={section.heading}>
                  <a
                    href={`#${slugify(section.heading)}`}
                    className="link-underline text-sm text-ink-muted hover:text-ink"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-2xl space-y-12">
            {content.sections.map((section, i) => (
              <Reveal
                key={section.heading}
                delay={Math.min(i * 50, 250)}
                as="section"
                className="scroll-mt-28"
              >
                <div id={slugify(section.heading)} className="scroll-mt-28">
                  <h2 className="font-display text-[1.5rem] leading-snug text-ink">
                    {section.heading}
                  </h2>
                  <p className="mt-4 text-[1.02rem] leading-[1.75] text-ink-muted">
                    {section.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <Section size="md" className="motif-asooke border-t border-ink/10 bg-cream/50">
        <div className="container max-w-2xl text-center">
          <h2 className="text-display-sm text-ink">Something not sitting right?</h2>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-muted">
            Send us a photo on WhatsApp before you send the garment back — nine times out of ten we
            can tell you exactly what needs doing, and sometimes it is a five-minute fix at a tailor
            near you that we will happily pay for.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/contact?topic=An+existing+order">Get in touch</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account/orders">Find your order</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
