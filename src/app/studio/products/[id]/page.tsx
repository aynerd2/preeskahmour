import { notFound } from 'next/navigation';

import { ProductEditor } from '@/components/studio/editors';
import { DeleteButton, StudioHeader } from '@/components/studio/studio-ui';
import { deleteProduct } from '@/app/studio/actions';
import { prisma } from '@/lib/prisma';
import { koboToNaira } from '@/lib/validators';

export const metadata = { title: 'Edit product' };

type Params = Promise<{ id: string }>;

export default async function ProductEditorPage({ params }: { params: Params }) {
  const { id } = await params;
  const isNew = id === 'new';

  const [product, fabrics, baseStyles, collections] = await Promise.all([
    isNew
      ? null
      : prisma.product.findUnique({
          where: { id },
          include: { images: { orderBy: { sortOrder: 'asc' } } },
        }),
    prisma.fabric.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.baseStyle.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, name: true } }),
    prisma.collection.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, name: true } }),
  ]);

  if (!isNew && !product) notFound();

  const initial = product
    ? {
        id: product.id,
        slug: product.slug,
        name: product.name,
        subtitle: product.subtitle ?? '',
        description: product.description ?? '',
        storyNote: product.storyNote ?? '',
        priceNaira: koboToNaira(product.priceKobo),
        compareAtNaira: product.compareAtKobo ? koboToNaira(product.compareAtKobo) : null,
        occasion: product.occasion,
        silhouette: product.silhouette,
        baseStyleId: product.baseStyleId ?? '',
        fabricId: product.fabricId ?? '',
        collectionId: product.collectionId ?? '',
        isMadeToMeasure: product.isMadeToMeasure,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        leadTimeDays: product.leadTimeDays,
        sortOrder: product.sortOrder,
        seoTitle: product.seoTitle ?? '',
        seoDescription: product.seoDescription ?? '',
        images: product.images.map((image) => ({
          url: image.url,
          alt: image.alt ?? '',
          briefNote: image.briefNote ?? '',
        })),
      }
    : {
        slug: '',
        name: '',
        subtitle: '',
        description: '',
        storyNote: '',
        priceNaira: 180000,
        compareAtNaira: null,
        occasion: 'EVERYDAY',
        silhouette: '',
        baseStyleId: '',
        fabricId: '',
        collectionId: '',
        isMadeToMeasure: true,
        isFeatured: false,
        isActive: true,
        leadTimeDays: 21,
        sortOrder: 0,
        seoTitle: '',
        seoDescription: '',
        images: [],
      };

  const toRef = (rows: { id: string; name: string }[]) =>
    rows.map((row) => ({ value: row.id, label: row.name }));

  return (
    <>
      <StudioHeader
        title={product ? product.name : 'New product'}
        back={{ label: 'All products', href: '/studio/products' }}
      />

      <ProductEditor
        initial={initial}
        fabrics={toRef(fabrics)}
        baseStyles={toRef(baseStyles)}
        collections={toRef(collections)}
      />

      {product ? (
        <div className="mt-8 border-t border-ink/12 pt-6">
          <DeleteButton
            variant="button"
            label={product.name}
            onDelete={() => deleteProduct(product.id)}
            redirectTo="/studio/products"
            description="Pieces that appear on past orders cannot be deleted — untick “Live on the site” instead."
          />
        </div>
      ) : null}
    </>
  );
}
