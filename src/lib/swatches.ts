import type { FabricFamily } from '@prisma/client';

/**
 * Procedural fabric swatches.
 *
 * No real photography exists yet, and reproducing an actual wax-print or
 * adire design would be copying someone's copyrighted textile art. So every
 * swatch here is an ORIGINAL geometric construction that evokes the *weave
 * logic* of its family — strip-woven bands for aso-oke, resist-dyed
 * concentric squares for adire, twill hairlines for worsted wool.
 *
 * These are deliberately good enough to demonstrate the builder's
 * texture-swap mechanic and to make the fabric library legible. Prisca
 * replaces each one with a real photograph from /studio → Fabrics → Swatch
 * image; the moment `fabric.swatchImage` is set, the procedural version is
 * never rendered again.
 *
 * Both `svg` and `dataUri` are pure and deterministic, so they can be called
 * from a server component, a client component, or inline CSS.
 */

// --- tiny colour helpers (no dependency) ------------------------------------

function clamp(n: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  return [
    parseInt(full.slice(0, 2), 16) || 0,
    parseInt(full.slice(2, 4), 16) || 0,
    parseInt(full.slice(4, 6), 16) || 0,
  ];
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => clamp(Math.round(v)).toString(16).padStart(2, '0')).join('')}`;
}

export function lighten(hex: string, amount = 0.3) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

export function darken(hex: string, amount = 0.3) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/** Relative luminance, for deciding whether to lay ink or ivory over a colour. */
export function isLight(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

export function readableOn(hex: string) {
  return isLight(hex) ? '#14110F' : '#FBF8F3';
}

// --- swatch generation ------------------------------------------------------

const GOLD = '#C6A15B';
const CHALK = '#F4EDE1';

type SwatchOpts = {
  /** Tile size in user units. Larger = coarser pattern when scaled down. */
  size?: number;
  /** Secondary colour; defaults to a derived tint of the base. */
  accent?: string;
};

/**
 * Returns a standalone, tileable SVG string for a fabric family.
 * The viewBox is square and the pattern meets seamlessly at all four edges.
 */
export function swatchSvg(
  family: FabricFamily,
  colorHex: string,
  opts: SwatchOpts = {},
): string {
  const size = opts.size ?? 160;
  const base = colorHex || '#0B4D3F';
  const light = opts.accent ?? lighten(base, 0.55);
  const dark = darken(base, 0.35);
  const ink = readableOn(base);
  const s = size;
  const h = size / 2;

  const open = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">`;
  const bg = `<rect width="${s}" height="${s}" fill="${base}"/>`;
  const close = '</svg>';

  switch (family) {
    case 'ANKARA':
      // Wax-print logic: a bold repeating medallion on a saturated ground,
      // with the crackle line-work wax prints are known for.
      return `${open}${bg}
<g fill="none" stroke="${light}" stroke-width="${s * 0.018}">
  <circle cx="${h}" cy="${h}" r="${s * 0.3}"/>
  <circle cx="${h}" cy="${h}" r="${s * 0.2}"/>
  <circle cx="0" cy="0" r="${s * 0.2}"/><circle cx="${s}" cy="0" r="${s * 0.2}"/>
  <circle cx="0" cy="${s}" r="${s * 0.2}"/><circle cx="${s}" cy="${s}" r="${s * 0.2}"/>
</g>
<circle cx="${h}" cy="${h}" r="${s * 0.085}" fill="${GOLD}"/>
<g fill="${dark}" opacity="0.5">
  <circle cx="${h}" cy="${s * 0.14}" r="${s * 0.035}"/>
  <circle cx="${h}" cy="${s * 0.86}" r="${s * 0.035}"/>
  <circle cx="${s * 0.14}" cy="${h}" r="${s * 0.035}"/>
  <circle cx="${s * 0.86}" cy="${h}" r="${s * 0.035}"/>
</g>${close}`;

    case 'ASO_OKE':
      // Narrow-strip loom: warp bands of unequal width with metallic
      // supplementary weft floats crossing them.
      return `${open}${bg}
<g fill="${dark}" opacity="0.55">
  <rect x="${s * 0.06}" width="${s * 0.05}" height="${s}"/>
  <rect x="${s * 0.34}" width="${s * 0.09}" height="${s}"/>
  <rect x="${s * 0.66}" width="${s * 0.05}" height="${s}"/>
</g>
<g fill="${light}" opacity="0.7">
  <rect x="${s * 0.18}" width="${s * 0.03}" height="${s}"/>
  <rect x="${s * 0.55}" width="${s * 0.03}" height="${s}"/>
  <rect x="${s * 0.86}" width="${s * 0.03}" height="${s}"/>
</g>
<g stroke="${GOLD}" stroke-width="${s * 0.012}" opacity="0.85">
  <path d="M0 ${s * 0.22}h${s}"/><path d="M0 ${s * 0.5}h${s}"/><path d="M0 ${s * 0.78}h${s}"/>
</g>
<g fill="${GOLD}" opacity="0.55">
  <rect x="${s * 0.1}" y="${s * 0.46}" width="${s * 0.06}" height="${s * 0.08}"/>
  <rect x="${s * 0.62}" y="${s * 0.18}" width="${s * 0.06}" height="${s * 0.08}"/>
</g>${close}`;

    case 'ADIRE':
      // Eleko resist: cassava paste stops the indigo, leaving chalk-white
      // concentric squares and a stitched dot field.
      return `${open}${bg}
<g fill="none" stroke="${CHALK}" stroke-width="${s * 0.016}" opacity="0.85">
  <rect x="${s * 0.12}" y="${s * 0.12}" width="${s * 0.32}" height="${s * 0.32}"/>
  <rect x="${s * 0.19}" y="${s * 0.19}" width="${s * 0.18}" height="${s * 0.18}"/>
  <rect x="${s * 0.56}" y="${s * 0.56}" width="${s * 0.32}" height="${s * 0.32}"/>
  <rect x="${s * 0.63}" y="${s * 0.63}" width="${s * 0.18}" height="${s * 0.18}"/>
</g>
<g fill="${CHALK}" opacity="0.7">
  <circle cx="${s * 0.28}" cy="${s * 0.28}" r="${s * 0.028}"/>
  <circle cx="${s * 0.72}" cy="${s * 0.72}" r="${s * 0.028}"/>
  <circle cx="${s * 0.72}" cy="${s * 0.22}" r="${s * 0.02}"/>
  <circle cx="${s * 0.86}" cy="${s * 0.36}" r="${s * 0.02}"/>
  <circle cx="${s * 0.22}" cy="${s * 0.72}" r="${s * 0.02}"/>
  <circle cx="${s * 0.36}" cy="${s * 0.86}" r="${s * 0.02}"/>
</g>
<g stroke="${CHALK}" stroke-width="${s * 0.008}" opacity="0.35">
  <path d="M${s * 0.5} 0v${s}"/><path d="M0 ${s * 0.5}h${s}"/>
</g>${close}`;

    case 'AKWETE':
      // Raised weft blocks stepping across a plain ground.
      return `${open}${bg}
<g fill="${light}" opacity="0.75">
  <rect x="${s * 0.05}" y="${s * 0.1}" width="${s * 0.22}" height="${s * 0.12}"/>
  <rect x="${s * 0.42}" y="${s * 0.32}" width="${s * 0.22}" height="${s * 0.12}"/>
  <rect x="${s * 0.72}" y="${s * 0.56}" width="${s * 0.22}" height="${s * 0.12}"/>
  <rect x="${s * 0.18}" y="${s * 0.76}" width="${s * 0.22}" height="${s * 0.12}"/>
</g>
<g fill="${dark}" opacity="0.5">
  <rect x="${s * 0.42}" y="${s * 0.1}" width="${s * 0.1}" height="${s * 0.12}"/>
  <rect x="${s * 0.05}" y="${s * 0.32}" width="${s * 0.1}" height="${s * 0.12}"/>
  <rect x="${s * 0.5}" y="${s * 0.76}" width="${s * 0.1}" height="${s * 0.12}"/>
</g>
<g stroke="${GOLD}" stroke-width="${s * 0.008}" opacity="0.5">
  <path d="M0 ${s * 0.26}h${s}"/><path d="M0 ${s * 0.72}h${s}"/>
</g>${close}`;

    case 'GEORGE':
      // Brocade damask: a lustrous lattice with a soft sheen gradient.
      return `${open}
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${lighten(base, 0.18)}"/>
  <stop offset="0.5" stop-color="${base}"/>
  <stop offset="1" stop-color="${darken(base, 0.18)}"/>
</linearGradient></defs>
<rect width="${s}" height="${s}" fill="url(#g)"/>
<g fill="none" stroke="${GOLD}" stroke-width="${s * 0.01}" opacity="0.7">
  <path d="M${h} ${s * 0.08} L${s * 0.92} ${h} L${h} ${s * 0.92} L${s * 0.08} ${h} Z"/>
  <path d="M${h} ${s * 0.26} L${s * 0.74} ${h} L${h} ${s * 0.74} L${s * 0.26} ${h} Z"/>
  <path d="M0 0 L${s * 0.18} 0 L0 ${s * 0.18} Z"/>
  <path d="M${s} ${s} L${s * 0.82} ${s} L${s} ${s * 0.82} Z"/>
</g>
<circle cx="${h}" cy="${h}" r="${s * 0.05}" fill="${GOLD}" opacity="0.75"/>${close}`;

    case 'KENTE':
      // Alternating warp-faced and weft-faced blocks, as in strip weaving.
      return `${open}${bg}
<g>
  <rect x="0" y="0" width="${h}" height="${h}" fill="${dark}" opacity="0.6"/>
  <rect x="${h}" y="${h}" width="${h}" height="${h}" fill="${dark}" opacity="0.6"/>
</g>
<g stroke="${GOLD}" stroke-width="${s * 0.022}" opacity="0.8">
  <path d="M0 ${s * 0.12}h${h}"/><path d="M0 ${s * 0.25}h${h}"/><path d="M0 ${s * 0.38}h${h}"/>
  <path d="M${h} ${s * 0.62}h${h}"/><path d="M${h} ${s * 0.75}h${h}"/><path d="M${h} ${s * 0.88}h${h}"/>
</g>
<g stroke="${light}" stroke-width="${s * 0.022}" opacity="0.75">
  <path d="M${s * 0.62} 0v${h}"/><path d="M${s * 0.75} 0v${h}"/><path d="M${s * 0.88} 0v${h}"/>
  <path d="M${s * 0.12} ${h}v${h}"/><path d="M${s * 0.25} ${h}v${h}"/><path d="M${s * 0.38} ${h}v${h}"/>
</g>${close}`;

    case 'WOOL':
      // Worsted twill: fine 45-degree hairlines, barely there.
      return `${open}${bg}
<g stroke="${lighten(base, 0.22)}" stroke-width="${s * 0.012}" opacity="0.55">
  ${Array.from({ length: 10 }, (_, i) => {
    const o = (i * s) / 5;
    return `<path d="M${-s + o} ${s} L${o} 0"/>`;
  }).join('')}
</g>
<g stroke="${darken(base, 0.2)}" stroke-width="${s * 0.006}" opacity="0.4">
  ${Array.from({ length: 10 }, (_, i) => {
    const o = (i * s) / 5 + s * 0.1;
    return `<path d="M${-s + o} ${s} L${o} 0"/>`;
  }).join('')}
</g>${close}`;

    case 'LINEN':
      // Plain weave: a visible slubby crosshatch.
      return `${open}${bg}
<g stroke="${lighten(base, 0.3)}" stroke-width="${s * 0.014}" opacity="0.5">
  ${Array.from({ length: 8 }, (_, i) => `<path d="M0 ${(i * s) / 8 + s / 16}h${s}"/>`).join('')}
</g>
<g stroke="${darken(base, 0.16)}" stroke-width="${s * 0.014}" opacity="0.45">
  ${Array.from({ length: 8 }, (_, i) => `<path d="M${(i * s) / 8 + s / 16} 0v${s}"/>`).join('')}
</g>
<g fill="${lighten(base, 0.45)}" opacity="0.5">
  <rect x="${s * 0.3}" y="${s * 0.18}" width="${s * 0.16}" height="${s * 0.014}"/>
  <rect x="${s * 0.66}" y="${s * 0.62}" width="${s * 0.2}" height="${s * 0.014}"/>
</g>${close}`;

    case 'SATIN':
    default:
      // Long floats catching light — a soft diagonal sheen, no visible weave.
      return `${open}
<defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${darken(base, 0.22)}"/>
  <stop offset="0.35" stop-color="${lighten(base, 0.28)}"/>
  <stop offset="0.55" stop-color="${base}"/>
  <stop offset="0.8" stop-color="${lighten(base, 0.16)}"/>
  <stop offset="1" stop-color="${darken(base, 0.22)}"/>
</linearGradient></defs>
<rect width="${s}" height="${s}" fill="url(#s)"/>
<g stroke="${ink}" stroke-width="${s * 0.004}" opacity="0.06">
  ${Array.from({ length: 6 }, (_, i) => `<path d="M${-s + (i * s) / 3} ${s} L${(i * s) / 3} 0"/>`).join('')}
</g>${close}`;
  }
}

/** Same swatch, encoded for use in `src=` or `background-image: url(...)`. */
export function swatchDataUri(family: FabricFamily, colorHex: string, opts?: SwatchOpts) {
  return `data:image/svg+xml,${encodeURIComponent(swatchSvg(family, colorHex, opts))}`;
}

/**
 * The image a fabric should render with right now: the real photograph if
 * Prisca has uploaded one, otherwise the procedural stand-in.
 */
export function fabricImage(fabric: {
  family: FabricFamily;
  colorHex: string;
  swatchImage?: string | null;
}) {
  return fabric.swatchImage || swatchDataUri(fabric.family, fabric.colorHex);
}

/** Higher-resolution tile for the builder's live preview fill. */
export function fabricTexture(fabric: {
  family: FabricFamily;
  colorHex: string;
  textureImage?: string | null;
  swatchImage?: string | null;
}) {
  return (
    fabric.textureImage ||
    fabric.swatchImage ||
    swatchDataUri(fabric.family, fabric.colorHex, { size: 200 })
  );
}
