import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { FABRIC_FAMILY_LABELS, FABRIC_WEIGHT_LABELS } from '@/lib/constants';
import { fabricImage } from '@/lib/swatches';
import { cn, formatMoney } from '@/lib/utils';
import type { FabricCard as FabricCardData } from '@/lib/queries';

/**
 * A swatch in the fabric library.
 *
 * The whole card is a link into the builder with this cloth pre-selected —
 * fabric-first shopping is the point of the house, so browsing cloth should
 * never dead-end on a page with nothing to do.
 */
export function FabricCard({
  fabric,
  className,
  href,
}: {
  fabric: FabricCardData;
  className?: string;
  href?: string;
}) {
  const image = fabricImage(fabric);

  return (
    <article className={cn('group flex flex-col', className)}>
      <Link
        href={href ?? `/builder?fabric=${fabric.slug}`}
        className="flex flex-col focus-visible:outline-offset-4"
        aria-label={`Design with ${fabric.name}`}
      >
        <div className="relative aspect-square overflow-hidden bg-cream">
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-700 ease-editorial group-hover:scale-[1.06]"
            style={{ backgroundImage: `url("${image}")` }}
            role="img"
            aria-label={`${fabric.name} — ${fabric.colorName} ${FABRIC_FAMILY_LABELS[fabric.family]}`}
          />

          {!fabric.inStock ? (
            <div className="absolute inset-0 flex items-center justify-center bg-ivory/80">
              <span className="border border-ink/25 bg-ivory px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-ink-muted">
                Out of stock
              </span>
            </div>
          ) : null}

          {/* Hover affordance — hidden from touch, where hover never fires. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-2 bg-gradient-to-t from-ink/70 to-transparent p-4 opacity-0 transition-all duration-500 ease-editorial group-hover:translate-y-0 group-hover:opacity-100 lg:block">
            <span className="text-[0.62rem] uppercase tracking-[0.18em] text-ivory">
              Design with this cloth
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pt-3.5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-[1.02rem] leading-snug text-ink">{fabric.name}</h3>
            <span className="shrink-0 text-xs tabular-nums text-ink-muted">
              {formatMoney(fabric.pricePerMeterKobo)}
              <span className="text-ink-faint">/m</span>
            </span>
          </div>

          <p className="text-xs text-ink-muted">
            {FABRIC_FAMILY_LABELS[fabric.family]} · {fabric.colorName}
          </p>

          {fabric.origin ? (
            <p className="text-[0.68rem] uppercase tracking-[0.12em] text-ink-faint">
              {fabric.origin}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

/** Compact swatch used inside the builder's fabric step and on product pages. */
export function FabricSwatch({
  fabric,
  selected,
  onSelect,
  size = 'md',
}: {
  fabric: Pick<FabricCardData, 'name' | 'family' | 'colorHex' | 'swatchImage' | 'colorName'>;
  selected?: boolean;
  onSelect?: () => void;
  size?: 'sm' | 'md';
}) {
  const image = fabricImage(fabric);
  const Tag = onSelect ? 'button' : 'div';

  return (
    <Tag
      type={onSelect ? 'button' : undefined}
      onClick={onSelect}
      className={cn(
        'relative block shrink-0 overflow-hidden border transition-all duration-300 ease-editorial',
        size === 'sm' ? 'h-10 w-10' : 'h-16 w-16',
        selected ? 'border-gold shadow-gold-ring' : 'border-ink/12 hover:border-ink/35',
      )}
      title={`${fabric.name} — ${fabric.colorName}`}
    >
      <span
        className="block h-full w-full bg-cover bg-center"
        style={{ backgroundImage: `url("${image}")` }}
      />
      <span className="sr-only">{fabric.name}</span>
    </Tag>
  );
}

export function FabricCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton aspect-square w-full" />
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );
}

/** Weight + composition line reused on the fabric detail sheet. */
export function FabricSpecs({ fabric }: { fabric: FabricCardData }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
      <Spec label="Family" value={FABRIC_FAMILY_LABELS[fabric.family]} />
      <Spec label="Weight" value={FABRIC_WEIGHT_LABELS[fabric.weight]} />
      {fabric.composition ? <Spec label="Composition" value={fabric.composition} /> : null}
      {fabric.gsm ? <Spec label="Weight" value={`${fabric.gsm} gsm`} /> : null}
      {fabric.widthCm ? <Spec label="Width" value={`${fabric.widthCm} cm`} /> : null}
      {fabric.origin ? <Spec label="Woven / dyed in" value={fabric.origin} /> : null}
    </dl>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}

export function FabricBadges({ fabric }: { fabric: FabricCardData }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="emerald">{FABRIC_FAMILY_LABELS[fabric.family]}</Badge>
      <Badge>{FABRIC_WEIGHT_LABELS[fabric.weight]}</Badge>
      {fabric.inStock ? null : <Badge variant="terracotta">Out of stock</Badge>}
    </div>
  );
}
