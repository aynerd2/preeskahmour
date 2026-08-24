import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Ruler, Scissors, Truck } from 'lucide-react';

import { ProductGallery } from '@/components/catalog/product-gallery';
import { ProductCard } from '@/components/catalog/product-card';
import { AddToCartButton } from '@/components/cart/add-to-cart';
import { Breadcrumbs } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { Section, SectionHeading } from '@/components/shared/section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FABRIC_FAMILY_LABELS,
  FABRIC_FAMILY_NOTES,
  OCCASION_LABELS,
} from '@/lib/constants';
import { getProductBySlug, getRelatedProducts } from '@/lib/queries';
import { fabricImage } from '@/lib/swatches';
import { absoluteUrl, formatMoney } from '@/lib/utils';

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Piece not found' };

  const title = product.seoTitle ?? product.name;
  const description =
    product.seoDescription ?? product.subtitle ?? product.description?.slice(0, 155) ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      type: 'website',
      title,
      description: description ?? undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const hero = product.images[0];

  // Product structured data, so the piece can surface correctly in search.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.subtitle ?? product.description ?? undefined,
    image: product.images.map((i) => absoluteUrl(i.url)),
    brand: { '@type': 'Brand', name: 'Preeskahmour' },
    material: product.fabric?.name,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NGN',
      price: (product.priceKobo / 100).toFixed(2),
      availability: 'https://schema.org/MadeToOrder',
      url: absoluteUrl(`/shop/${product.slug}`),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container pt-10 sm:pt-12">
        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/shop' },
            {
              label: OCCASION_LABELS[product.occasion],
              href: `/shop?occasion=${product.occasion}`,
            },
            { label: product.name },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />

          {/* Buy column */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-wrap gap-2">
              <Badge variant="emerald">{OCCASION_LABELS[product.occasion]}</Badge>
              {product.isMadeToMeasure ? <Badge variant="gold">Made to measure</Badge> : null}
              {product.collection ? <Badge>{product.collection.name}</Badge> : null}
            </div>

            <h1 className="mt-5 text-display-md text-ink">{product.name}</h1>
            {product.subtitle ? (
              <p className="mt-2 text-[1.02rem] text-ink-muted">{product.subtitle}</p>
            ) : null}

            <div className="mt-6 flex items-baseline gap-3">
              <p className="font-display text-2xl text-ink">{formatMoney(product.priceKobo)}</p>
              {product.compareAtKobo && product.compareAtKobo > product.priceKobo ? (
                <p className="text-sm text-ink-faint line-through">
                  {formatMoney(product.compareAtKobo)}
                </p>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-ink-faint">
              Price includes cloth, cutting, two fittings and hand finishing.
            </p>

            {/* Cloth */}
            {product.fabric ? (
              <Link
                href={`/fabrics/${product.fabric.slug}`}
                className="group mt-7 flex items-center gap-4 border border-ink/12 p-3 transition-colors hover:border-ink/35"
              >
                <span
                  className="h-14 w-14 shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: `url("${fabricImage(product.fabric)}")` }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                    Cut from
                  </span>
                  <span className="block truncate font-display text-[1.05rem] text-ink">
                    {product.fabric.name}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">
                    {FABRIC_FAMILY_LABELS[product.fabric.family]}
                    {product.fabric.origin ? ` · ${product.fabric.origin}` : ''}
                  </span>
                </span>
              </Link>
            ) : null}

            <div className="mt-7 space-y-3">
              <AddToCartButton
                item={{
                  kind: 'PRODUCT',
                  productId: product.id,
                  name: product.name,
                  descriptor: [product.fabric?.name, product.silhouette]
                    .filter(Boolean)
                    .join(' · '),
                  imageUrl: hero?.url,
                  unitPriceKobo: product.priceKobo,
                  href: `/shop/${product.slug}`,
                }}
                label="Add to bag — as shown"
              />

              <Button asChild full size="lg" variant="outline">
                <Link href={`/builder?product=${product.slug}`}>Customise this</Link>
              </Button>

              <p className="pt-1 text-center text-xs leading-relaxed text-ink-muted">
                Adding it as shown uses this cut and cloth. Customising opens the builder with
                everything here pre-selected, ready for you to change.
              </p>
            </div>

            {/* Reassurance */}
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-ink/10 py-6">
              <Assurance icon={<Ruler className="h-4 w-4" />} label="Cut to your measurements" />
              <Assurance
                icon={<Clock className="h-4 w-4" />}
                label={`${product.leadTimeDays} days in the atelier`}
              />
              <Assurance icon={<Scissors className="h-4 w-4" />} label="First alteration free" />
              <Assurance icon={<Truck className="h-4 w-4" />} label="Worldwide delivery" />
            </ul>

            {/* Detail */}
            <Accordion type="single" collapsible className="mt-2" defaultValue="detail">
              <AccordionItem value="detail">
                <AccordionTrigger>The piece</AccordionTrigger>
                <AccordionContent>
                  <p>{product.description}</p>
                  {product.storyNote ? (
                    <p className="mt-4 border-l-2 border-gold pl-4 italic text-ink">
                      {product.storyNote}
                    </p>
                  ) : null}
                </AccordionContent>
              </AccordionItem>

              {product.fabric ? (
                <AccordionItem value="cloth">
                  <AccordionTrigger>The cloth</AccordionTrigger>
                  <AccordionContent>
                    <p>{FABRIC_FAMILY_NOTES[product.fabric.family]}</p>
                    {product.fabric.artisanNote ? (
                      <p className="mt-3">{product.fabric.artisanNote}</p>
                    ) : null}
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      {product.fabric.composition ? (
                        <div>
                          <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
                            Composition
                          </dt>
                          <dd className="mt-0.5 text-ink">{product.fabric.composition}</dd>
                        </div>
                      ) : null}
                      {product.fabric.gsm ? (
                        <div>
                          <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
                            Weight
                          </dt>
                          <dd className="mt-0.5 text-ink">{product.fabric.gsm} gsm</dd>
                        </div>
                      ) : null}
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              ) : null}

              <AccordionItem value="fit">
                <AccordionTrigger>Measurements &amp; fit</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Every piece is cut to a pattern drafted for one person — there are no sizes to
                    choose between. After you order we collect your measurements, either from a
                    saved profile or through our guided form, and confirm anything we are unsure
                    about before cutting.
                  </p>
                  <Link href="/measurement-guide" className="link-underline mt-3 inline-block text-ink">
                    How to measure yourself
                  </Link>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="care">
                <AccordionTrigger>Delivery, alterations &amp; care</AccordionTrigger>
                <AccordionContent>
                  <p>
                    {product.leadTimeDays} days in the atelier, then 2–4 days within Nigeria or
                    5–10 days internationally. Your first alteration is free within 21 days of
                    delivery — send it back and we correct it at our cost.
                  </p>
                  <Link href="/returns" className="link-underline mt-3 inline-block text-ink">
                    Full alterations, returns &amp; care
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <Section className="container" size="md">
          <SectionHeading
            eyebrow="Also cut this season"
            title="You might also like"
            link={{ label: 'All pieces', href: '/shop' }}
          />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {related.map((item, i) => (
              <Reveal key={item.id} delay={i * 60}>
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}

function Assurance({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-xs text-ink-muted">
      <span className="shrink-0 text-gold-deep" aria-hidden>
        {icon}
      </span>
      {label}
    </li>
  );
}
