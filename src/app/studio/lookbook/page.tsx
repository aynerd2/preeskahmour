import Image from 'next/image';
import Link from 'next/link';

import { LookbookRowActions } from '@/components/studio/row-actions';
import { Pill, StudioHeader, StudioTable } from '@/components/studio/studio-ui';
import { Button } from '@/components/ui/button';
import { prisma, safeQuery } from '@/lib/prisma';

export const metadata = { title: 'Lookbook' };

export default async function StudioLookbookPage() {
  const images = await safeQuery(
    () =>
      prisma.lookbookImage.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { collection: { select: { name: true } } },
      }),
    [],
  );

  return (
    <>
      <StudioHeader
        title="Lookbook"
        description="The masonry gallery. The shape setting decides whether an image runs portrait or landscape in the grid."
        action={{ label: 'Add image', href: '/studio/lookbook/new' }}
      />

      <StudioTable
        rows={images}
        href={(image) => `/studio/lookbook/${image.id}`}
        empty={{
          title: 'No lookbook images yet',
          body: 'The lookbook page shows an empty state until the first image is added.',
          action: (
            <Button asChild>
              <Link href="/studio/lookbook/new">Add the first image</Link>
            </Button>
          ),
        }}
        columns={[
          {
            key: 'image',
            header: 'Image',
            render: (image) => (
              <div className="flex items-center gap-3">
                <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-cream">
                  {image.url ? (
                    <Image src={image.url} alt="" fill sizes="44px" className="object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-ink">{image.caption ?? 'Untitled'}</span>
                  <span className="block truncate text-xs text-ink-faint">
                    {image.alt ?? 'No alt text'}
                  </span>
                </span>
              </div>
            ),
          },
          {
            key: 'collection',
            header: 'Collection',
            hideOnMobile: true,
            render: (image) => (
              <span className="text-xs text-ink-muted">{image.collection?.name ?? '—'}</span>
            ),
          },
          {
            key: 'shape',
            header: 'Shape',
            render: (image) => (
              <span className="text-xs text-ink-muted">
                {image.spanHint === 3 ? 'Landscape' : image.spanHint === 2 ? 'Tall' : 'Portrait'}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (image) => (
              <div className="flex flex-wrap gap-1.5">
                <Pill tone={image.isActive ? 'good' : 'neutral'}>
                  {image.isActive ? 'Live' : 'Hidden'}
                </Pill>
                {image.url.startsWith('/placeholders/') ? <Pill tone="info">Placeholder</Pill> : null}
              </div>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-16 text-right',
            render: (image) => (
              <LookbookRowActions id={image.id} caption={image.caption ?? 'this image'} />
            ),
          },
        ]}
      />
    </>
  );
}
