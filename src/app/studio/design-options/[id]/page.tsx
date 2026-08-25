import { notFound } from 'next/navigation';

import { DesignOptionEditor } from '@/components/studio/editors';
import { DeleteButton, StudioHeader } from '@/components/studio/studio-ui';
import { deleteDesignOption } from '@/app/studio/actions';
import { prisma } from '@/lib/prisma';
import { koboToNaira } from '@/lib/validators';

export const metadata = { title: 'Edit design option' };

type Params = Promise<{ id: string }>;

export default async function DesignOptionEditorPage({ params }: { params: Params }) {
  const { id } = await params;
  const isNew = id === 'new';

  const [option, baseStyles] = await Promise.all([
    isNew ? null : prisma.designOption.findUnique({ where: { id } }),
    prisma.baseStyle.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, name: true } }),
  ]);

  if (!isNew && !option) notFound();

  const initial = option
    ? {
        id: option.id,
        slug: option.slug,
        name: option.name,
        category: option.category,
        description: option.description ?? '',
        priceModifierNaira: koboToNaira(option.priceModifierKobo),
        iconUrl: option.iconUrl ?? '',
        overlayUrl: option.overlayUrl ?? '',
        colorHex: option.colorHex ?? '',
        zIndex: option.zIndex,
        baseStyleId: option.baseStyleId ?? '',
        isDefault: option.isDefault,
        isActive: option.isActive,
        sortOrder: option.sortOrder,
      }
    : {
        slug: '',
        name: '',
        category: 'LAPEL',
        description: '',
        priceModifierNaira: 0,
        iconUrl: '',
        overlayUrl: '',
        colorHex: '',
        zIndex: 10,
        baseStyleId: '',
        isDefault: false,
        isActive: true,
        sortOrder: 0,
      };

  return (
    <>
      <StudioHeader
        title={option ? option.name : 'New design option'}
        description="The builder draws each option from its slug. Changing the slug of an existing option changes what the preview draws, so leave the house ones alone."
        back={{ label: 'All options', href: '/studio/design-options' }}
      />

      <DesignOptionEditor
        initial={initial}
        baseStyles={baseStyles.map((style) => ({ value: style.id, label: style.name }))}
      />

      {option ? (
        <div className="mt-8 border-t border-ink/12 pt-6">
          <DeleteButton
            variant="button"
            label={option.name}
            onDelete={() => deleteDesignOption(option.id)}
            redirectTo="/studio/design-options"
            description="Options chosen on existing designs cannot be deleted — untick “Available in the builder” instead."
          />
        </div>
      ) : null}
    </>
  );
}
