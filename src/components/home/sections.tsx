import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check, Instagram, Quote } from 'lucide-react';
import type { HomeTile, Testimonial } from '@prisma/client';

import { Reveal } from '@/components/shared/reveal';
import { SectionHeading, Section, GoldRule } from '@/components/shared/section';
import { FabricCard } from '@/components/catalog/fabric-card';
import { Button } from '@/components/ui/button';
import type { FabricCard as FabricCardData } from '@/lib/queries';
import type { SiteContent } from '@/lib/site-content';
import { OCCASION_BLURBS } from '@/lib/constants';

/** A ticker of house claims. Purely decorative, hidden from screen readers. */
export function Marquee({ content }: { content: SiteContent['home.marquee'] }) {
  if (!content.enabled || content.items.length === 0) return null;
  const doubled = [...content.items, ...content.items];

  return (
    <div className="overflow-hidden border-y border-ink/10 bg-cream py-3.5" aria-hidden>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap motion-reduce:animate-none">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-10 text-[0.66rem] uppercase tracking-[0.22em] text-ink-muted"
          >
            {item}
            <span className="h-1 w-1 rotate-45 bg-gold" />
          </span>
        ))}
      </div>
    </div>
  );
}

/** The five occasion tiles — editable rows, so a category can be retired. */
export function OccasionTiles({
  tiles,
  content,
}: {
  tiles: HomeTile[];
  content: SiteContent['home.tilesIntro'];
}) {
  if (tiles.length === 0) return null;

  return (
    <Section id="occasions" className="container">
      <SectionHeading eyebrow={content.eyebrow} title={content.headline} body={content.body} />

      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-5 lg:gap-x-5">
        {tiles.map((tile, i) => (
          <Reveal key={tile.id} delay={i * 70} as="article">
            <Link href={tile.href} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                {tile.imageUrl ? (
                  <Image
                    src={tile.imageUrl}
                    alt={tile.label}
                    fill
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
                  />
                ) : (
                  <div className="motif-diamond h-full w-full" />
                )}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden
                />
                <h3 className="absolute bottom-4 left-4 right-4 font-display text-xl text-ivory">
                  {tile.label}
                </h3>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                {tile.subtitle ?? (tile.occasion ? OCCASION_BLURBS[tile.occasion] : null)}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/** Fabric spotlight — a horizontally scrolling rail of the featured cloth. */
export function FabricStrip({
  fabrics,
  content,
}: {
  fabrics: FabricCardData[];
  content: SiteContent['home.fabricStrip'];
}) {
  if (fabrics.length === 0) return null;

  return (
    <Section className="motif-adire border-y border-ink/10 bg-cream/50">
      <div className="container">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.headline}
          body={content.body}
          link={{ label: content.ctaLabel, href: content.ctaHref }}
        />
      </div>

      {/* Rail overflows the container deliberately — it should run off-screen. */}
      <div className="hide-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:gap-5 sm:px-6 lg:px-10">
        {fabrics.map((fabric, i) => (
          <Reveal
            key={fabric.id}
            delay={Math.min(i * 60, 300)}
            className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[19%]"
          >
            <FabricCard fabric={fabric} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/** Founder story teaser with the three house numbers. */
export function StoryTeaser({ content }: { content: SiteContent['home.storyTeaser'] }) {
  return (
    <Section className="container">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/5] overflow-hidden bg-cream">
            <Image
              src={content.image.url}
              alt={content.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {/* Gold rule bleeding off the image corner — a house detail. */}
          <span className="absolute -bottom-3 -right-3 hidden h-24 w-24 border-b border-r border-gold lg:block" aria-hidden />
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.headline}
            body={content.body}
          />

          <Reveal delay={120}>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-ink/10 py-7">
              {content.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-2xl text-emerald sm:text-3xl">{stat.value}</dd>
                  <p className="mt-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </dl>

            <Button asChild variant="outline" size="lg" className="mt-8">
              <Link href={content.ctaHref}>{content.ctaLabel}</Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/** Dark band promoting the configurator. */
export function BuilderPromo({ content }: { content: SiteContent['home.builderPromo'] }) {
  return (
    <Section size="lg" className="bg-emerald-deep text-ivory">
      <div className="container grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.headline}
            body={content.body}
            tone="ivory"
          />

          <Reveal delay={120}>
            <ul className="mt-9 space-y-3.5">
              {content.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-[0.95rem] text-ivory/75">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                  {bullet}
                </li>
              ))}
            </ul>

            <Button asChild size="lg" variant="gold" className="mt-9">
              <Link href={content.ctaHref}>{content.ctaLabel}</Link>
            </Button>
          </Reveal>
        </div>

        <Reveal delay={80} className="relative aspect-[7/5] overflow-hidden">
          <Image
            src={content.image.url}
            alt={content.image.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </Section>
  );
}

/** Client quotes. */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <Section className="container">
      <SectionHeading eyebrow="In their words" title="Worn by" align="center" />

      <div className="mt-12 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.slice(0, 3).map((testimonial, i) => (
          <Reveal
            key={testimonial.id}
            delay={i * 90}
            as="article"
            className="flex flex-col gap-5 bg-background p-7 sm:p-9"
          >
            <Quote className="h-5 w-5 text-gold" aria-hidden />

            <blockquote className="flex-1 font-display text-[1.15rem] leading-relaxed text-ink">
              {testimonial.quote}
            </blockquote>

            <footer className="flex items-center gap-3 pt-2">
              {testimonial.imageUrl ? (
                <Image
                  src={testimonial.imageUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-wash font-display text-sm text-emerald">
                  {testimonial.authorName.charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">{testimonial.authorName}</p>
                <p className="truncate text-[0.68rem] uppercase tracking-[0.12em] text-ink-faint">
                  {[testimonial.authorRole, testimonial.location].filter(Boolean).join(' · ')}
                </p>
              </div>
            </footer>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/**
 * Static Instagram grid.
 *
 * Deliberately NOT the live Instagram Basic Display API: that needs a
 * long-lived token that silently expires every 60 days and would break the
 * homepage without warning. Prisca pastes six image URLs in /studio instead.
 */
export function InstagramStrip({ content }: { content: SiteContent['home.instagram'] }) {
  if (content.images.length === 0) return null;

  return (
    <Section size="sm" className="border-t border-ink/10">
      <div className="container">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-display-sm text-ink">{content.headline}</h2>
          <a
            href={content.url}
            target="_blank"
            rel="noreferrer noopener"
            className="link-underline inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted"
          >
            <Instagram className="h-4 w-4" aria-hidden />
            {content.handle}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-px bg-ink/10 lg:grid-cols-6">
        {content.images.map((image, i) => (
          <a
            key={`${image.url}-${i}`}
            href={content.url}
            target="_blank"
            rel="noreferrer noopener"
            className="group relative aspect-square overflow-hidden bg-cream"
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-110"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/35">
              <Instagram className="h-5 w-5 text-ivory opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
            </span>
          </a>
        ))}
      </div>
    </Section>
  );
}

export { GoldRule };
