import { notFound } from 'next/navigation';

import { FabricEditor } from '@/components/studio/editors';
import { DeleteButton, StudioHeader } from '@/components/studio/studio-ui';
import { deleteFabric } from '@/app/studio/actions';
import { prisma } from '@/lib/prisma';
import { koboToNaira } from '@/lib/validators';

export const metadata = { title: 'Edit fabric' };

type Params = Promise<{ id: string }>;

/**
 * One route serves both "new" and "edit" — `/studio/fabrics/new` falls
 * through to the blank defaults. Every studio editor follows this pattern.
 */
export default async function FabricEditorPage({ params }: { params: Params }) {
  const { id } = await params;
  const isNew = id === 'new';

  const fabric = isNew ? null : await prisma.fabric.findUnique({ where: { id } });
  if (!isNew && !fabric) notFound();

  const initial = fabric
    ? {
        id: fabric.id,
        slug: fabric.slug,
        name: fabric.name,
        description: fabric.description ?? '',
        family: fabric.family,
        weight: fabric.weight,
        colorName: fabric.colorName,
        colorHex: fabric.colorHex,
        colorTags: fabric.colorTags,
        swatchImage: fabric.swatchImage ?? '',
        textureImage: fabric.textureImage ?? '',
        detailImage: fabric.detailImage ?? '',
        pricePerMeterNaira: koboToNaira(fabric.pricePerMeterKobo),
        composition: fabric.composition ?? '',
        gsm: fabric.gsm,
        widthCm: fabric.widthCm,
        origin: fabric.origin ?? '',
        artisanNote: fabric.artisanNote ?? '',
        occasions: fabric.occasions,
        inStock: fabric.inStock,
        isFeatured: fabric.isFeatured,
        sortOrder: fabric.sortOrder,
      }
    : {
        slug: '',
        name: '',
        description: '',
        family: 'ADIRE',
        weight: 'MID',
        colorName: '',
        colorHex: '#23335C',
        colorTags: [],
        swatchImage: '',
        textureImage: '',
        detailImage: '',
        pricePerMeterNaira: 8500,
        composition: '',
        gsm: null,
        widthCm: null,
        origin: '',
        artisanNote: '',
        occasions: [],
        inStock: true,
        isFeatured: false,
        sortOrder: 0,
      };

  return (
    <>
      <StudioHeader
        title={fabric ? fabric.name : 'New fabric'}
        description={
          fabric
            ? 'Changes appear on the fabric library, the builder and every product cut from this cloth.'
            : 'Add a cloth to the library. It becomes selectable in the builder as soon as it is in stock.'
        }
        back={{ label: 'All fabrics', href: '/studio/fabrics' }}
      />

      <FabricEditor initial={initial} />

      {fabric ? (
        <div className="mt-8 border-t border-ink/12 pt-6">
          <DeleteButton
            variant="button"
            label={fabric.name}
            onDelete={() => deleteFabric(fabric.id)}
            redirectTo="/studio/fabrics"
            description={`${fabric.name} will be removed from the library and the builder. If any product or saved design uses it, deleting is blocked — mark it out of stock instead.`}
          />
        </div>
      ) : null}
    </>
  );
}
