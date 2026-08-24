import Link from 'next/link';

import { HomeHero } from '@/components/home/hero';
import {
  BuilderPromo,
  FabricStrip,
  InstagramStrip,
  Marquee,
  OccasionTiles,
  StoryTeaser,
  Testimonials,
} from '@/components/home/sections';
import { ProductCard } from '@/components/catalog/product-card';
import { Reveal } from '@/components/shared/reveal';
import { Section, SectionHeading, EmptyState } from '@/components/shared/section';
import { Button } from '@/components/ui/button';
import { getContentMany } from '@/lib/site-content';
import {
  getFeaturedFabrics,
  getHomeTiles,
  getProducts,
  getTestimonials,
} from '@/lib/queries';

// The homepage is fully database-driven, so revalidate rather than caching
// forever — an edit in /studio should show up within the minute.
export const revalidate = 60;

export default async function HomePage() {
  const [content, tiles, fabrics, products, testimonials] = await Promise.all([
    getContentMany([
      'home.hero',
      'home.marquee',
      'home.tilesIntro',
      'home.fabricStrip',
      'home.storyTeaser',
      'home.builderPromo',
      'home.instagram',
    ]),
    getHomeTiles(),
    getFeaturedFabrics(8),
    getProducts({ take: 8 }),
    getTestimonials(true, 3),
  ]);

  return (
    <>
      <HomeHero content={content['home.hero']} />
      <Marquee content={content['home.marquee']} />
      <OccasionTiles tiles={tiles} content={content['home.tilesIntro']} />

      {/* Featured pieces */}
      <Section className="container" size="sm">
        <SectionHeading
          eyebrow="The shop"
          title="Ready to be made yours"
          body="Every piece here is cut to measure. Start from one of these and change whatever you like — the cloth, the lapel, the lining."
          link={{ label: 'All pieces', href: '/shop' }}
        />

        {products.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="The shop is being photographed"
            body="Pieces are added from the studio. In the meantime you can design something from scratch."
            action={
              <Button asChild variant="outline" className="mt-2">
                <Link href="/builder">Design your suit</Link>
              </Button>
            }
          />
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={Math.min(i * 60, 300)}>
                <ProductCard product={product} priority={i < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      <FabricStrip fabrics={fabrics} content={content['home.fabricStrip']} />
      <StoryTeaser content={content['home.storyTeaser']} />
      <BuilderPromo content={content['home.builderPromo']} />
      <Testimonials testimonials={testimonials} />
      <InstagramStrip content={content['home.instagram']} />
    </>
  );
}
