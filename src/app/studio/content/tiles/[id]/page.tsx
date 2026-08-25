import { notFound } from 'next/navigation';

import { HomeTileEditor } from '@/components/studio/editors';
import { DeleteButton, StudioHeader } from '@/components/studio/studio-ui';
import { deleteHomeTile } from '@/app/studio/actions';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Edit occasion tile' };

type Params = Promise<{ id: string }>;

export default async function HomeTileEditorPage({ params }: { params: Params }) {
  const { id } = await params;
  const isNew = id === 'new';

  const tile = isNew ? null : await prisma.homeTile.findUnique({ where: { id } });
  if (!isNew && !tile) notFound();

  const initial = tile
    ? {
        id: tile.id,
        label: tile.label,
        subtitle: tile.subtitle ?? '',
        href: tile.href,
        imageUrl: tile.imageUrl ?? '',
        briefNote: tile.briefNote ?? '',
        occasion: tile.occasion ?? '',
        isActive: tile.isActive,
        sortOrder: tile.sortOrder,
      }
    : {
        label: '',
        subtitle: '',
        href: '/shop',
        imageUrl: '',
        briefNote: '',
        occasion: '',
        isActive: true,
        sortOrder: 0,
      };

  return (
    <>
      <StudioHeader
        title={tile ? `${tile.label} tile` : 'New occasion tile'}
        back={{ label: 'Pages & homepage', href: '/studio/content' }}
      />

      <HomeTileEditor initial={initial} onDone="/studio/content" />

      {tile ? (
        <div className="mt-8 border-t border-ink/12 pt-6">
          <DeleteButton
            variant="button"
            label={`the ${tile.label} tile`}
            onDelete={() => deleteHomeTile(tile.id)}
            redirectTo="/studio/content"
          />
        </div>
      ) : null}
    </>
  );
}
