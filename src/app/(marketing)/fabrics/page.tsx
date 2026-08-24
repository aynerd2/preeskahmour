import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import type { FabricFamily, Occasion } from '@prisma/client';

import { FabricCard } from '@/components/catalog/fabric-card';
import { ActiveFilters, FilterRail, type FilterGroup } from '@/components/catalog/filter-rail';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState, Section } from '@/components/shared/section';
import { Reveal } from '@/components/shared/reveal';
import { Button } from '@/components/ui/button';
import {
  FABRIC_FAMILY_LABELS,
  FABRIC_FAMILY_NOTES,
  OCCASION_LABELS,
  OCCASION_ORDER,
} from '@/lib/constants';
import { getFabricColorTags, getFabrics } from '@/lib/queries';
import { titleCase } from '@/lib/utils';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Fabric library',
  description:
    'Adire from Abeokuta, aso-oke from Iseyin, Akwete from Abia, George brocade, Super 130s worsted and Irish linen. Browse the cloth and design from it.',
  alternates: { canonical: '/fabrics' },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function FabricLibraryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const familyKeys = Object.keys(FABRIC_FAMILY_LABELS) as FabricFamily[];
  const families = toArray(params.family).filter((v): v is FabricFamily =>
    familyKeys.includes(v as FabricFamily),
  );
  const occasions = toArray(params.occasion).filter((v): v is Occasion =>
    OCCASION_ORDER.includes(v as Occasion),
  );
  const colors = toArray(params.color);
  const inStockOnly = toArray(params.stock).includes('in');

  const [fabrics, colorTags] = await Promise.all([
    getFabrics({ families, occasions, colors, inStockOnly }),
    getFabricColorTags(),
  ]);

  const groups: FilterGroup[] = [
    {
      param: 'family',
      label: 'Family',
      options: familyKeys.map((f) => ({
        value: f,
        label: FABRIC_FAMILY_LABELS[f],
        hint: FABRIC_FAMILY_NOTES[f],
      })),
    },
    {
      param: 'color',
      label: 'Colour',
      options: colorTags.map((c) => ({
        value: c,
        label: titleCase(c),
        swatch: COLOR_CHIPS[c] ?? undefined,
      })),
    },
    {
      param: 'occasion',
      label: 'Suits',
      options: OCCASION_ORDER.map((o) => ({ value: o, label: OCCASION_LABELS[o] })),
    },
    {
      param: 'stock',
      label: 'Availability',
      options: [{ value: 'in', label: 'In stock now' }],
    },
  ];

  // Group the results by family so the library reads like a swatch book
  // rather than an undifferentiated wall of squares.
  const byFamily = familyKeys
    .map((family) => ({ family, items: fabrics.filter((f) => f.family === family) }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="The cloth"
        title="Fabric library"
        lede="We start here, not with a pattern. Every swatch below can be cut into any of our styles — tap one to open the builder with it already selected."
      />

      <div className="container pb-24">
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          <Suspense fallback={<div className="skeleton hidden h-96 lg:block" />}>
            <FilterRail
              groups={groups}
              resultCount={fabrics.length}
              className="lg:sticky lg:top-28 lg:self-start"
            />
          </Suspense>

          <div>
            <Suspense fallback={null}>
              <ActiveFilters groups={groups} />
            </Suspense>

            {fabrics.length === 0 ? (
              <EmptyState
                title="No cloth matches that"
                body="Loosen a filter, or tell us what you are looking for — we source to order and often have more on the shelf than is listed here."
                action={
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    <Button asChild variant="outline">
                      <Link href="/fabrics">Clear filters</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/contact">Ask us</Link>
                    </Button>
                  </div>
                }
              />
            ) : (
              <div className="space-y-16">
                {byFamily.map((group) => (
                  <section key={group.family}>
                    <div className="mb-6 border-b border-ink/10 pb-4">
                      <h2 className="font-display text-xl text-ink">
                        {FABRIC_FAMILY_LABELS[group.family]}
                      </h2>
                      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
                        {FABRIC_FAMILY_NOTES[group.family]}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
                      {group.items.map((fabric, i) => (
                        <Reveal key={fabric.id} delay={Math.min(i * 50, 250)}>
                          <FabricCard fabric={fabric} href={`/fabrics/${fabric.slug}`} />
                        </Reveal>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Own-cloth note — a genuinely common request in this market. */}
      <Section size="sm" className="motif-asooke border-t border-ink/10 bg-cream/50">
        <div className="container max-w-3xl text-center">
          <h2 className="text-display-sm text-ink">Sending us your own cloth?</h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.98rem] leading-relaxed text-ink-muted">
            Aso-oke from a family weaver, lace bought for a specific occasion, a length someone
            brought back for you — we cut customers&rsquo; own cloth regularly. Talk to us first so
            we can confirm the yardage your chosen style needs, and we deduct the fabric cost from
            your price.
          </p>
          <Button asChild variant="outline" className="mt-7">
            <Link href="/contact?topic=Fabric">Ask about your cloth</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}

/**
 * Colour chips for the filter. Only covers the tags actually used in the
 * catalogue; anything unmapped simply renders without a swatch.
 */
const COLOR_CHIPS: Record<string, string> = {
  indigo: '#23335C',
  blue: '#2F4A7A',
  navy: '#22304F',
  green: '#126B57',
  emerald: '#0B4D3F',
  olive: '#6B7355',
  gold: '#C6A15B',
  bronze: '#8C6B3F',
  brown: '#6B4A2F',
  beige: '#D8C6A8',
  cream: '#F2EADD',
  ivory: '#F0E7D8',
  white: '#FBF8F3',
  black: '#14110F',
  grey: '#7A7A7C',
  charcoal: '#33363B',
  red: '#8A2B2B',
  crimson: '#9B2233',
  wine: '#5C1F33',
  purple: '#4A2B4F',
  orange: '#C1662F',
  terracotta: '#B45A3C',
};
