/**
 * Writes /public/placeholders/*.svg and README-ASSETS.md from ASSET_SLOTS.
 *
 * Run with: npm run assets:placeholders
 *
 * The output SVGs are deliberately plain: a brand-colour panel, a corner
 * crop-mark rule, the slot name, the exact pixel dimensions and the word
 * PLACEHOLDER. They must never be mistaken for finished photography, and they
 * must never depict a person. When Prisca uploads the real shot through
 * /studio the database URL replaces the placeholder path and this file is
 * never consulted again.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ASSET_SLOTS, TONE_HEX, type AssetSlot } from './asset-manifest';

const OUT_DIR = join(process.cwd(), 'public', 'placeholders');

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Naive word wrap for the SVG label, which has no text layout engine. */
function wrap(text: string, maxChars: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > maxChars) {
      if (line) lines.push(line.trim());
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = `${line} ${word}`;
    }
  }
  if (line && lines.length < maxLines) lines.push(line.trim());
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, maxChars - 1)}…`;
  }
  return lines;
}

function placeholderSvg(slot: AssetSlot) {
  const [panel, label] = TONE_HEX[slot.tone ?? 'emerald'];
  const { width: w, height: h, name } = slot;
  const short = Math.min(w, h);

  // Scale type off the short edge so a 1080 square and a 2400 banner both read.
  const titleSize = Math.max(18, Math.round(short * 0.055));
  const metaSize = Math.max(11, Math.round(short * 0.026));
  const tagSize = Math.max(9, Math.round(short * 0.019));
  const pad = Math.round(short * 0.07);
  const mark = Math.round(short * 0.05);

  const briefLines = wrap(slot.brief, Math.round(w / (metaSize * 0.52)), 3);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Placeholder for ${escapeXml(slot.where)}">
  <rect width="${w}" height="${h}" fill="${panel}"/>
  <g stroke="${label}" stroke-opacity="0.35" stroke-width="${Math.max(1, Math.round(short * 0.003))}" fill="none">
    <path d="M${pad} ${pad + mark}V${pad}h${mark}"/>
    <path d="M${w - pad - mark} ${pad}h${mark}v${mark}"/>
    <path d="M${w - pad} ${h - pad - mark}v${mark}h-${mark}"/>
    <path d="M${pad + mark} ${h - pad}h-${mark}v-${mark}"/>
  </g>
  <g font-family="Georgia, 'Times New Roman', serif" fill="${label}" text-anchor="middle">
    <text x="${w / 2}" y="${h / 2 - titleSize * 0.35}" font-size="${titleSize}" letter-spacing="${titleSize * 0.02}">${escapeXml(slot.where)}</text>
  </g>
  <g font-family="Helvetica, Arial, sans-serif" fill="${label}" fill-opacity="0.8" text-anchor="middle">
    <text x="${w / 2}" y="${h / 2 + titleSize * 0.9}" font-size="${metaSize}" letter-spacing="${metaSize * 0.18}">${w} × ${h}</text>
${briefLines
  .map(
    (line, i) =>
      `    <text x="${w / 2}" y="${h / 2 + titleSize * 0.9 + metaSize * (2 + i * 1.5)}" font-size="${metaSize * 0.82}" fill-opacity="0.62">${escapeXml(line)}</text>`,
  )
  .join('\n')}
  </g>
  <g font-family="Helvetica, Arial, sans-serif" fill="${label}" fill-opacity="0.55" font-size="${tagSize}" letter-spacing="${tagSize * 0.28}">
    <text x="${pad}" y="${pad - tagSize * 0.4}">PLACEHOLDER — NOT FINAL ARTWORK</text>
    <text x="${pad}" y="${h - pad + tagSize * 1.4}">${escapeXml(name)}.svg</text>
  </g>
</svg>
`;
}

function readmeAssets() {
  const groups = new Map<string, AssetSlot[]>();
  for (const slot of ASSET_SLOTS) {
    if (!groups.has(slot.group)) groups.set(slot.group, []);
    groups.get(slot.group)!.push(slot);
  }

  const lines: string[] = [
    '# Asset brief — Preeskahmour',
    '',
    '> Generated from `scripts/asset-manifest.ts`. Re-run `npm run assets:placeholders`',
    '> after editing that file; do not hand-edit this document.',
    '',
    '## What this is',
    '',
    'Every image slot on the site, with the exact pixel size it needs and a note',
    'on what the shot should be. Right now each slot holds a flat coloured',
    'placeholder SVG in `public/placeholders/` carrying its own filename and',
    'dimensions — so an unshot slot is obvious in the layout rather than quietly',
    'looking finished.',
    '',
    '**No real photograph of any real person appears anywhere in this repository.**',
    'Nothing here was scraped from Instagram or anywhere else. Every placeholder is',
    'a generated colour panel, and every fabric swatch is an original geometric SVG',
    '(see `src/lib/swatches.ts`) rather than a reproduction of a real textile print.',
    '',
    '## How to replace a placeholder',
    '',
    '1. Sign in at `/studio` with the owner account.',
    '2. Find the record — Fabrics, Products, Lookbook, Collections, or',
    '   **Content** for the marketing-page slots (hero, story, How It Works…).',
    '3. Upload the image. It goes to Cloudinary and the database URL replaces the',
    '   placeholder path immediately. No deploy, no developer.',
    '',
    'Nothing in `public/placeholders/` needs to be deleted — once a real URL is',
    'saved, the placeholder is simply never requested again.',
    '',
    '## House-wide art direction',
    '',
    '- **Palette on set:** deep emerald, aso-oke gold, burnt terracotta, adire',
    '  indigo, unbleached ivory. Backgrounds are cream or plaster — never pure white,',
    '  never grey seamless.',
    '- **Light:** one warm key, deliberately unfilled shadow. We want contrast and',
    '  shape, not flat e-commerce lighting.',
    '- **Casting:** Nigerian women across a genuine range of ages, body shapes and',
    '  skin tones. At least one visibly pregnant model in every seasonal shoot.',
    '- **Styling:** the garment is the subject. Minimal jewellery, no busy props,',
    '  nothing that dates the picture to one season.',
    '- **Retouching:** clean the cloth, not the person. Do not smooth skin or',
    '  reshape bodies. Keep the texture of the weave — it is the entire point.',
    '- **Delivery:** sRGB JPEG at 85% quality, long edge at least the size listed',
    '  below. Cloudinary handles all resizing and WebP/AVIF conversion.',
    '',
    '## Also needed, not listed below',
    '',
    '- **Fabric swatches** — one flat, evenly lit, colour-accurate square per fabric,',
    '  at least 1200×1200, shot directly overhead on cream. These upload against each',
    '  fabric in `/studio → Fabrics`. Until then the site draws an original',
    '  procedural pattern in the right colour family.',
    '- **Fabric detail shots** — the same cloth made up into a garment, 1400×1000.',
    '- **Hero video (optional)** — the homepage hero accepts an MP4 instead of a',
    '  still. 10–15s, silent, looping, no cuts. Under 6MB, H.264, 1920×1080.',
    '',
  ];

  let total = 0;
  for (const [group, slots] of groups) {
    lines.push(`## ${group}`, '');
    lines.push('| Slot | Where it appears | Size (px) | Brief |');
    lines.push('| --- | --- | --- | --- |');
    for (const slot of slots) {
      total += 1;
      lines.push(
        `| \`${slot.name}.svg\` | ${slot.where} | ${slot.width}×${slot.height} | ${slot.brief.replace(/\|/g, '\\|')} |`,
      );
    }
    lines.push('');
  }

  lines.push('---', '', `**${total} image slots** in total.`, '');
  return lines.join('\n');
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  for (const slot of ASSET_SLOTS) {
    writeFileSync(join(OUT_DIR, `${slot.name}.svg`), placeholderSvg(slot), 'utf8');
  }

  writeFileSync(join(process.cwd(), 'README-ASSETS.md'), readmeAssets(), 'utf8');

  console.log(`✔ wrote ${ASSET_SLOTS.length} placeholders to public/placeholders`);
  console.log('✔ wrote README-ASSETS.md');
}

main();
