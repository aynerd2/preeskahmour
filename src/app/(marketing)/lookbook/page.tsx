import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { EmptyState } from '@/components/shared/section';
import { Button } from '@/components/ui/button';
import { getCollections, getLookbookImages } from '@/lib/queries';
import { cn } from '@/lib/utils';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Lookbook',
  description:
    'Season by season, cut by cut. Editorial photography from the Preeskahmour atelier in Lagos.',
  alternates: { canonical: '/lookbook' },
};

type SearchParams = Promise<{ collection?: string }>;

export default async function LookbookPage({ searchParams }: { searchParams: SearchParams }) {
  const { collection: collectionSlug } = await searchParams;

  const [images, collections] = await Promise.all([
    getLookbookImages(collectionSlug ? { collectionSlug } : undefined),
    getCollections(),
  ]);

  const active = collections.find((c) => c.slug === collectionSlug);

  return (
    <>
      <PageHeader
        eyebrow="Lookbook"
        title={active ? active.name : 'The work'}
        lede={
          active?.description ??
          'Everything below was cut for one person. Filter by collection, or just scroll.'
        }
      />

      <div className="container pb-24">
        {/* Collection filter */}
        {collections.length > 0 ? (
          <nav className="hide-scrollbar mb-10 flex gap-2 overflow-x-auto pb-1" aria-label="Collections">
            <FilterChip href="/lookbook" active={!collectionSlug}>
              All
            </FilterChip>
            {collections.map((item) => (
              <FilterChip
                key={item.id}
                href={`/lookbook?collection=${item.slug}`}
                active={collectionSlug === item.slug}
              >
                {item.name}
              </FilterChip>
            ))}
          </nav>
        ) : null}

        {images.length === 0 ? (
          <EmptyState
            title="The lookbook is being shot"
            body="Images are added from the studio as each collection is photographed. In the meantime, the shop shows what we are cutting."
            action={
              <Button asChild variant="outline" className="mt-2">
                <Link href="/shop">Browse the shop</Link>
              </Button>
            }
          />
        ) : (
          /*
           * CSS multi-column masonry rather than a JS grid library: it reflows
           * for free, needs no measurement pass, and degrades to a single
           * column on a phone. The trade-off is reading order runs down each
           * column rather than across — acceptable for a purely visual grid.
           */
          <div className="columns-2 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3 lg:gap-6">
            {images.map((image, i) => (
              <Reveal
                key={image.id}
                delay={Math.min(i * 45, 300)}
                as="article"
                className="mb-4 break-inside-avoid lg:mb-6"
              >
                <figure>
                  <div
                    className={cn(
                      'relative w-full overflow-hidden bg-cream',
                      image.spanHint === 2 && 'aspect-[3/4]',
                      image.spanHint === 3 && 'aspect-[4/3]',
                      image.spanHint === 1 && 'aspect-[3/4]',
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt ?? image.caption ?? 'Preeskahmour lookbook image'}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-editorial hover:scale-[1.03]"
                    />
                  </div>

                  {image.caption ? (
                    <figcaption className="mt-2.5 flex flex-wrap items-baseline justify-between gap-2 text-xs text-ink-muted">
                      <span>{image.caption}</span>
                      {image.collection ? (
                        <Link
                          href={`/shop?collection=${image.collection.slug}`}
                          className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint hover:text-ink"
                        >
                          {image.collection.name}
                        </Link>
                      ) : null}
                    </figcaption>
                  ) : null}
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <section className="border-t border-ink/10 py-16 sm:py-20">
        <div className="container max-w-xl text-center">
          <h2 className="text-display-sm text-ink">See something you want?</h2>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-muted">
            Almost everything here can be cut again in a different cloth. Start in the builder, or
            send us the picture and we will tell you what it takes.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/builder">Design your suit</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Send us a reference</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        'shrink-0 whitespace-nowrap border px-4 py-2 text-[0.66rem] uppercase tracking-[0.14em] transition-colors',
        active
          ? 'border-ink bg-ink text-ivory'
          : 'border-ink/20 text-ink-muted hover:border-ink hover:text-ink',
      )}
    >
      {children}
    </Link>
  );
}
