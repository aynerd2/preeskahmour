/**
 * Cloudinary delivery URLs — the only place a transformation string is built.
 *
 * Deliberately separate from `lib/cloudinary.ts`, which is `server-only` and
 * holds the API secret for signing studio uploads. Nothing here is secret: a
 * cloud name and a public id appear in every delivered image URL anyway. That
 * separation is what lets this module be imported by client components (the
 * next/image loader runs in the browser) without the secret ever being in
 * reach of a client bundle.
 *
 * Every asset is transformed through URL parameters — the source files in the
 * media library are never re-cropped or duplicated.
 */

export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';

export function isCloudinaryConfigured() {
  return CLOUD_NAME.length > 0;
}

export type ImageTransform = {
  /** Delivered width in CSS pixels × device pixel ratio. */
  width: number;
  /**
   * Force an aspect ratio, e.g. '1:1'. Omit to keep the source's own ratio —
   * which is the right answer for every portrait slot on this site.
   */
  aspectRatio?: string;
  /**
   * Where to anchor a forced crop. `face` keeps the face centred, `auto` lets
   * Cloudinary pick the salient region. Ignored without an aspect ratio,
   * because without one nothing is cropped.
   */
  gravity?: 'auto' | 'face' | 'faces' | 'center';
  /**
   * For tight face crops (avatars): how far to zoom out from the face.
   * Values below 1 include more of the head and shoulders.
   */
  zoom?: number;
};

/**
 * Builds an image URL.
 *
 * - No aspect ratio → `c_limit`: scale down to the width, never up, never crop.
 * - Aspect ratio + `face` gravity + zoom → `c_thumb`: a crop framed around the
 *   face, for avatars.
 * - Aspect ratio otherwise → `c_fill` with the chosen gravity.
 *
 * `f_auto,q_auto` everywhere, so each browser gets AVIF/WebP at a sensible
 * quality without us choosing per device.
 */
export function cloudinaryImageUrl(publicId: string, t: ImageTransform): string | null {
  if (!isCloudinaryConfigured()) return null;

  const width = Math.max(16, Math.round(t.width));
  const parts: string[] = [];

  if (!t.aspectRatio) {
    parts.push('c_limit', `w_${width}`);
  } else if (t.zoom !== undefined && (t.gravity === 'face' || t.gravity === 'faces')) {
    parts.push('c_thumb', `g_${t.gravity}`, `ar_${t.aspectRatio}`, `w_${width}`, `z_${t.zoom}`);
  } else {
    parts.push('c_fill', `g_${t.gravity ?? 'auto'}`, `ar_${t.aspectRatio}`, `w_${width}`);
  }

  parts.push('q_auto', 'f_auto');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${parts.join(',')}/${publicId}`;
}

/**
 * Video source for one container format. The source in the library is a
 * 27.8 MB `.mov`; delivered like this it is roughly 3 MB (MP4/H.264) or
 * 2 MB (WebM/VP9). `c_limit` means we never upscale past the source width.
 */
export function cloudinaryVideoUrl(
  publicId: string,
  opts: { width: number; format: 'mp4' | 'webm' },
): string | null {
  if (!isCloudinaryConfigured()) return null;

  const codec = opts.format === 'webm' ? 'vc_vp9' : 'vc_h264';
  const t = ['c_limit', `w_${Math.round(opts.width)}`, codec, 'q_auto'].join(',');

  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${t}/${publicId}.${opts.format}`;
}

/**
 * A still frame pulled from the video by Cloudinary — used as the `<video>`
 * poster, so the hero paints immediately and people who have reduced motion
 * or data saving on still see her. No second file needs to be supplied.
 */
export function cloudinaryVideoPoster(
  publicId: string,
  opts: ImageTransform & { offsetSeconds?: number },
): string | null {
  if (!isCloudinaryConfigured()) return null;

  const parts = [`so_${opts.offsetSeconds ?? 1}`];

  if (opts.aspectRatio) {
    parts.push('c_fill', `g_${opts.gravity ?? 'auto'}`, `ar_${opts.aspectRatio}`);
  } else {
    parts.push('c_limit');
  }

  parts.push(`w_${Math.round(opts.width)}`, 'q_auto', 'f_auto');

  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${parts.join(',')}/${publicId}.jpg`;
}
