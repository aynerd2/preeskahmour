import Image from 'next/image';
import Link from 'next/link';
import { preload } from 'react-dom';
import { ArrowDown } from 'lucide-react';

import { HeroVideo } from './hero-video';
import { Button } from '@/components/ui/button';
import { HOUSE_VIDEO, isPlaceholderUrl } from '@/lib/brand-assets';
import {
  cloudinaryVideoPoster,
  cloudinaryVideoUrl,
  isCloudinaryConfigured,
} from '@/lib/cloudinary-url';
import type { SiteContent } from '@/lib/site-content';

/**
 * The homepage hero, as a split layout.
 *
 * The house film and photography are portrait. Forcing a portrait film into a
 * full-bleed landscape banner means cropping away most of the person in it,
 * so instead the media sits at its natural ratio in one column and the
 * headline and calls to action take the other. On a phone the two stack, type
 * first — the header is transparent over the hero, and ivory type on the dark
 * emerald ground keeps it legible.
 *
 * What goes in the media frame, in order of precedence:
 *   1. A film Prisca set in /studio (mediaType "video" with a URL).
 *   2. A real (non-placeholder) image she set in /studio.
 *   3. The house film from Cloudinary.
 *   4. The stored placeholder, if Cloudinary is not configured.
 */
export function HomeHero({ content }: { content: SiteContent['home.hero'] }) {
  const media = resolveHeroMedia(content);

  // The poster is the largest thing painted above the fold; fetch it early.
  if (media.kind === 'video' && media.poster) preload(media.poster, { as: 'image' });

  return (
    <section className="relative isolate -mt-16 overflow-hidden bg-emerald-deep text-ivory sm:-mt-20">
      {/* A quiet aso-oke stripe behind everything, for texture. Kept faint:
          at higher opacity it read as scan-lines across the film. */}
      <div className="motif-asooke pointer-events-none absolute inset-0 -z-10 opacity-15" aria-hidden />

      <div className="container grid items-center gap-10 pb-14 pt-28 sm:pt-32 lg:min-h-[88svh] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 lg:pb-16 lg:pt-32">
        {/* Type */}
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

        {/* Media, at its own ratio. Height-led on desktop so a tall portrait
            never pushes the fold; width-led and centred on a phone. */}
        <div className="relative mx-auto w-full max-w-[280px] animate-fade-in sm:max-w-[320px] lg:mx-0 lg:h-[min(74svh,720px)] lg:w-auto lg:max-w-none">
          <div
            className="relative w-full overflow-hidden bg-emerald lg:h-full lg:w-auto"
            style={{ aspectRatio: media.aspectRatio }}
          >
            {media.kind === 'video' ? (
              <HeroVideo sources={media.sources} poster={media.poster} label={media.alt} />
            ) : (
              <Image
                src={media.url}
                alt={media.alt}
                fill
                priority
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 420px"
                className="object-cover"
              />
            )}
          </div>

          {/* Gold frame offset behind the media — the same house detail as
              the story teaser. */}
          <span
            className="absolute -bottom-3 -right-3 -z-10 hidden h-full w-full border border-gold/45 sm:block"
            aria-hidden
          />
        </div>
      </div>

      <a
        href="#occasions"
        className="absolute bottom-7 left-1/2 hidden h-11 w-11 -translate-x-1/2 items-center justify-center border border-ivory/30 text-ivory/70 transition-colors hover:border-gold hover:text-gold xl:flex"
        aria-label="Scroll to collections"
      >
        <ArrowDown className="h-4 w-4" />
      </a>
    </section>
  );
}

type HeroMedia =
  | {
      kind: 'video';
      sources: { src: string; type: string }[];
      poster: string;
      alt: string;
      aspectRatio: string;
    }
  | { kind: 'image'; url: string; alt: string; aspectRatio: string };

function resolveHeroMedia(content: SiteContent['home.hero']): HeroMedia {
  // 1. A film set explicitly in the studio.
  if (content.mediaType === 'video' && content.videoUrl) {
    return {
      kind: 'video',
      sources: [{ src: content.videoUrl, type: 'video/mp4' }],
      poster: isPlaceholderUrl(content.image.url) ? '' : content.image.url,
      alt: content.image.alt,
      aspectRatio: '3 / 4',
    };
  }

  // 2. A real image set in the studio.
  if (!isPlaceholderUrl(content.image.url)) {
    return { kind: 'image', url: content.image.url, alt: content.image.alt, aspectRatio: '3 / 4' };
  }

  // 3. The house film.
  if (isCloudinaryConfigured()) {
    const webm = cloudinaryVideoUrl(HOUSE_VIDEO.publicId, { width: 720, format: 'webm' });
    const mp4 = cloudinaryVideoUrl(HOUSE_VIDEO.publicId, { width: 720, format: 'mp4' });
    const poster = cloudinaryVideoPoster(HOUSE_VIDEO.publicId, { width: 720 });

    if (webm && mp4 && poster) {
      return {
        kind: 'video',
        // WebM first: about a third smaller where supported, MP4 otherwise.
        sources: [
          { src: webm, type: 'video/webm' },
          { src: mp4, type: 'video/mp4' },
        ],
        poster,
        alt: HOUSE_VIDEO.alt,
        aspectRatio: `${HOUSE_VIDEO.width} / ${HOUSE_VIDEO.height}`,
      };
    }
  }

  // 4. Placeholder.
  return {
    kind: 'image',
    url: content.image.url || '/placeholders/home-hero.svg',
    alt: content.image.alt,
    aspectRatio: '3 / 4',
  };
}
