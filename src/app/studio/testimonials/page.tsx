import Link from 'next/link';

import { TestimonialRowActions } from '@/components/studio/row-actions';
import { Pill, StudioHeader, StudioTable } from '@/components/studio/studio-ui';
import { Button } from '@/components/ui/button';
import { prisma, safeQuery } from '@/lib/prisma';
import { truncate } from '@/lib/utils';

export const metadata = { title: 'Testimonials' };

export default async function StudioTestimonialsPage() {
  const testimonials = await safeQuery(
    () => prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } }),
    [],
  );

  return (
    <>
      <StudioHeader
        title="Testimonials"
        description="Client quotes. Featured ones appear on the homepage; the rest are used on Our Story and the corporate page."
        action={{ label: 'New testimonial', href: '/studio/testimonials/new' }}
      />

      <StudioTable
        rows={testimonials}
        href={(testimonial) => `/studio/testimonials/${testimonial.id}`}
        empty={{
          title: 'No testimonials yet',
          body: 'The homepage simply hides the section until there is at least one featured quote.',
          action: (
            <Button asChild>
              <Link href="/studio/testimonials/new">Add a quote</Link>
            </Button>
          ),
        }}
        columns={[
          {
            key: 'quote',
            header: 'Quote',
            render: (testimonial) => (
              <span className="block max-w-md text-xs leading-relaxed text-ink">
                {truncate(testimonial.quote, 120)}
              </span>
            ),
          },
          {
            key: 'author',
            header: 'Who',
            render: (testimonial) => (
              <span className="min-w-0">
                <span className="block truncate text-sm text-ink">{testimonial.authorName}</span>
                <span className="block truncate text-xs text-ink-faint">
                  {[testimonial.authorRole, testimonial.location].filter(Boolean).join(' · ') || '—'}
                </span>
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (testimonial) => (
              <div className="flex flex-wrap gap-1.5">
                <Pill tone={testimonial.isActive ? 'good' : 'neutral'}>
                  {testimonial.isActive ? 'Live' : 'Hidden'}
                </Pill>
                {testimonial.isFeatured ? <Pill tone="warn">Homepage</Pill> : null}
              </div>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-16 text-right',
            render: (testimonial) => (
              <TestimonialRowActions id={testimonial.id} name={testimonial.authorName} />
            ),
          },
        ]}
      />
    </>
  );
}
