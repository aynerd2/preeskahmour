import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { FabricCard } from '@/components/catalog/fabric-card';
import { ProductCard } from '@/components/catalog/product-card';
import { Breadcrumbs } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { Section, SectionHeading } from '@/components/shared/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FABRIC_FAMILY_LABELS,
  FABRIC_FAMILY_NOTES,
  FABRIC_WEIGHT_LABELS,
  OCCASION_LABELS,
} from '@/lib/constants';
import { getFabricBySlug, getFabrics, getProducts } from '@/lib/queries';
import { fabricImage } from '@/lib/swatches';
import { formatMoney } from '@/lib/utils';

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const fabric = await getFabricBySlug(slug);
  if (!fabric) return { title: 'Cloth not found' };

  return {
    title: fabric.name,
    description:
      fabric.description ??
      `${FABRIC_FAMILY_LABELS[fabric.family]} in ${fabric.colorName}${fabric.origin ? `, from ${fabric.origin}` : ''}. Cut to measure by Preeskahmour.`,
    alternates: { canonical: `/fabrics/${fabric.slug}` },
  };
}

export default async function FabricDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const fabric = await getFabricBySlug(slug);
  if (!fabric) notFound();

  const [related, madeFrom] = await Promise.all([
    getFabrics({ families: [fabric.family], take: 5 }),
    getProducts({ take: 8 }),
  ]);

  const siblings = related.filter((f) => f.id !== fabric.id).slice(0, 4);
  const inThisCloth = madeFrom.filter((p) => p.fabric?.name === fabric.name).slice(0, 4);
  const swatch = fabricImage(fabric);

  return (
    <>
      <div className="container pt-10 sm:pt-12">
        <Breadcrumbs
          items={[
            { label: 'Fabrics', href: '/fabrics' },
            {
              label: FABRIC_FAMILY_LABELS[fabric.family],
              href: `/fabrics?family=${fabric.family}`,
            },
            { label: fabric.name },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Swatch */}
          <div className="space-y-4">
            <div
              className="aspect-square w-full bg-cover bg-center"
              style={{ backgroundImage: `url("${swatch}")` }}
              role="img"
              aria-label={`${fabric.name} swatch — ${fabric.colorName}`}
            />
            {fabric.detailImage ? (
              <div className="relative aspect-[7/5] w-full overflow-hidden bg-cream">
                <Image
                  src={fabric.detailImage}
                  alt={`${fabric.name} made up into a garment`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            {!fabric.swatchImage ? (
              // Honesty note: the square above is a generated stand-in until a
              // real photograph is uploaded through /studio.
              <p className="border border-dashed border-ink/20 px-4 py-3 text-xs leading-relaxed text-ink-faint">
                This swatch is an illustration of the weave, not a photograph of the cloth. A
                colour-accurate shot is coming — ask us for a physical sample in the meantime.
              </p>
            ) : null}
          </div>

          {/* Detail */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-wrap gap-2">
              <Badge variant="emerald">{FABRIC_FAMILY_LABELS[fabric.family]}</Badge>
              <Badge>{FABRIC_WEIGHT_LABELS[fabric.weight]}</Badge>
              {fabric.inStock ? null : <Badge variant="terracotta">Out of stock</Badge>}
            </div>

            <h1 className="mt-5 text-display-md text-ink">{fabric.name}</h1>
            <p className="mt-2 text-[1.02rem] text-ink-muted">{fabric.colorName}</p>

            <p className="mt-6 font-display text-2xl text-ink">
              {formatMoney(fabric.pricePerMeterKobo)}
              <span className="ml-1 font-sans text-sm text-ink-faint">per metre</span>
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              A two-piece takes about 3.4m. Cloth cost is included in the price the builder quotes.
            </p>

            {fabric.description ? (
              <p className="mt-7 text-[0.98rem] leading-relaxed text-ink">{fabric.description}</p>
            ) : null}

            <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-muted">
              {FABRIC_FAMILY_NOTES[fabric.family]}
            </p>

            {fabric.artisanNote ? (
              <blockquote className="mt-6 border-l-2 border-gold py-1 pl-5 text-[0.98rem] leading-relaxed text-ink">
                {fabric.artisanNote}
              </blockquote>
            ) : null}

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-ink/10 py-7">
              <Spec label="Family" value={FABRIC_FAMILY_LABELS[fabric.family]} />
              <Spec label="Handle" value={FABRIC_WEIGHT_LABELS[fabric.weight]} />
              {fabric.composition ? <Spec label="Composition" value={fabric.composition} /> : null}
              {fabric.gsm ? <Spec label="Weight" value={`${fabric.gsm} gsm`} /> : null}
              {fabric.widthCm ? <Spec label="Width" value={`${fabric.widthCm} cm`} /> : null}
              {fabric.origin ? <Spec label="Made in" value={fabric.origin} /> : null}
            </dl>

            {fabric.occasions.length > 0 ? (
              <div className="mt-6">
                <p className="eyebrow mb-3">Cuts well for</p>
                <div className="flex flex-wrap gap-2">
                  {fabric.occasions.map((occasion) => (
                    <Link key={occasion} href={`/shop?occasion=${occasion}`}>
                      <Badge variant="outline">{OCCASION_LABELS[occasion]}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 space-y-3">
              <Button asChild full size="lg" disabled={!fabric.inStock}>
                <Link href={`/builder?fabric=${fabric.slug}`}>
                  {fabric.inStock ? 'Design with this cloth' : 'Currently out of stock'}
                </Link>
              </Button>
              <Button asChild full size="lg" variant="outline">
                <Link href={`/contact?topic=Fabric`}>Request a physical sample</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {inThisCloth.length > 0 ? (
        <Section className="container" size="md">
          <SectionHeading eyebrow="Already cut in this" title={`Made in ${fabric.name}`} />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {inThisCloth.map((product, i) => (
              <Reveal key={product.id} delay={i * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {siblings.length > 0 ? (
        <Section className="container" size="sm">
          <SectionHeading
            eyebrow="More of the same family"
            title={`Other ${FABRIC_FAMILY_LABELS[fabric.family]}`}
            link={{ label: 'The whole library', href: '/fabrics' }}
          />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-5">
            {siblings.map((item, i) => (
              <Reveal key={item.id} delay={i * 60}>
                <FabricCard fabric={item} href={`/fabrics/${item.slug}`} />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}
