import { notFound } from 'next/navigation';

import { BaseStyleEditor } from '@/components/studio/editors';
import { DeleteButton, StudioHeader } from '@/components/studio/studio-ui';
import { deleteBaseStyle } from '@/app/studio/actions';
import { prisma } from '@/lib/prisma';
import { koboToNaira } from '@/lib/validators';

export const metadata = { title: 'Edit cut' };

type Params = Promise<{ id: string }>;

export default async function BaseStyleEditorPage({ params }: { params: Params }) {
  const { id } = await params;
  const isNew = id === 'new';

  const style = isNew ? null : await prisma.baseStyle.findUnique({ where: { id } });
  if (!isNew && !style) notFound();

  const initial = style
    ? {
        id: style.id,
        slug: style.slug,
        name: style.name,
        tagline: style.tagline ?? '',
        description: style.description ?? '',
        basePriceNaira: koboToNaira(style.basePriceKobo),
        yardageMeters: style.yardageMeters,
        thumbnailImage: style.thumbnailImage ?? '',
        previewMaskUrl: style.previewMaskUrl ?? '',
        previewShadingUrl: style.previewShadingUrl ?? '',
        occasions: style.occasions,
        supportedFits: style.supportedFits,
        optionCategories: style.optionCategories,
        isActive: style.isActive,
        sortOrder: style.sortOrder,
      }
    : {
        slug: '',
        name: '',
        tagline: '',
        description: '',
        basePriceNaira: 145000,
        yardageMeters: 3.4,
        thumbnailImage: '',
        previewMaskUrl: '',
        previewShadingUrl: '',
        occasions: [],
        supportedFits: ['REGULAR', 'SLIM', 'RELAXED'],
        optionCategories: [
          'LAPEL',
          'CLOSURE',
          'BUTTON_COUNT',
          'BUTTON_COLOR',
          'POCKET',
          'SLEEVE',
          'LINING',
          'TRIM',
        ],
        isActive: true,
        sortOrder: 0,
      };

  return (
    <>
      <StudioHeader
        title={style ? style.name : 'New cut'}
        description="The slug matters: the builder's preview picks its silhouette from it. New slugs fall back to the blazer-and-trouser drawing until artwork is uploaded."
        back={{ label: 'All cuts', href: '/studio/base-styles' }}
      />

      <BaseStyleEditor initial={initial} />

      {style ? (
        <div className="mt-8 border-t border-ink/12 pt-6">
          <DeleteButton
            variant="button"
            label={style.name}
            onDelete={() => deleteBaseStyle(style.id)}
            redirectTo="/studio/base-styles"
            description="Cuts used by existing designs or products cannot be deleted — untick “Available in the builder” instead."
          />
        </div>
      ) : null}
    </>
  );
}
