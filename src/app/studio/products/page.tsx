import Image from 'next/image';
import Link from 'next/link';

import { ProductRowActions } from '@/components/studio/row-actions';
import { Pill, StudioHeader, StudioTable } from '@/components/studio/studio-ui';
import { Button } from '@/components/ui/button';
import { prisma, safeQuery } from '@/lib/prisma';
import { OCCASION_LABELS } from '@/lib/constants';
import { formatMoney } from '@/lib/utils';

export const metadata = { title: 'Products' };

export default async function StudioProductsPage() {
  const products = await safeQuery(
    () =>
      prisma.product.findMany({
        orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }],
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          fabric: { select: { name: true } },
          collection: { select: { name: true } },
        },
      }),
    [],
  );

  return (
    <>
      <StudioHeader
        title="Products"
        description="Everything in the shop. Each piece links to a cut and a cloth, which is what the “Customise this” button pre-selects in the builder."
        action={{ label: 'New product', href: '/studio/products/new' }}
      />

      <StudioTable
        rows={products}
        href={(product) => `/studio/products/${product.id}`}
        empty={{
          title: 'No products yet',
          body: 'The shop is empty. Customers can still design from scratch in the builder.',
          action: (
            <Button asChild>
              <Link href="/studio/products/new">Add the first product</Link>
            </Button>
          ),
        }}
        columns={[
          {
            key: 'name',
            header: 'Product',
            render: (product) => (
              <div className="flex items-center gap-3">
                <span className="relative h-12 w-9 shrink-0 overflow-hidden bg-cream">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-ink">{product.name}</span>
                  <span className="block truncate text-xs text-ink-faint">
                    {product.fabric?.name ?? 'No cloth linked'}
                  </span>
                </span>
              </div>
            ),
          },
          {
            key: 'occasion',
            header: 'Occasion',
            hideOnMobile: true,
            render: (product) => (
              <span className="text-xs text-ink-muted">
                {OCCASION_LABELS[product.occasion]}
                {product.collection ? ` · ${product.collection.name}` : ''}
              </span>
            ),
          },
          {
            key: 'price',
            header: 'Price',
            render: (product) => (
              <span className="tabular-nums text-ink">{formatMoney(product.priceKobo)}</span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (product) => (
              <div className="flex flex-wrap gap-1.5">
                <Pill tone={product.isActive ? 'good' : 'neutral'}>
                  {product.isActive ? 'Live' : 'Hidden'}
                </Pill>
                {product.isFeatured ? <Pill tone="warn">Featured</Pill> : null}
                {product.images[0]?.url.startsWith('/placeholders/') ? (
                  <Pill tone="info">Placeholder</Pill>
                ) : null}
              </div>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-16 text-right',
            render: (product) => <ProductRowActions id={product.id} name={product.name} />,
          },
        ]}
      />
    </>
  );
}
