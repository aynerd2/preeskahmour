'use client';

import Image, { type ImageLoaderProps } from 'next/image';

import type { ImageSource } from '@/lib/brand-assets';
import { cloudinaryImageUrl, type ImageTransform } from '@/lib/cloudinary-url';

type Props = {
  source: ImageSource;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Only for slots that genuinely need a different ratio (the avatar). */
  crop?: Pick<ImageTransform, 'aspectRatio' | 'gravity' | 'zoom'>;
};

/**
 * next/image for a resolved slot.
 *
 * For Cloudinary sources it uses a custom loader, so every width in the
 * responsive `srcset` is produced by Cloudinary (`w_…,c_limit,f_auto,q_auto`)
 * rather than downloading the 4284px original into Next's own optimiser and
 * re-encoding it. Lazy-loading and `sizes` behave exactly as they do for every
 * other image on the site.
 *
 * This must be a client component: `loader` is a function, and a function
 * cannot be passed from a server component into next/image. Callers pass only
 * serialisable props.
 */
export function ResolvedImage({ source, sizes, className, priority, crop }: Props) {
  if (source.kind === 'url') {
    return (
      <Image
        src={source.url}
        alt={source.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  const loader = ({ src, width }: ImageLoaderProps) =>
    cloudinaryImageUrl(src, { width, ...crop }) ?? src;

  return (
    <Image
      loader={loader}
      src={source.publicId}
      alt={source.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
