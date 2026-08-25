import Link from 'next/link';

import { CollectionRowActions } from '@/components/studio/row-actions';
import { Pill, StudioHeader, StudioTable } from '@/components/studio/studio-ui';
import { Button } from '@/components/ui/button';
import { prisma, safeQuery } from '@/lib/prisma';
import { OCCASION_LABELS } from '@/lib/constants';

export const metadata = { title: 'Collections' };

export default async function StudioCollectionsPage() {
  const collections = await safeQuery(
    () =>
      prisma.collection.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: true, lookbookImages: true } } },
      }),
    [],
  );

  return (
    <>
      <StudioHeader
        title="Collections"
        description="Groupings for the shop and the lookbook — a season, or a permanent line like Bridal."
        action={{ label: 'New collection', href: '/studio/collections/new' }}
      />

      <StudioTable
        rows={collections}
        href={(collection) => `/studio/collections/${collection.id}`}
        empty={{
          title: 'No collections yet',
          body: 'Products work perfectly well without one — collections just give the shop and lookbook a way to group them.',
          action: (
            <Button asChild>
              <Link href="/studio/collections/new">Add a collection</Link>
            </Button>
          ),
        }}
        columns={[
          {
            key: 'name',
            header: 'Collection',
            render: (collection) => (
              <span className="min-w-0">
                <span className="block truncate text-ink">{collection.name}</span>
                <span className="block truncate text-xs text-ink-faint">
                  {collection.subtitle ?? collection.season ?? '—'}
                </span>
              </span>
            ),
          },
          {
            key: 'occasion',
            header: 'Occasion',
            hideOnMobile: true,
            render: (collection) => (
              <span className="text-xs text-ink-muted">
                {collection.occasion ? OCCASION_LABELS[collection.occasion] : '—'}
              </span>
            ),
          },
          {
            key: 'contents',
            header: 'Contains',
            render: (collection) => (
              <span className="text-xs text-ink-muted">
                {collection._count.products} products · {collection._count.lookbookImages} images
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (collection) => (
              <div className="flex gap-1.5">
                <Pill tone={collection.isActive ? 'good' : 'neutral'}>
                  {collection.isActive ? 'Live' : 'Hidden'}
                </Pill>
                {collection.isFeatured ? <Pill tone="warn">Featured</Pill> : null}
              </div>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-16 text-right',
            render: (collection) => (
              <CollectionRowActions id={collection.id} name={collection.name} />
            ),
          },
        ]}
      />
    </>
  );
}
