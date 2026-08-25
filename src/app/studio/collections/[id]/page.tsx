import { notFound } from 'next/navigation';

import { CollectionEditor } from '@/components/studio/editors';
import { DeleteButton, StudioHeader } from '@/components/studio/studio-ui';
import { deleteCollection } from '@/app/studio/actions';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Edit collection' };

type Params = Promise<{ id: string }>;

export default async function CollectionEditorPage({ params }: { params: Params }) {
  const { id } = await params;
  const isNew = id === 'new';

  const collection = isNew ? null : await prisma.collection.findUnique({ where: { id } });
  if (!isNew && !collection) notFound();

  const initial = collection
    ? {
        id: collection.id,
        slug: collection.slug,
        name: collection.name,
        subtitle: collection.subtitle ?? '',
        description: collection.description ?? '',
        season: collection.season ?? '',
        heroImage: collection.heroImage ?? '',
        tileImage: collection.tileImage ?? '',
        occasion: collection.occasion ?? '',
        isFeatured: collection.isFeatured,
        isActive: collection.isActive,
        sortOrder: collection.sortOrder,
      }
    : {
        slug: '',
        name: '',
        subtitle: '',
        description: '',
        season: '',
        heroImage: '',
        tileImage: '',
        occasion: '',
        isFeatured: false,
        isActive: true,
        sortOrder: 0,
      };

  return (
    <>
      <StudioHeader
        title={collection ? collection.name : 'New collection'}
        back={{ label: 'All collections', href: '/studio/collections' }}
      />

      <CollectionEditor initial={initial} />

      {collection ? (
        <div className="mt-8 border-t border-ink/12 pt-6">
          <DeleteButton
            variant="button"
            label={collection.name}
            onDelete={() => deleteCollection(collection.id)}
            redirectTo="/studio/collections"
            description="Products and lookbook images in this collection are kept — they simply lose the grouping."
          />
        </div>
      ) : null}
    </>
  );
}
