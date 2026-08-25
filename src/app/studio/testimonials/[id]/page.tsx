import { notFound } from 'next/navigation';

import { TestimonialEditor } from '@/components/studio/editors';
import { DeleteButton, StudioHeader } from '@/components/studio/studio-ui';
import { deleteTestimonial } from '@/app/studio/actions';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Edit testimonial' };

type Params = Promise<{ id: string }>;

export default async function TestimonialEditorPage({ params }: { params: Params }) {
  const { id } = await params;
  const isNew = id === 'new';

  const testimonial = isNew ? null : await prisma.testimonial.findUnique({ where: { id } });
  if (!isNew && !testimonial) notFound();

  const initial = testimonial
    ? {
        id: testimonial.id,
        quote: testimonial.quote,
        authorName: testimonial.authorName,
        authorRole: testimonial.authorRole ?? '',
        location: testimonial.location ?? '',
        imageUrl: testimonial.imageUrl ?? '',
        rating: testimonial.rating,
        isFeatured: testimonial.isFeatured,
        isActive: testimonial.isActive,
        sortOrder: testimonial.sortOrder,
      }
    : {
        quote: '',
        authorName: '',
        authorRole: '',
        location: '',
        imageUrl: '',
        rating: 5,
        isFeatured: false,
        isActive: true,
        sortOrder: 0,
      };

  return (
    <>
      <StudioHeader
        title={testimonial ? `Quote from ${testimonial.authorName}` : 'New testimonial'}
        description="Use the customer's real words, with their permission. A first name and an initial is enough if they would rather not be fully named."
        back={{ label: 'All testimonials', href: '/studio/testimonials' }}
      />

      <TestimonialEditor initial={initial} />

      {testimonial ? (
        <div className="mt-8 border-t border-ink/12 pt-6">
          <DeleteButton
            variant="button"
            label={`the quote from ${testimonial.authorName}`}
            onDelete={() => deleteTestimonial(testimonial.id)}
            redirectTo="/studio/testimonials"
          />
        </div>
      ) : null}
    </>
  );
}
