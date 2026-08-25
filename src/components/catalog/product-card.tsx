import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { OCCASION_LABELS } from '@/lib/constants';
import { fabricImage } from '@/lib/swatches';
import { cn, formatMoney } from '@/lib/utils';
import type { ProductCard as ProductCardData } from '@/lib/queries';

/**
 * Shop grid card. Two images: the still, and a "movement" frame that
 * cross-fades in on hover. On touch devices only the first is ever shown,
 * which is why the second is decorative and carries no information.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductCardData;
  priority?: boolean;
  className?: string;
}) {
  const [primary, secondary] = product.images;
  const onSale = product.compareAtKobo != null && product.compareAtKobo > product.priceKobo;

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <Link href={`/shop/${product.slug}`} className="flex flex-col">
        <div className="relative aspect-[3/4] overflow-hidden bg-cream">
          {primary ? (
            <Image
              src={primary.url}
              alt={primary.alt ?? product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-cover transition-all duration-700 ease-editorial',
                secondary ? 'group-hover:opacity-0' : 'group-hover:scale-[1.03]',
              )}
            />
          ) : (
            <div className="motif-diamond h-full w-full" />
          )}

          {secondary ? (
            <Image
              src={secondary.url}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-700 ease-editorial group-hover:opacity-100"
              aria-hidden
            />
          ) : null}

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {onSale ? <Badge variant="terracotta">Archive price</Badge> : null}
            {product.isMadeToMeasure ? <Badge variant="emerald">Made to measure</Badge> : null}
          </div>

          {/* Fabric chip — the cloth is the headline, so it sits on the image. */}
          {product.fabric ? (
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-ivory/92 py-1 pl-1 pr-2.5 backdrop-blur-sm">
              <span
                className="block h-5 w-5 shrink-0 bg-cover"
                style={{ backgroundImage: `url("${fabricImage(product.fabric)}")` }}
                aria-hidden
              />
              <span className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-muted">
                {product.fabric.name}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-[1.08rem] leading-snug text-ink">{product.name}</h3>
            <span className="shrink-0 text-sm tabular-nums text-ink">
              {formatMoney(product.priceKobo)}
            </span>
          </div>

          <p className="text-xs text-ink-muted">
            {OCCASION_LABELS[product.occasion]} · {product.silhouette}
          </p>

          {onSale ? (
            <p className="text-xs text-ink-faint line-through">
              {formatMoney(product.compareAtKobo!)}
            </p>
          ) : null}
        </div>
      </Link>

      <Link
        href={`/builder?product=${product.slug}`}
        className="mt-2 inline-flex min-h-[32px] w-fit items-center border-b border-transparent pb-0.5 text-[0.66rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:border-gold hover:text-ink"
      >
        Customise this
      </Link>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="skeleton aspect-[3/4] w-full" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}
