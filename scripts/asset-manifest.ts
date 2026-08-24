/**
 * Every image slot on the site, in one list.
 *
 * This file is the single source of truth for three things:
 *   1. the placeholder SVGs written into /public/placeholders
 *   2. README-ASSETS.md, the brief Prisca hands to her photographer
 *   3. the art-direction notes shown beside each upload field in /studio
 *
 * NOTHING here is a real photograph and nothing depicts a real person. Each
 * placeholder is a flat brand-colour panel carrying its own filename, pixel
 * dimensions and shot note, so an unshot slot is obvious at a glance in the
 * layout rather than silently looking "done".
 */

export type AssetSlot = {
  /** Filename without extension; becomes /placeholders/<name>.svg */
  name: string;
  /** Where it appears, for the brief. */
  where: string;
  width: number;
  height: number;
  /** The art direction. Written for a photographer, not a developer. */
  brief: string;
  /** Which brand colour the placeholder panel uses. */
  tone?: 'emerald' | 'indigo' | 'terracotta' | 'gold' | 'ink' | 'cream';
  /** Group heading in README-ASSETS.md. */
  group: string;
};

const P = (
  name: string,
  where: string,
  width: number,
  height: number,
  brief: string,
  group: string,
  tone: AssetSlot['tone'] = 'emerald',
): AssetSlot => ({ name, where, width, height, brief, group, tone });

export const ASSET_SLOTS: AssetSlot[] = [
  // --- Global ---------------------------------------------------------------
  P(
    'og-default',
    'Default social share card',
    1200,
    630,
    'Wordmark on deep emerald with a single folded length of aso-oke entering from the right. Must read at thumbnail size — no small type.',
    'Global',
    'emerald',
  ),

  // --- Homepage -------------------------------------------------------------
  P(
    'home-hero',
    'Homepage hero (full bleed)',
    2400,
    1500,
    'THE most important shot on the site. Model standing three-quarter to camera in an emerald aso-oke blazer with peak lapel and a wide-leg trouser. Warm studio key from camera left, deep unfilled shadow on the right of her body. Cream seamless backdrop. Compose loose and leave the right third visually quiet — the headline and buttons sit there. Shoot a 9:16 crop of the same setup for mobile.',
    'Homepage',
    'emerald',
  ),
  P(
    'story-teaser',
    'Homepage — founder story block',
    1200,
    1500,
    'Prisca at the cutting table, tape around her neck, chalk in hand, caught mid-work rather than posed to camera. Natural window light, warm. Pattern paper and cloth in the near foreground, slightly out of focus.',
    'Homepage',
    'ink',
  ),
  P(
    'builder-promo',
    'Homepage — builder promo block',
    1400,
    1000,
    'Extreme close on a finished peak lapel with a contrast adire under-collar and horn buttons. Raking side light so every stitch reads. Shallow depth of field, focus on the buttonhole.',
    'Homepage',
    'indigo',
  ),
  ...Array.from({ length: 6 }, (_, i) =>
    P(
      `instagram-${i + 1}`,
      'Homepage — Instagram strip',
      1080,
      1080,
      'Square crop pulled straight from the @preeskahmour grid once the shoot is live. Across the six: two full looks, two fabric details, one atelier process shot, one client portrait. Keep the crop centred — this grid crops hard on mobile.',
      'Homepage',
      i % 2 === 0 ? 'terracotta' : 'indigo',
    ),
  ),

  // --- Occasion tiles -------------------------------------------------------
  P('tile-corporate', 'Occasion tile — Corporate', 900, 1200, 'Woman in charcoal or navy worsted, single-breasted, mid-stride in an architectural setting. Cool, controlled, no smile.', 'Occasion tiles', 'ink'),
  P('tile-bridal', 'Occasion tile — Bridal', 900, 1200, 'Ivory silk or white George trouser suit with hand embroidery at the cuff. Soft, high-key, veil or gele optional. Shot against warm cream.', 'Occasion tiles', 'cream'),
  P('tile-maternity', 'Occasion tile — Maternity', 900, 1200, 'Visibly pregnant model in an adire maternity blazer, hand resting naturally at the side, not cradling the bump. Show that it reads as tailoring, not as maternity wear.', 'Occasion tiles', 'indigo'),
  P('tile-party', 'Occasion tile — Party', 900, 1200, 'Aso-oke or sequinned georgette, movement in the hem, shot slightly darker with a warm practical light in frame. Evening energy.', 'Occasion tiles', 'terracotta'),
  P('tile-everyday', 'Occasion tile — Everyday', 900, 1200, 'Linen or light Ankara, relaxed shoulder, worn with flats on a Lagos street. Documentary feel, natural light.', 'Occasion tiles', 'gold'),

  // --- How it works ---------------------------------------------------------
  P('how-it-works-hero', 'How It Works — hero', 2400, 1200, 'Hands pinning a canvassed jacket front onto a dress form. Atelier visible behind but soft. Warm, low contrast, unhurried.', 'How It Works', 'emerald'),
  P('step-design', 'How It Works — step 1', 1200, 900, 'Phone in hand showing the builder mid-configuration, with real fabric swatches fanned on the table beneath it.', 'How It Works', 'cream'),
  P('step-measure', 'How It Works — step 2', 1200, 900, 'Tape measure drawn across a shoulder line, the tailor’s hands in frame. Close crop, no face needed.', 'How It Works', 'ink'),
  P('step-tailor', 'How It Works — step 3', 1200, 900, 'Machinist at an industrial machine, shallow focus on hands and needle, warmth of the atelier behind.', 'How It Works', 'emerald'),
  P('step-delivered', 'How It Works — step 4', 1200, 900, 'Deep emerald garment box with the gold foil wordmark, tissue and ribbon, shot overhead on a cream surface.', 'How It Works', 'gold'),

  // --- Measurement guide ----------------------------------------------------
  P(
    'measurement-diagram',
    'Measurement Guide — diagram',
    1200,
    1600,
    'ILLUSTRATION, not a photograph. Line-drawn figure front and back with numbered call-outs for every measurement we collect. Ink line on cream, gold call-out numbers, no shading. Commission this from an illustrator — a photo will not work here.',
    'Measurement Guide',
    'cream',
  ),

  // --- Our story ------------------------------------------------------------
  P('story-hero', 'Our Story — hero', 2400, 1300, 'Wide of the atelier: cutting table, bolts standing on end, dress forms, a machinist at the back. Natural light, completely unstaged.', 'Our Story', 'emerald'),
  P('story-portrait', 'Our Story — founder portrait', 1200, 1500, 'Prisca to camera, arms folded, wearing her own tailoring. Serious and warm; a smile is not required. Plain cream or deep emerald ground. This is the portrait press will reuse — shoot it properly.', 'Our Story', 'ink'),
  P('story-process', 'Our Story — process inset', 1400, 1000, 'Tailor’s chalk marks and pattern weights on adire laid flat, shears in frame. Shot from directly overhead.', 'Our Story', 'indigo'),

  // --- Corporate ------------------------------------------------------------
  P('corporate-hero', 'Corporate & Bulk — hero', 2400, 1300, 'Six women in coordinated but not identical suiting — same cloth, different cuts. Corporate lobby or clean architecture. Confident, not stiff, not a stock-photo huddle.', 'Corporate', 'ink'),

  // --- Collections ----------------------------------------------------------
  P('collection-harmattan-hero', 'Collection — Harmattan hero', 2400, 1300, 'Dry-season palette: dust, ochre, deep indigo. Model in aso-oke against a bare wall in raking late light.', 'Collections', 'terracotta'),
  P('collection-harmattan-tile', 'Collection — Harmattan tile', 900, 1100, 'Vertical crop of the Harmattan hero look, tighter on the garment.', 'Collections', 'terracotta'),
  P('collection-boardroom-hero', 'Collection — Boardroom hero', 2400, 1300, 'Worsted wool and quiet adire in an office setting. Cool light, hard shadows, glass and concrete.', 'Collections', 'ink'),
  P('collection-boardroom-tile', 'Collection — Boardroom tile', 900, 1100, 'Vertical crop of the Boardroom look.', 'Collections', 'ink'),
  P('collection-vows-hero', 'Collection — Vows hero', 2400, 1300, 'Bridal party in ivory and gold, shot in soft window light. Group composition with room for type on the left.', 'Collections', 'cream'),
  P('collection-vows-tile', 'Collection — Vows tile', 900, 1100, 'Vertical crop of the bridal look, focus on the embroidered cuff.', 'Collections', 'cream'),
  P('collection-nine-months-hero', 'Collection — Nine Months hero', 2400, 1300, 'Maternity tailoring, three models at different stages of pregnancy, same cloth. Warm, plain ground.', 'Collections', 'indigo'),
  P('collection-nine-months-tile', 'Collection — Nine Months tile', 900, 1100, 'Vertical crop showing the side expansion panel detail.', 'Collections', 'indigo'),

  // --- Products -------------------------------------------------------------
  ...PRODUCT_SLOTS(),

  // --- Lookbook -------------------------------------------------------------
  ...LOOKBOOK_SLOTS(),

  // --- Journal --------------------------------------------------------------
  P('journal-adire', 'Journal — Adire article cover', 1600, 1000, 'Indigo dye pit in Abeokuta, cloth being lifted dripping from the vat. Documentary, no styling.', 'Journal', 'indigo'),
  P('journal-first-suit', 'Journal — First suit article cover', 1600, 1000, 'A single jacket on a wooden hanger against a plain wall. Quiet, still-life.', 'Journal', 'cream'),
  P('journal-maternity', 'Journal — Maternity article cover', 1600, 1000, 'Close on the hidden expansion panel, hand pulling it open to show the mechanism.', 'Journal', 'emerald'),
  P('journal-asooke', 'Journal — Aso-oke article cover', 1600, 1000, 'Narrow loom in Iseyin, weaver’s hands and the strip forming. Warm, dusty light.', 'Journal', 'gold'),
  P('journal-corporate', 'Journal — Corporate article cover', 1600, 1000, 'Rail of finished corporate suiting in one cloth, different cuts, in the atelier.', 'Journal', 'ink'),
  P('journal-care', 'Journal — Fabric care article cover', 1600, 1000, 'Iron and pressing cloth on a sleeve board, steam visible. Domestic, warm.', 'Journal', 'terracotta'),
];

function PRODUCT_SLOTS(): AssetSlot[] {
  const products: [string, string, AssetSlot['tone']][] = [
    ['itan-emerald-two-piece', 'Ìtàn Emerald Two-Piece', 'emerald'],
    ['abeokuta-adire-blazer', 'Abéòkúta Adire Blazer', 'indigo'],
    ['iseyin-asooke-suit', 'Ìseyìn Aso-oke Suit', 'gold'],
    ['boardroom-worsted-trouser-suit', 'Boardroom Worsted Trouser Suit', 'ink'],
    ['ileke-bridal-trouser-suit', 'Ìlèkè Bridal Trouser Suit', 'cream'],
    ['nine-months-adire-set', 'Nine Months Adire Set', 'indigo'],
    ['harmattan-linen-set', 'Harmattan Linen Set', 'terracotta'],
    ['oru-party-tuxedo', 'Òru Party Tuxedo', 'ink'],
    ['akwete-waistcoat-set', 'Akwete Waistcoat Set', 'terracotta'],
    ['ankara-wrap-suit', 'Ankara Wrap Suit', 'emerald'],
    ['george-evening-column', 'George Evening Column', 'gold'],
    ['ekiti-everyday-blazer', 'Èkìtì Everyday Blazer', 'cream'],
  ];

  return products.flatMap(([slug, name, tone]) => [
    P(
      `product-${slug}-1`,
      `${name} — primary`,
      1000,
      1333,
      `Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins.`,
      'Products',
      tone,
    ),
    P(
      `product-${slug}-2`,
      `${name} — movement`,
      1000,
      1333,
      `Three-quarter or walking frame of the same look, showing drape and how the cloth moves.`,
      'Products',
      tone,
    ),
    P(
      `product-${slug}-3`,
      `${name} — detail`,
      1000,
      1333,
      `Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing.`,
      'Products',
      tone,
    ),
  ]);
}

function LOOKBOOK_SLOTS(): AssetSlot[] {
  const briefs: [string, number, number, string, AssetSlot['tone']][] = [
    ['lookbook-01', 1200, 1600, 'Full look, emerald aso-oke suit, standing against a bare plaster wall.', 'emerald'],
    ['lookbook-02', 1200, 900, 'Wide, two models seated, contrasting cloth, editorial spread feel.', 'indigo'],
    ['lookbook-03', 1200, 1600, 'Back view showing the jacket seam line and vent.', 'ink'],
    ['lookbook-04', 1200, 1600, 'Bridal ivory George, cropped at the knee, hands and embroidery in focus.', 'cream'],
    ['lookbook-05', 1200, 900, 'Detail: stacked bolts of cloth, colour blocked.', 'terracotta'],
    ['lookbook-06', 1200, 1600, 'Maternity look, model in profile against warm light.', 'indigo'],
    ['lookbook-07', 1200, 1600, 'Corporate look, mid-stride, hard architectural shadow.', 'ink'],
    ['lookbook-08', 1200, 900, 'Atelier process, hands and shears on adire.', 'emerald'],
    ['lookbook-09', 1200, 1600, 'Party look, movement blur in the hem, warm practical light.', 'terracotta'],
    ['lookbook-10', 1200, 1600, 'Everyday linen, flat shoes, street context.', 'gold'],
    ['lookbook-11', 1200, 900, 'Group of three, same cloth, different cuts.', 'emerald'],
    ['lookbook-12', 1200, 1600, 'Close portrait, gele and tailored shoulder, direct gaze.', 'indigo'],
  ];

  return briefs.map(([name, w, h, brief, tone]) =>
    P(name, 'Lookbook masonry grid', w, h, brief, 'Lookbook', tone),
  );
}

export const TONE_HEX: Record<NonNullable<AssetSlot['tone']>, [string, string]> = {
  // [panel, label] — label must stay legible on the panel.
  emerald: ['#0B4D3F', '#E2C88F'],
  indigo: ['#23335C', '#E2C88F'],
  terracotta: ['#B45A3C', '#FBF8F3'],
  gold: ['#C6A15B', '#14110F'],
  ink: ['#14110F', '#C6A15B'],
  cream: ['#E7DBC7', '#5B5350'],
};
