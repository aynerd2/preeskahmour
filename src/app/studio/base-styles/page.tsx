import Link from 'next/link';

import { BaseStyleRowActions } from '@/components/studio/row-actions';
import { Pill, StudioHeader, StudioTable } from '@/components/studio/studio-ui';
import { Button } from '@/components/ui/button';
import { prisma, safeQuery } from '@/lib/prisma';
import { FIT_LABELS } from '@/lib/constants';
import { formatMoney } from '@/lib/utils';

export const metadata = { title: 'Cuts' };

export default async function StudioBaseStylesPage() {
  const styles = await safeQuery(
    () =>
      prisma.baseStyle.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { customDesigns: true, products: true } } },
      }),
    [],
  );

  return (
    <>
      <StudioHeader
        title="Cuts"
        description="The silhouettes offered in step one of the builder. The base price is the labour; cloth is added on top from the yardage."
        action={{ label: 'New cut', href: '/studio/base-styles/new' }}
      />

      <StudioTable
        rows={styles}
        href={(style) => `/studio/base-styles/${style.id}`}
        empty={{
          title: 'No cuts yet',
          body: 'The builder cannot run without at least one cut.',
          action: (
            <Button asChild>
              <Link href="/studio/base-styles/new">Add the first cut</Link>
            </Button>
          ),
        }}
        columns={[
          {
            key: 'name',
            header: 'Cut',
            render: (style) => (
              <span className="min-w-0">
                <span className="block truncate text-ink">{style.name}</span>
                <span className="block truncate text-xs text-ink-faint">{style.tagline ?? '—'}</span>
              </span>
            ),
          },
          {
            key: 'price',
            header: 'Base price',
            render: (style) => (
              <span className="tabular-nums text-ink">{formatMoney(style.basePriceKobo)}</span>
            ),
          },
          {
            key: 'yardage',
            header: 'Cloth',
            hideOnMobile: true,
            render: (style) => (
              <span className="text-xs tabular-nums text-ink-muted">{style.yardageMeters}m</span>
            ),
          },
          {
            key: 'fits',
            header: 'Fits',
            hideOnMobile: true,
            render: (style) => (
              <span className="text-xs text-ink-muted">
                {style.supportedFits.map((fit) => FIT_LABELS[fit]).join(', ')}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (style) => (
              <div className="flex flex-wrap gap-1.5">
                <Pill tone={style.isActive ? 'good' : 'neutral'}>
                  {style.isActive ? 'Live' : 'Hidden'}
                </Pill>
                {style._count.customDesigns > 0 ? (
                  <Pill tone="info">{style._count.customDesigns} designs</Pill>
                ) : null}
              </div>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-16 text-right',
            render: (style) => <BaseStyleRowActions id={style.id} name={style.name} />,
          },
        ]}
      />
    </>
  );
}
