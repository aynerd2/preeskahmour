'use client';

import * as React from 'react';

import { fabricTexture } from '@/lib/swatches';
import { cn } from '@/lib/utils';

/**
 * The builder's live preview.
 *
 * ── Strategy ───────────────────────────────────────────────────────────────
 * This is a single inline SVG, drawn in the style of a tailor's technical
 * flat: clean outlines, visible seam lines, no attempt at photorealism. The
 * chosen cloth is applied through an SVG <pattern> whose <image> is the
 * fabric swatch (a real photograph once one is uploaded, otherwise the
 * procedural weave from lib/swatches.ts). Every design option is a vector
 * shape keyed off the option's slug.
 *
 * Why this and not layered PNGs: swapping a <pattern> href or a <path> `d`
 * is a synchronous re-render with no network request, so changing lapel,
 * pocket, button or cloth repaints in the same frame. Pre-rendered raster
 * layers would need one image per option per style, would flash while
 * loading, and would have to be re-shot every time Prisca adds a cut.
 *
 * Why "technical flat" and not a rendered garment: it is honest. A stylised
 * drawing reads as a diagram of your choices. A photorealistic render implies
 * a fidelity we cannot deliver from vector shapes, and would set the customer
 * up to be disappointed by the real garment.
 *
 * ── Swapping in 3D later ───────────────────────────────────────────────────
 * This component is a pure function of `GarmentConfig` — it holds no state,
 * fetches nothing, and knows nothing about the wizard. A WebGL/Three.js
 * viewer can replace it wholesale by accepting the same prop and rendering
 * into a <canvas>; the store, the schema and every step component stay put.
 * Anything a 3D viewer would need (option slugs, colours, texture URL) is
 * already in the config it receives.
 *
 * If Prisca uploads bespoke artwork for a cut (BaseStyle.previewMaskUrl) or
 * for an option (DesignOption.overlayUrl), that image is composited over the
 * vector drawing instead — see `overlays` below.
 */

export type GarmentConfig = {
  /** Base style slug: blazer-trouser | blazer-skirt | waistcoat-set | wrap-suit | maternity-set */
  baseStyleSlug: string;
  fabric: {
    family: 'ANKARA' | 'ASO_OKE' | 'ADIRE' | 'AKWETE' | 'GEORGE' | 'KENTE' | 'WOOL' | 'LINEN' | 'SATIN';
    colorHex: string;
    swatchImage?: string | null;
    textureImage?: string | null;
  } | null;
  fit: 'REGULAR' | 'SLIM' | 'RELAXED' | 'MATERNITY';
  /** Selected option slugs, by category. */
  lapel?: string;
  closure?: string;
  buttonCount?: string;
  buttonColorHex?: string;
  pocket?: string;
  sleeve?: string;
  liningHex?: string;
  trim?: string;
  trimHex?: string;
  monogram?: string;
  /** Bespoke overlay art uploaded through /studio, drawn over the vectors. */
  overlays?: string[];
};

// ---------------------------------------------------------------------------
// Geometry. Kept in one block so proportions can be tuned without hunting
// through JSX. Canvas is 600 × 800.
// ---------------------------------------------------------------------------

/**
 * Drawing canvas. All geometry below — and any overlay artwork uploaded
 * through /studio — is authored against this 600 × 800 grid, which stays
 * fixed so uploaded art keeps aligning.
 */
const W = 600;
const H = 800;
const CX = W / 2;

/**
 * The visible crop. The drawn garment occupies roughly x 126–474 and
 * y 106–782 across every cut and fit (widest case: maternity, which flares
 * the side seams by 12%). Framing to that content rather than to the full
 * grid removes about 100px of dead gutter on each side, so the garment fills
 * the panel instead of floating in it. Margins at the widest case: 66px
 * horizontally, ~35px vertically.
 */
const VIEW_BOX = '60 70 480 745';

/** Where the jacket closes. Higher button counts break higher on the chest. */
function breakPoint(buttonCount?: string, closure?: string) {
  if (closure === 'closure-double') return 292;
  if (buttonCount === 'buttons-one') return 316;
  if (buttonCount === 'buttons-three') return 248;
  return 284; // two-button default
}

/** Side-seam width multiplier. A relaxed cut is genuinely wider through the body. */
function fitWidth(fit: GarmentConfig['fit']) {
  switch (fit) {
    case 'SLIM':
      return 0.94;
    case 'RELAXED':
      return 1.07;
    case 'MATERNITY':
      return 1.12;
    default:
      return 1;
  }
}

function sleeveHem(sleeve?: string) {
  return sleeve === 'sleeve-three-quarter' ? 396 : 474;
}

export function GarmentPreview({
  config,
  className,
  showSeams = true,
}: {
  config: GarmentConfig;
  className?: string;
  /** Off for tiny thumbnails, where seam lines turn into noise. */
  showSeams?: boolean;
}) {
  // Unique per instance — several previews (style thumbnails, the main frame)
  // render on the same page and must not share <defs> ids.
  const uid = React.useId().replace(/:/g, '');
  const clothId = `cloth-${uid}`;
  const shadeId = `shade-${uid}`;

  const {
    baseStyleSlug,
    fabric,
    fit,
    lapel = 'lapel-notch',
    closure = 'closure-single',
    buttonCount = 'buttons-two',
    buttonColorHex = '#1B1714',
    pocket = 'pocket-flap',
    sleeve = 'sleeve-full',
    liningHex = '#0E5C4A',
    trim = 'trim-none',
    trimHex = '#C6A15B',
    monogram,
    overlays = [],
  } = config;

  const texture = fabric
    ? fabricTexture(fabric)
    : // Nothing chosen yet: a flat cream so the silhouette still reads.
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="8" height="8"%3E%3Crect width="8" height="8" fill="%23E7DBC7"/%3E%3C/svg%3E';

  const brk = breakPoint(buttonCount, closure);
  const fw = fitWidth(fit);
  const hem = sleeveHem(sleeve);

  const isSkirt = baseStyleSlug === 'blazer-skirt';
  const isWaistcoat = baseStyleSlug === 'waistcoat-set';
  const isWrap = baseStyleSlug === 'wrap-suit';
  const isMaternity = baseStyleSlug === 'maternity-set' || fit === 'MATERNITY';
  const isDouble = closure === 'closure-double';

  // Side-seam x positions, widened or narrowed by the fit.
  const sx = (base: number) => CX - (CX - base) * fw;

  const cloth = `url(#${clothId})`;

  return (
    <svg
      viewBox={VIEW_BOX}
      className={cn('h-full w-full', className)}
      role="img"
      aria-label={describe(config)}
    >
      <defs>
        <pattern id={clothId} patternUnits="userSpaceOnUse" width="150" height="150">
          <image
            href={texture}
            x="0"
            y="0"
            width="150"
            height="150"
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>

        {/* Soft vertical shading, multiplied over the cloth to suggest form. */}
        <linearGradient id={shadeId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.20" />
          <stop offset="0.28" stopColor="#000" stopOpacity="0" />
          <stop offset="0.72" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.24" />
        </linearGradient>
      </defs>

      {/* ---------------------------------------------------------------- */}
      {/* Lower half: trouser, skirt, or nothing (wrap shows trouser too)   */}
      {/* ---------------------------------------------------------------- */}
      {isSkirt ? (
        <g>
          <path d={`M ${sx(250)} 452 L ${sx(350)} 452 L ${sx(378)} 706 L ${sx(222)} 706 Z`} fill={cloth} />
          <path
            d={`M ${sx(250)} 452 L ${sx(350)} 452 L ${sx(378)} 706 L ${sx(222)} 706 Z`}
            fill={`url(#${shadeId})`}
          />
          {showSeams ? (
            <path
              d={`M ${CX} 452 L ${CX} 706`}
              stroke="#14110F"
              strokeOpacity="0.18"
              strokeWidth="1.5"
              fill="none"
            />
          ) : null}
        </g>
      ) : (
        <g>
          <path
            d={`M ${sx(246)} 452 L ${sx(354)} 452 L ${sx(364)} 600 L ${sx(352)} 782 L ${sx(308)} 782 L ${CX} 596 L ${sx(292)} 782 L ${sx(248)} 782 L ${sx(236)} 600 Z`}
            fill={cloth}
          />
          <path
            d={`M ${sx(246)} 452 L ${sx(354)} 452 L ${sx(364)} 600 L ${sx(352)} 782 L ${sx(308)} 782 L ${CX} 596 L ${sx(292)} 782 L ${sx(248)} 782 L ${sx(236)} 600 Z`}
            fill={`url(#${shadeId})`}
          />
          {showSeams ? (
            <g stroke="#14110F" strokeOpacity="0.16" strokeWidth="1.5" fill="none">
              {/* Front creases */}
              <path d={`M ${sx(272)} 470 L ${sx(268)} 780`} />
              <path d={`M ${sx(328)} 470 L ${sx(332)} 780`} />
            </g>
          ) : null}
        </g>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Sleeves — drawn before the body so the armhole seam sits on top   */}
      {/* ---------------------------------------------------------------- */}
      {[1, -1].map((side) => (
        <g key={side} transform={side === -1 ? `translate(${W},0) scale(-1,1)` : undefined}>
          <path
            d={`M ${sx(188)} 132
                C ${sx(164)} 156 ${sx(150)} 198 ${sx(146)} 250
                C ${sx(143)} 320 ${sx(148)} 400 ${sx(152)} ${hem}
                L ${sx(206)} ${hem}
                C ${sx(208)} 400 ${sx(214)} 320 ${sx(220)} 250
                C ${sx(224)} 200 ${sx(202)} 154 ${sx(188)} 132 Z`}
            fill={cloth}
          />
          <path
            d={`M ${sx(188)} 132
                C ${sx(164)} 156 ${sx(150)} 198 ${sx(146)} 250
                C ${sx(143)} 320 ${sx(148)} 400 ${sx(152)} ${hem}
                L ${sx(206)} ${hem}
                C ${sx(208)} 400 ${sx(214)} 320 ${sx(220)} 250
                C ${sx(224)} 200 ${sx(202)} 154 ${sx(188)} 132 Z`}
            fill={`url(#${shadeId})`}
          />

          {/* Turn-back cuff shows the lining */}
          {sleeve === 'sleeve-turnback' ? (
            <path
              d={`M ${sx(151)} ${hem - 34} L ${sx(207)} ${hem - 34} L ${sx(206)} ${hem} L ${sx(152)} ${hem} Z`}
              fill={liningHex}
              stroke="#14110F"
              strokeOpacity="0.2"
              strokeWidth="1.2"
            />
          ) : showSeams ? (
            <path
              d={`M ${sx(150)} ${hem - 26} L ${sx(206)} ${hem - 26}`}
              stroke="#14110F"
              strokeOpacity="0.18"
              strokeWidth="1.5"
              fill="none"
            />
          ) : null}
        </g>
      ))}

      {/* ---------------------------------------------------------------- */}
      {/* What shows in the jacket opening: waistcoat, or lining            */}
      {/* ---------------------------------------------------------------- */}
      {isWaistcoat ? (
        <>
          <path d={`M ${sx(256)} 120 L ${sx(344)} 120 L ${sx(348)} 470 L ${sx(252)} 470 Z`} fill={cloth} />
          {/* Waistcoat's own V and buttons.
              The buttons sit ABOVE the jacket's break point, inside the V —
              anything below it is covered by the jacket front and would be
              drawn but never seen. The V narrows towards the break, so the
              lowest button is the tightest fit. */}
          <path
            d={`M ${sx(272)} 122 L ${CX} ${brk + 26} L ${sx(328)} 122`}
            fill={liningHex}
            fillOpacity="0.9"
          />
          <g fill={buttonColorHex} stroke="#14110F" strokeOpacity="0.3" strokeWidth="0.8">
            {[brk - 100, brk - 70, brk - 40].map((cy) => (
              <circle key={cy} cx={CX} cy={cy} r="5" />
            ))}
          </g>
        </>
      ) : (
        <path
          d={`M ${sx(262)} 118 L ${CX} ${brk} L ${sx(338)} 118 Z`}
          fill={liningHex}
        />
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Jacket body — the V is cut out of this single path                */}
      {/* ---------------------------------------------------------------- */}
      {(() => {
        // A wrap jacket has no button stance: the fronts cross over instead.
        const bodyPath = isWrap
          ? `M ${sx(188)} 132
             L ${sx(262)} 118
             L ${sx(372)} 452
             L ${sx(348)} 486
             L ${sx(252)} 486
             C ${sx(246)} 420 ${sx(234)} 330 ${sx(230)} 262
             C ${sx(226)} 212 ${sx(200)} 156 ${sx(188)} 132 Z`
          : `M ${sx(188)} 132
             L ${sx(262)} 118
             L ${CX} ${brk}
             L ${sx(338)} 118
             L ${sx(412)} 132
             C ${sx(400)} 156 ${sx(374)} 212 ${sx(370)} 262
             C ${sx(366)} 330 ${sx(354)} 420 ${sx(348)} ${isMaternity ? 500 : 486}
             L ${sx(252)} ${isMaternity ? 500 : 486}
             C ${sx(246)} 420 ${sx(234)} 330 ${sx(230)} 262
             C ${sx(226)} 212 ${sx(200)} 156 ${sx(188)} 132 Z`;

        return (
          <>
            <path d={bodyPath} fill={cloth} />
            <path d={bodyPath} fill={`url(#${shadeId})`} />
            {/* Right front laps over the left on a wrap */}
            {isWrap ? (
              <>
                <path
                  d={`M ${sx(412)} 132
                      L ${sx(338)} 118
                      L ${sx(228)} 452
                      L ${sx(252)} 486
                      L ${sx(348)} 486
                      C ${sx(354)} 420 ${sx(366)} 330 ${sx(370)} 262
                      C ${sx(374)} 212 ${sx(400)} 156 ${sx(412)} 132 Z`}
                  fill={cloth}
                />
                {/* Tie belt */}
                <path
                  d={`M ${sx(232)} 352 L ${sx(368)} 352 L ${sx(368)} 382 L ${sx(232)} 382 Z`}
                  fill={cloth}
                  stroke="#14110F"
                  strokeOpacity="0.22"
                  strokeWidth="1.5"
                />
                <path
                  d={`M ${sx(292)} 382 L ${sx(276)} 448 M ${sx(308)} 382 L ${sx(324)} 448`}
                  stroke="#14110F"
                  strokeOpacity="0.22"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : null}
          </>
        );
      })()}

      {/* Maternity: the hidden expansion panels, shown as a dashed release line */}
      {isMaternity && !isWrap ? (
        <g stroke={trimHex} strokeOpacity="0.75" strokeWidth="2" strokeDasharray="7 6" fill="none">
          <path d={`M ${sx(244)} 250 C ${sx(238)} 330 ${sx(250)} 430 ${sx(256)} 496`} />
          <path d={`M ${sx(356)} 250 C ${sx(362)} 330 ${sx(350)} 430 ${sx(344)} 496`} />
        </g>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Lapels                                                            */}
      {/* ---------------------------------------------------------------- */}
      {!isWrap ? (
        [1, -1].map((side) => (
          <g key={side} transform={side === -1 ? `translate(${W},0) scale(-1,1)` : undefined}>
            <path d={lapelPath(lapel, brk, sx, CX)} fill={cloth} />
            {/* Darkened so the lapel reads as a folded-back plane, not flat cloth */}
            <path d={lapelPath(lapel, brk, sx, CX)} fill="#14110F" fillOpacity="0.13" />
            <path
              d={lapelPath(lapel, brk, sx, CX)}
              fill="none"
              stroke={trim === 'trim-gold-piping' ? trimHex : '#14110F'}
              strokeOpacity={trim === 'trim-gold-piping' ? 0.95 : 0.28}
              strokeWidth={trim === 'trim-gold-piping' ? 3 : 1.5}
            />

            {/* Contrast under-collar peeks out at the neck */}
            {trim === 'trim-contrast-undercollar' ? (
              <path
                d={`M ${sx(262)} 118 L ${sx(292)} 128 L ${sx(286)} 140 L ${sx(258)} 130 Z`}
                fill={trimHex}
              />
            ) : null}
          </g>
        ))
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Pockets                                                           */}
      {/* ---------------------------------------------------------------- */}
      {[1, -1].map((side) => (
        <g key={side} transform={side === -1 ? `translate(${W},0) scale(-1,1)` : undefined}>
          {/* Chest welt — always present on a tailored jacket */}
          {!isWrap ? (
            <path
              d={`M ${sx(246)} 246 L ${sx(288)} 238 L ${sx(288)} 248 L ${sx(246)} 256 Z`}
              fill={cloth}
              stroke="#14110F"
              strokeOpacity="0.3"
              strokeWidth="1.2"
            />
          ) : null}

          {pocket === 'pocket-flap' || pocket === 'pocket-flap-ticket' ? (
            <>
              <path
                d={`M ${sx(238)} 392 L ${sx(306)} 392 L ${sx(306)} 420 L ${sx(238)} 420 Z`}
                fill={cloth}
                stroke="#14110F"
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />
              {pocket === 'pocket-flap-ticket' ? (
                <path
                  d={`M ${sx(252)} 364 L ${sx(300)} 364 L ${sx(300)} 384 L ${sx(252)} 384 Z`}
                  fill={cloth}
                  stroke="#14110F"
                  strokeOpacity="0.3"
                  strokeWidth="1.4"
                />
              ) : null}
            </>
          ) : null}

          {pocket === 'pocket-besom' ? (
            <path
              d={`M ${sx(240)} 398 L ${sx(304)} 398 L ${sx(304)} 408 L ${sx(240)} 408 Z`}
              fill="#14110F"
              fillOpacity="0.32"
            />
          ) : null}

          {pocket === 'pocket-patch' ? (
            <path
              d={`M ${sx(240)} 388 L ${sx(306)} 388 L ${sx(306)} 442 L ${sx(240)} 442 Z`}
              fill={cloth}
              stroke="#14110F"
              strokeOpacity="0.34"
              strokeWidth="1.8"
            />
          ) : null}
        </g>
      ))}

      {/* ---------------------------------------------------------------- */}
      {/* Buttons                                                           */}
      {/* ---------------------------------------------------------------- */}
      {/* A three-piece jacket still fastens, so the waistcoat set gets these
          too — only the wrap, which ties, has no buttons at all. */}
      {!isWrap ? (
        <g>
          {buttonPositions(buttonCount, brk, isDouble).map(({ x, y, live }, i) => (
            <g key={`${x}-${y}-${i}`}>
              <circle
                cx={isDouble ? sx(x) : x}
                cy={y}
                r="8"
                fill={buttonColorHex}
                stroke="#14110F"
                strokeOpacity="0.35"
                strokeWidth="1"
                /* A decorative (non-fastening) button on a double-breasted
                   front is drawn slightly flatter so the stance still reads. */
                opacity={live ? 1 : 0.85}
              />
              <circle cx={isDouble ? sx(x) : x} cy={y} r="2.6" fill="#14110F" fillOpacity="0.35" />
            </g>
          ))}
        </g>
      ) : null}

      {/* Sleeve buttons */}
      {!isWrap && sleeve !== 'sleeve-turnback' ? (
        [1, -1].map((side) => (
          <g key={side} transform={side === -1 ? `translate(${W},0) scale(-1,1)` : undefined}>
            {[0, 1, 2].map((n) => (
              <circle
                key={n}
                cx={sx(163 + n * 13)}
                cy={hem - 14}
                r="4"
                fill={buttonColorHex}
                stroke="#14110F"
                strokeOpacity="0.3"
                strokeWidth="0.8"
              />
            ))}
          </g>
        ))
      ) : null}

      {/* Hand-embroidered cuff */}
      {trim === 'trim-embroidered-cuff'
        ? [1, -1].map((side) => (
            <g key={side} transform={side === -1 ? `translate(${W},0) scale(-1,1)` : undefined}>
              <path
                d={`M ${sx(152)} ${hem - 30} L ${sx(206)} ${hem - 30}`}
                stroke={trimHex}
                strokeWidth="4"
                strokeDasharray="3 5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M ${sx(152)} ${hem - 18} L ${sx(206)} ${hem - 18}`}
                stroke={trimHex}
                strokeWidth="2.5"
                strokeDasharray="2 6"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ))
        : null}

      {/* ---------------------------------------------------------------- */}
      {/* Seam lines                                                        */}
      {/* ---------------------------------------------------------------- */}
      {showSeams ? (
        <g stroke="#14110F" strokeOpacity="0.2" strokeWidth="1.5" fill="none">
          {/* Armhole seams */}
          <path d={`M ${sx(188)} 132 C ${sx(226)} 190 ${sx(228)} 226 ${sx(230)} 262`} />
          <path d={`M ${sx(412)} 132 C ${sx(374)} 190 ${sx(372)} 226 ${sx(370)} 262`} />
          {/* Princess seams through the body */}
          <path d={`M ${sx(258)} 210 C ${sx(252)} 300 ${sx(258)} 400 ${sx(262)} ${isMaternity ? 498 : 484}`} />
          <path d={`M ${sx(342)} 210 C ${sx(348)} 300 ${sx(342)} 400 ${sx(338)} ${isMaternity ? 498 : 484}`} />
          {/* Collar band */}
          {!isWrap ? <path d={`M ${sx(262)} 118 L ${CX} 106 L ${sx(338)} 118`} /> : null}
        </g>
      ) : null}

      {/* Monogram, embroidered inside the left facing.
          Sits low on the left front, below the pockets (which end at y 442)
          and clear of the hem. It must NOT sit near the centre line: a
          one-button jacket breaks as low as y 316, and a double-breasted
          front carries buttons down to y 384 — an earlier position at
          y 330 painted straight over the button stance. */}
      {monogram ? (
        <text
          x={sx(244)}
          y="468"
          fontSize="15"
          fontFamily="Georgia, serif"
          letterSpacing="2"
          fill={trimHex}
          opacity="0.9"
        >
          {monogram.toUpperCase().slice(0, 4)}
        </text>
      ) : null}

      {/* Bespoke artwork uploaded through /studio wins over the vectors */}
      {overlays.map((url) => (
        <image key={url} href={url} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid meet" />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Option geometry
// ---------------------------------------------------------------------------

/** Left-hand lapel; the right is the same path mirrored by the caller. */
function lapelPath(
  lapel: string,
  brk: number,
  sx: (n: number) => number,
  cx: number,
): string {
  switch (lapel) {
    case 'lapel-peak':
      // Points sweep upward towards the shoulder.
      return `M ${sx(266)} 120
              L ${cx - 2} ${brk - 130}
              L ${cx - 2} ${brk}
              L ${sx(248)} ${brk - 66}
              L ${sx(216)} 166
              L ${sx(246)} 176
              L ${sx(240)} 148 Z`;

    case 'lapel-shawl':
      // One unbroken curve, no notch, no points.
      return `M ${sx(268)} 118
              C ${sx(292)} 148 ${cx - 4} ${brk - 120} ${cx - 2} ${brk}
              C ${sx(268)} ${brk - 46} ${sx(236)} 232 ${sx(232)} 170
              C ${sx(236)} 138 ${sx(250)} 120 ${sx(268)} 118 Z`;

    case 'lapel-notch':
    default:
      // The step-and-gap of a standard notch.
      return `M ${sx(266)} 120
              L ${cx - 2} ${brk - 128}
              L ${cx - 2} ${brk}
              L ${sx(246)} ${brk - 74}
              L ${sx(238)} 196
              L ${sx(220)} 190
              L ${sx(236)} 150 Z`;
  }
}

/** Button coordinates. `live` marks the ones that actually fasten. */
function buttonPositions(buttonCount: string, brk: number, isDouble: boolean) {
  if (isDouble) {
    // Six-button double-breasted: two columns, only the lower pair fastens.
    const rows = [brk, brk + 46, brk + 92];
    return rows.flatMap((y, rowIndex) => [
      { x: 262, y, live: rowIndex === 1 },
      { x: 338, y, live: rowIndex === 1 },
    ]);
  }

  const cx = W / 2;
  switch (buttonCount) {
    case 'buttons-one':
      return [{ x: cx, y: brk, live: true }];
    case 'buttons-three':
      return [
        { x: cx, y: brk, live: true },
        { x: cx, y: brk + 44, live: true },
        { x: cx, y: brk + 88, live: false },
      ];
    default:
      return [
        { x: cx, y: brk, live: true },
        { x: cx, y: brk + 48, live: false },
      ];
  }
}

/**
 * Alt text for the preview. Screen-reader users get the same information the
 * drawing carries, which is the only reason the drawing exists.
 */
function describe(config: GarmentConfig): string {
  const parts: string[] = ['Preview:'];

  const styleNames: Record<string, string> = {
    'blazer-trouser': 'blazer and trouser',
    'blazer-skirt': 'blazer and skirt',
    'waistcoat-set': 'three-piece waistcoat set',
    'wrap-suit': 'wrap jacket and trouser',
    'maternity-set': 'maternity-adjustable set',
  };
  parts.push(styleNames[config.baseStyleSlug] ?? 'suit');

  if (config.fabric) parts.push(`in ${config.fabric.family.toLowerCase().replace('_', '-')}`);

  const labels: Record<string, string> = {
    'lapel-notch': 'notch lapel',
    'lapel-peak': 'peak lapel',
    'lapel-shawl': 'shawl collar',
    'closure-double': 'double-breasted',
    'pocket-flap': 'flap pockets',
    'pocket-besom': 'besom pockets',
    'pocket-patch': 'patch pockets',
    'pocket-flap-ticket': 'flap pockets with a ticket pocket',
    'sleeve-three-quarter': 'three-quarter sleeves',
    'sleeve-turnback': 'turn-back cuffs',
  };

  for (const slug of [config.lapel, config.closure, config.pocket, config.sleeve]) {
    if (slug && labels[slug]) parts.push(`, ${labels[slug]}`);
  }

  parts.push(`, ${config.fit.toLowerCase()} fit`);
  return parts.join(' ').replace(/\s+,/g, ',');
}
