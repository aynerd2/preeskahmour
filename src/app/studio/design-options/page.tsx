import Link from 'next/link';

import { DesignOptionRowActions } from '@/components/studio/row-actions';
import { Pill, StudioHeader, StudioTable } from '@/components/studio/studio-ui';
import { Button } from '@/components/ui/button';
import { prisma, safeQuery } from '@/lib/prisma';
import { DESIGN_CATEGORY_LABELS } from '@/lib/constants';
import { formatMoney } from '@/lib/utils';

export const metadata = { title: 'Design options' };

export default async function StudioDesignOptionsPage() {
  const options = await safeQuery(
    () =>
      prisma.designOption.findMany({
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        include: {
          baseStyle: { select: { name: true } },
          _count: { select: { selections: true } },
        },
      }),
    [],
  );

  return (
    <>
      <StudioHeader
        title="Design options"
        description="Everything selectable in step three of the builder — lapels, closures, buttons, pockets, sleeves, linings and trim. The price shown here is what the option adds."
        action={{ label: 'New option', href: '/studio/design-options/new' }}
      />

      <StudioTable
        rows={options}
        href={(option) => `/studio/design-options/${option.id}`}
        empty={{
          title: 'No design options yet',
          body: 'Without these, the builder skips straight from cloth to fit.',
          action: (
            <Button asChild>
              <Link href="/studio/design-options/new">Add an option</Link>
            </Button>
          ),
        }}
        columns={[
          {
            key: 'name',
            header: 'Option',
            render: (option) => (
              <div className="flex items-center gap-3">
                {option.colorHex ? (
                  <span
                    className="h-6 w-6 shrink-0 border border-ink/15"
                    style={{ backgroundColor: option.colorHex }}
                    aria-hidden
                  />
                ) : null}
                <span className="min-w-0">
                  <span className="block truncate text-ink">{option.name}</span>
                  <span className="block truncate font-mono text-[0.66rem] text-ink-faint">
                    {option.slug}
                  </span>
                </span>
              </div>
            ),
          },
          {
            key: 'category',
            header: 'Category',
            render: (option) => (
              <span className="text-xs text-ink-muted">
                {DESIGN_CATEGORY_LABELS[option.category]}
              </span>
            ),
          },
          {
            key: 'price',
            header: 'Adds',
            render: (option) => (
              <span className="tabular-nums text-ink">
                {option.priceModifierKobo > 0 ? `+${formatMoney(option.priceModifierKobo)}` : '—'}
              </span>
            ),
          },
          {
            key: 'scope',
            header: 'Scope',
            hideOnMobile: true,
            render: (option) => (
              <span className="text-xs text-ink-muted">
                {option.baseStyle?.name ?? 'Every cut'}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (option) => (
              <div className="flex flex-wrap gap-1.5">
                <Pill tone={option.isActive ? 'good' : 'neutral'}>
                  {option.isActive ? 'Live' : 'Hidden'}
                </Pill>
                {option.isDefault ? <Pill tone="warn">Default</Pill> : null}
              </div>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-16 text-right',
            render: (option) => <DesignOptionRowActions id={option.id} name={option.name} />,
          },
        ]}
      />
    </>
  );
}
