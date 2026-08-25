import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import type { FabricFamily, Occasion } from '@prisma/client';

import { ProductCard } from '@/components/catalog/product-card';
import { ActiveFilters, FilterRail, type FilterGroup } from '@/components/catalog/filter-rail';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/section';
import { Reveal } from '@/components/shared/reveal';
import { Button } from '@/components/ui/button';
import {
  FABRIC_FAMILY_LABELS,
  OCCASION_BLURBS,
  OCCASION_LABELS,
  OCCASION_ORDER,
} from '@/lib/constants';
import { getProducts, getSilhouettes, type ProductSort } from '@/lib/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Made-to-measure suiting in Ankara, aso-oke, adire, Akwete, George, wool and linen. Filter by occasion, silhouette and cloth.',
  alternates: { canonical: '/shop' },
};

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const occasions = toArray(params.occasion).filter((v): v is Occasion =>
    OCCASION_ORDER.includes(v as Occasion),
  );
  const families = toArray(params.family).filter((v): v is FabricFamily =>
    Object.keys(FABRIC_FAMILY_LABELS).includes(v),
  );
  const silhouettes = toArray(params.silhouette);
  const sort = (SORT_OPTIONS.some((o) => o.value === params.sort)
    ? params.sort
    : 'featured') as ProductSort;

  const [products, allSilhouettes] = await Promise.all([
    getProducts({ occasions, families, silhouettes, sort }),
    getSilhouettes(),
  ]);

  const groups: FilterGroup[] = [
    {
      param: 'occasion',
      label: 'Occasion',
      options: OCCASION_ORDER.map((o) => ({
        value: o,
        label: OCCASION_LABELS[o],
        hint: OCCASION_BLURBS[o],
      })),
    },
    {
      param: 'family',
      label: 'Cloth',
      options: (Object.keys(FABRIC_FAMILY_LABELS) as FabricFamily[]).map((f) => ({
        value: f,
        label: FABRIC_FAMILY_LABELS[f],
      })),
    },
    {
      param: 'silhouette',
      label: 'Silhouette',
      options: allSilhouettes.map((s) => ({ value: s, label: s })),
    },
  ];

  // When exactly one occasion is selected, lead with its own copy rather than
  // the generic shop introduction.
  const singleOccasion = occasions.length === 1 ? occasions[0] : null;

  return (
    <>
      <PageHeader
        eyebrow="The shop"
        title={singleOccasion ? OCCASION_LABELS[singleOccasion] : 'Every piece, made to measure'}
        lede={
          singleOccasion
            ? OCCASION_BLURBS[singleOccasion]
            : 'Nothing here comes in a size. Start from a piece you like and change the cloth, the lapel, the pockets and the lining — or design one from nothing.'
        }
      />

      <div className="container pb-24">
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[210px_minmax(0,1fr)]">
          <Suspense fallback={<div className="skeleton hidden h-96 lg:block" />}>
            <FilterRail
              groups={groups}
              sort={{ param: 'sort', options: SORT_OPTIONS, defaultValue: 'featured' }}
              resultCount={products.length}
              className="lg:sticky lg:top-28 lg:self-start"
            />
          </Suspense>

          <div>
            <Suspense fallback={null}>
              <ActiveFilters groups={groups} />
            </Suspense>

            {products.length === 0 ? (
              <EmptyState
                title="Nothing matches that combination"
                body="Try loosening a filter — or skip the shop entirely and design exactly what you are looking for."
                action={
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    <Button asChild variant="outline">
                      <Link href="/shop">Clear filters</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/builder">Design your suit</Link>
                    </Button>
                  </div>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-14">
                {products.map((product, i) => (
                  <Reveal key={product.id} delay={Math.min(i * 50, 250)}>
                    <ProductCard product={product} priority={i < 3} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
