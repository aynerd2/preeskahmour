import { notFound } from 'next/navigation';

import { LookbookEditor } from '@/components/studio/editors';
import { DeleteButton, StudioHeader } from '@/components/studio/studio-ui';
import { deleteLookbookImage } from '@/app/studio/actions';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Edit lookbook image' };

type Params = Promise<{ id: string }>;

export default async function LookbookEditorPage({ params }: { params: Params }) {
  const { id } = await params;
  const isNew = id === 'new';

  const [image, collections] = await Promise.all([
    isNew ? null : prisma.lookbookImage.findUnique({ where: { id } }),
    prisma.collection.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, name: true } }),
  ]);

  if (!isNew && !image) notFound();

  const initial = image
    ? {
        id: image.id,
        url: image.url,
        alt: image.alt ?? '',
        caption: image.caption ?? '',
        briefNote: image.briefNote ?? '',
        collectionId: image.collectionId ?? '',
        season: image.season ?? '',
        occasion: image.occasion ?? '',
        spanHint: String(image.spanHint),
        isActive: image.isActive,
        sortOrder: image.sortOrder,
      }
    : {
        url: '',
        alt: '',
        caption: '',
        briefNote: '',
        collectionId: '',
        season: '',
        occasion: '',
        spanHint: '1',
        isActive: true,
        sortOrder: 0,
      };

  return (
    <>
      <StudioHeader
        title={image ? (image.caption ?? 'Lookbook image') : 'Add lookbook image'}
        back={{ label: 'All lookbook images', href: '/studio/lookbook' }}
      />

      <LookbookEditor
        initial={initial}
        collections={collections.map((c) => ({ value: c.id, label: c.name }))}
      />

      {image ? (
        <div className="mt-8 border-t border-ink/12 pt-6">
          <DeleteButton
            variant="button"
            label={image.caption ?? 'this image'}
            onDelete={() => deleteLookbookImage(image.id)}
            redirectTo="/studio/lookbook"
          />
        </div>
      ) : null}
    </>
  );
}
