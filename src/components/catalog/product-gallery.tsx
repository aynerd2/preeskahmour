'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

type GalleryImage = { url: string; alt: string | null };

/**
 * Product gallery.
 *
 * Desktop: a vertical thumbnail strip beside a large frame.
 * Mobile: a snap-scrolling filmstrip with dot indicators — no carousel
 * library, no JS-driven transform, so it stays smooth on a cheap Android and
 * degrades to a plain scrollable row if scripting fails.
 */
export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = React.useState(0);
  const stripRef = React.useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return <div className="motif-diamond aspect-[3/4] w-full bg-cream" />;
  }

  function onStripScroll() {
    const strip = stripRef.current;
    if (!strip) return;
    const index = Math.round(strip.scrollLeft / strip.clientWidth);
    setActive(Math.max(0, Math.min(images.length - 1, index)));
  }

  return (
    <div className="lg:flex lg:gap-4">
      {/* Desktop thumbnails */}
      {images.length > 1 ? (
        <div className="hidden shrink-0 flex-col gap-3 lg:flex">
          {images.map((image, i) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'relative aspect-[3/4] w-16 overflow-hidden border transition-colors',
                i === active ? 'border-gold' : 'border-transparent hover:border-ink/25',
              )}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === active}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {/* Desktop main frame */}
      <div className="relative hidden aspect-[3/4] flex-1 overflow-hidden bg-cream lg:block">
        {images.map((image, i) => (
          <Image
            key={image.url}
            src={image.url}
            alt={image.alt ?? name}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 45vw"
            className={cn(
              'object-cover transition-opacity duration-500 ease-editorial',
              i === active ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}
      </div>

      {/* Mobile filmstrip */}
      <div className="lg:hidden">
        <div
          ref={stripRef}
          onScroll={onStripScroll}
          className="hide-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((image, i) => (
            <div key={image.url} className="relative aspect-[3/4] w-full shrink-0 snap-center bg-cream">
              <Image
                src={image.url}
                alt={image.alt ?? name}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {images.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
            {images.map((image, i) => (
              <span
                key={image.url}
                className={cn(
                  'h-1 w-6 transition-colors',
                  i === active ? 'bg-gold' : 'bg-ink/15',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
