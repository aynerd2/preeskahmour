import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { SiteContent } from '@/lib/site-content';

/**
 * The homepage hero. Full-bleed media with the type set over the quiet third
 * of the frame (the shot brief in README-ASSETS.md asks the photographer to
 * leave that space). Accepts a still or a silent looping MP4, switched by
 * Prisca in /studio.
 */
export function HomeHero({ content }: { content: SiteContent['home.hero'] }) {
  const useVideo = content.mediaType === 'video' && Boolean(content.videoUrl);

  return (
    <section className="relative isolate -mt-16 flex min-h-[86svh] items-end overflow-hidden sm:-mt-20 sm:min-h-[92svh]">
      {useVideo ? (
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          src={content.videoUrl}
          poster={content.image.url}
          autoPlay
          muted
          loop
          playsInline
          aria-label={content.image.alt}
        />
      ) : (
        <Image
          src={content.image.url}
          alt={content.image.alt}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-10 object-cover"
        />
      )}

      {/* Scrim: heavy at the bottom where the type sits, clear at the top. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/25"
        aria-hidden
      />

      <div className="container pb-16 pt-32 sm:pb-24">
        <div className="max-w-2xl">
          <p className="eyebrow animate-fade-rise text-gold-light">{content.eyebrow}</p>

          <h1
            className="mt-5 animate-fade-rise text-display-xl text-ivory"
            style={{ animationDelay: '90ms' }}
          >
            {content.headline}
          </h1>

          <p
            className="mt-6 max-w-xl animate-fade-rise text-[1.02rem] leading-relaxed text-ivory/80 sm:text-[1.1rem]"
            style={{ animationDelay: '180ms' }}
          >
            {content.subhead}
          </p>

          <div
            className="mt-9 flex animate-fade-rise flex-col gap-3 sm:flex-row"
            style={{ animationDelay: '260ms' }}
          >
            <Button asChild size="lg" variant="gold">
              <Link href={content.ctaHref}>{content.ctaLabel}</Link>
            </Button>
            <Button asChild size="lg" variant="outline-light">
              <Link href={content.secondaryHref}>{content.secondaryLabel}</Link>
            </Button>
          </div>
        </div>
      </div>

      <a
        href="#occasions"
        className="absolute bottom-7 right-6 hidden h-11 w-11 items-center justify-center border border-ivory/30 text-ivory/70 transition-colors hover:border-gold hover:text-gold lg:flex"
        aria-label="Scroll to collections"
      >
        <ArrowDown className="h-4 w-4" />
      </a>
    </section>
  );
}
