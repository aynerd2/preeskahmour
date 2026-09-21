import { isCloudinaryConfigured } from './cloudinary-url';

/**
 * The house's real photography and film, held in Cloudinary.
 *
 * Every public id is named here and nowhere else — components refer to the
 * constants, never to an id string.
 *
 * All six stills are 4284 × 5712 (exactly 3:4 portrait), which is also the
 * ratio of the portrait slots across the site, so they are delivered at their
 * native ratio with no cropping. The one place a crop is forced is the
 * circular founder portrait, which uses face gravity.
 *
 * These are photographs of finished garments on Prisca. They are deliberately
 * NOT used for fabric swatches (the fabric library and the builder's cloth
 * picker keep their procedural patterns), and NOT used as product photography
 * — the suits pictured are not the specific shop pieces, and presenting them
 * as such would misrepresent what a customer is buying.
 */

export type HousePhoto = {
  publicId: string;
  width: number;
  height: number;
  /** Full description for screen readers. */
  alt: string;
  /** Short caption for the lookbook grid. */
  caption: string;
};

export const HOUSE_PHOTOS = {
  p1: {
    publicId: 'p1',
    width: 4284,
    height: 5712,
    alt: 'Prisca Ogunlade standing beside a glazed door in a burgundy single-breasted trouser suit and black pointed heels',
    caption: 'Burgundy trouser suit',
  },
  p2: {
    publicId: 'p2',
    width: 4284,
    height: 5712,
    alt: 'Prisca Ogunlade in an ivory trouser suit with a bow-neck blouse, standing beside a bar',
    caption: 'Ivory trouser suit, bow-neck blouse',
  },
  p3: {
    publicId: 'p3',
    width: 4284,
    height: 5712,
    alt: 'Prisca Ogunlade seated at a dining table in a black trouser suit with beaded lapels and cuffs',
    caption: 'Black suit, beaded lapel and cuff',
  },
  p4: {
    publicId: 'p4',
    width: 4284,
    height: 5712,
    alt: 'Prisca Ogunlade climbing a marble staircase in a burgundy single-breasted suit, one hand on the rail',
    caption: 'Burgundy suit, in motion',
  },
  p5: {
    publicId: 'p5',
    width: 4284,
    height: 5712,
    alt: 'Prisca Ogunlade in an ivory double-breasted jacket and bow-neck blouse, looking down at a bookshelf',
    caption: 'Ivory double-breasted jacket',
  },
  p6: {
    publicId: 'p6',
    width: 4284,
    height: 5712,
    alt: 'Prisca Ogunlade seated in a black suit with beaded lapels and cuffs, looking past the camera',
    caption: 'Black suit, seated',
  },
} as const satisfies Record<string, HousePhoto>;

export type HousePhotoKey = keyof typeof HOUSE_PHOTOS;

export const HOUSE_VIDEO = {
  /** Confirmed as the only video in the media library. */
  publicId: 'Suit_video',
  width: 650,
  height: 1192,
  alt: 'Prisca Ogunlade, seated in an ivory trouser suit, smiling to camera',
} as const;

/**
 * Which asset fills which slot. Changing a placement is a one-line edit here.
 */
export const SLOTS = {
  homeStoryTeaser: 'p5',
  ourStoryPortrait: 'p6',
  founderQuote: 'p4',
  /**
   * Ordered so a three-column masonry reads burgundy / black / ivory across
   * the top row and ivory / burgundy / black across the second.
   */
  lookbook: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
} as const satisfies {
  homeStoryTeaser: HousePhotoKey;
  ourStoryPortrait: HousePhotoKey;
  founderQuote: HousePhotoKey;
  lookbook: readonly HousePhotoKey[];
};

// ---------------------------------------------------------------------------
// Resolving a database slot
// ---------------------------------------------------------------------------

/**
 * True for the generated stand-ins in /public/placeholders — i.e. a slot
 * nobody has put real imagery into yet.
 */
let warnedMissingCloud = false;

export function isPlaceholderUrl(url: string | null | undefined) {
  return !url || url.startsWith('/placeholders/');
}

/**
 * What an image slot should actually render.
 *
 * `cloudinary` renders through the Cloudinary loader with real transforms;
 * `url` renders whatever is stored (an upload Prisca made, or a placeholder).
 */
export type ImageSource =
  | { kind: 'cloudinary'; publicId: string; alt: string; width: number; height: number }
  | { kind: 'url'; url: string; alt: string };

/**
 * The editable-content slots are rows in the database, seeded with placeholder
 * paths. Rather than rewrite those rows, a slot still holding a placeholder is
 * filled with the house asset at render time.
 *
 * Precedence:
 *   1. Anything real Prisca has saved through /studio — always wins.
 *   2. The house asset for this slot, when Cloudinary is configured.
 *   3. The stored placeholder, so a missing env var degrades to the old
 *      placeholder rather than a broken image.
 */
export function resolveSlot(
  stored: { url?: string | null; alt?: string | null } | null | undefined,
  house: HousePhotoKey,
): ImageSource {
  const storedUrl = stored?.url ?? '';

  if (!isPlaceholderUrl(storedUrl)) {
    return { kind: 'url', url: storedUrl, alt: stored?.alt ?? '' };
  }

  if (isCloudinaryConfigured()) {
    const photo = HOUSE_PHOTOS[house];
    return {
      kind: 'cloudinary',
      publicId: photo.publicId,
      alt: photo.alt,
      width: photo.width,
      height: photo.height,
    };
  }

  if (typeof window === 'undefined' && !warnedMissingCloud) {
    warnedMissingCloud = true;
    console.warn(
      '[brand-assets] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set — serving placeholders instead of house photography.',
    );
  }

  return { kind: 'url', url: storedUrl || `/placeholders/og-default.svg`, alt: stored?.alt ?? '' };
}
