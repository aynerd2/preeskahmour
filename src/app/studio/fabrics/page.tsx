import Link from 'next/link';

import { FabricRowActions } from '@/components/studio/row-actions';
import { Pill, StudioHeader, StudioTable } from '@/components/studio/studio-ui';
import { Button } from '@/components/ui/button';
import { prisma, safeQuery } from '@/lib/prisma';
import { FABRIC_FAMILY_LABELS } from '@/lib/constants';
import { fabricImage } from '@/lib/swatches';
import { formatMoney } from '@/lib/utils';

export const metadata = { title: 'Fabrics' };

export default async function StudioFabricsPage() {
  const fabrics = await safeQuery(
    () =>
      prisma.fabric.findMany({
        orderBy: [{ family: 'asc' }, { sortOrder: 'asc' }],
        include: { _count: { select: { products: true, customDesigns: true } } },
      }),
    [],
  );

  return (
    <>
      <StudioHeader
        title="Fabrics"
        description="The cloth library. Everything here appears in the fabric library and inside the builder. Upload a real swatch photograph against a fabric and it replaces the generated pattern everywhere at once."
        action={{ label: 'New fabric', href: '/studio/fabrics/new' }}
      />

      <StudioTable
        rows={fabrics}
        href={(fabric) => `/studio/fabrics/${fabric.id}`}
        empty={{
          title: 'No fabrics yet',
          body: 'The builder needs at least one cloth before anyone can design a suit.',
          action: (
            <Button asChild>
              <Link href="/studio/fabrics/new">Add the first fabric</Link>
            </Button>
          ),
        }}
        columns={[
          {
            key: 'name',
            header: 'Fabric',
            render: (fabric) => (
              <div className="flex items-center gap-3">
                <span
                  className="h-10 w-10 shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: `url("${fabricImage(fabric)}")` }}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate text-ink">{fabric.name}</span>
                  <span className="block truncate text-xs text-ink-faint">{fabric.colorName}</span>
                </span>
              </div>
            ),
          },
          {
            key: 'family',
            header: 'Family',
            hideOnMobile: true,
            render: (fabric) => (
              <span className="text-xs text-ink-muted">{FABRIC_FAMILY_LABELS[fabric.family]}</span>
            ),
          },
          {
            key: 'price',
            header: 'Per metre',
            render: (fabric) => (
              <span className="tabular-nums text-ink">
                {formatMoney(fabric.pricePerMeterKobo)}
              </span>
            ),
          },
          {
            key: 'used',
            header: 'In use',
            hideOnMobile: true,
            render: (fabric) => (
              <span className="text-xs text-ink-faint">
                {fabric._count.products} products · {fabric._count.customDesigns} designs
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (fabric) => (
              <div className="flex flex-wrap gap-1.5">
                <Pill tone={fabric.inStock ? 'good' : 'bad'}>
                  {fabric.inStock ? 'In stock' : 'Out'}
                </Pill>
                {fabric.isFeatured ? <Pill tone="warn">Featured</Pill> : null}
                {!fabric.swatchImage ? <Pill tone="info">No photo</Pill> : null}
              </div>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-24 text-right',
            render: (fabric) => (
              <FabricRowActions
                id={fabric.id}
                name={fabric.name}
                inStock={fabric.inStock}
                inUse={fabric._count.products + fabric._count.customDesigns > 0}
              />
            ),
          },
        ]}
      />
    </>
  );
}
