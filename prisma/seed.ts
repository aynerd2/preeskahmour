/**
 * Seed data for Preeskahmour.
 *
 * Run with `npm run db:seed` (which pushes the schema first, so a clean clone
 * with an empty database works in one command).
 *
 * The script is idempotent: every write is an upsert keyed on a stable slug,
 * so it can be re-run against an existing database without duplicating rows or
 * clobbering images Prisca has already uploaded through /studio.
 *
 * Prices are integer kobo. NGN 145,000 is written 145_000_00.
 */

import { PrismaClient, type Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { DEFAULT_CONTENT, CONTENT_META, type SiteContentKey } from '../src/lib/site-content';

const prisma = new PrismaClient();

const ph = (name: string) => `/placeholders/${name}.svg`;

// ---------------------------------------------------------------------------
// Fabrics
// ---------------------------------------------------------------------------

const FABRICS: Prisma.FabricCreateInput[] = [
  // --- Adire ---------------------------------------------------------------
  {
    slug: 'adire-eleko-indigo',
    name: 'Adire Eléko Indigo',
    family: 'ADIRE',
    weight: 'MID',
    colorName: 'Deep indigo & chalk',
    colorHex: '#23335C',
    colorTags: ['indigo', 'blue', 'white'],
    pricePerMeterKobo: 8_500_00,
    composition: '100% cotton, cassava-paste resist, natural indigo',
    gsm: 190,
    widthCm: 115,
    origin: 'Abeokuta, Ogun State',
    artisanNote:
      'Resist paste is applied by hand with a feather quill, then the cloth goes through four indigo baths. Every length is slightly different — that is the point, and we will not pretend otherwise.',
    occasions: ['CORPORATE', 'EVERYDAY', 'MATERNITY'],
    isFeatured: true,
    sortOrder: 1,
    description:
      'The house cloth. Dense enough to canvas properly, soft enough to wear all day in Lagos heat.',
  },
  {
    slug: 'adire-oniko-chalk',
    name: 'Adire Onìkò Chalk',
    family: 'ADIRE',
    weight: 'LIGHT',
    colorName: 'Pale indigo & bone',
    colorHex: '#4A6396',
    colorTags: ['indigo', 'blue', 'cream'],
    pricePerMeterKobo: 7_800_00,
    composition: '100% cotton, raffia-tied resist',
    gsm: 150,
    widthCm: 115,
    origin: 'Abeokuta, Ogun State',
    artisanNote: 'Tied with raffia before dyeing, which leaves the small starburst rings.',
    occasions: ['EVERYDAY', 'PARTY', 'MATERNITY'],
    sortOrder: 2,
  },
  {
    slug: 'adire-alabere-slate',
    name: 'Adire Alábẹ́rẹ́ Slate',
    family: 'ADIRE',
    weight: 'MID',
    colorName: 'Slate & smoke',
    colorHex: '#3C4A5C',
    colorTags: ['grey', 'indigo'],
    pricePerMeterKobo: 9_200_00,
    composition: '100% cotton, stitch-resist',
    gsm: 200,
    widthCm: 115,
    origin: 'Ibadan, Oyo State',
    artisanNote: 'Stitch-resist, unpicked by hand after dyeing. Reads almost as a suiting check.',
    occasions: ['CORPORATE', 'EVERYDAY'],
    sortOrder: 3,
  },

  // --- Aso-oke -------------------------------------------------------------
  {
    slug: 'asooke-etu-emerald',
    name: 'Aso-oke Etu Emerald',
    family: 'ASO_OKE',
    weight: 'HEAVY',
    colorName: 'Emerald & black',
    colorHex: '#0B4D3F',
    colorTags: ['green', 'emerald', 'black'],
    pricePerMeterKobo: 14_000_00,
    composition: '70% cotton, 30% viscose, hand-loomed',
    gsm: 320,
    widthCm: 55,
    origin: 'Iseyin, Oyo State',
    artisanNote:
      'Woven in 55cm strips on a narrow loom and joined by hand. Four metres is roughly two days of one weaver’s work.',
    occasions: ['BRIDAL', 'PARTY', 'CORPORATE'],
    isFeatured: true,
    sortOrder: 4,
    description: 'The cloth the house is named for. Structural, weighty, holds a shoulder line.',
  },
  {
    slug: 'asooke-sanyan-gold',
    name: 'Aso-oke Sányán Gold',
    family: 'ASO_OKE',
    weight: 'HEAVY',
    colorName: 'Antique gold',
    colorHex: '#C6A15B',
    colorTags: ['gold', 'brown', 'beige'],
    pricePerMeterKobo: 16_500_00,
    composition: '60% cotton, 40% wild silk, hand-loomed',
    gsm: 340,
    widthCm: 55,
    origin: 'Iseyin, Oyo State',
    artisanNote: 'Sányán uses wild silk from the anaphe moth — the beige is the natural fibre colour.',
    occasions: ['BRIDAL', 'PARTY'],
    isFeatured: true,
    sortOrder: 5,
  },
  {
    slug: 'asooke-alaari-crimson',
    name: 'Aso-oke Alárì Crimson',
    family: 'ASO_OKE',
    weight: 'HEAVY',
    colorName: 'Crimson & gold thread',
    colorHex: '#8A2B2B',
    colorTags: ['red', 'crimson', 'gold'],
    pricePerMeterKobo: 15_000_00,
    composition: '65% cotton, 35% viscose with metallic weft',
    gsm: 330,
    widthCm: 55,
    origin: 'Iseyin, Oyo State',
    occasions: ['BRIDAL', 'PARTY'],
    sortOrder: 6,
  },

  // --- Ankara --------------------------------------------------------------
  {
    slug: 'ankara-oju-eja-emerald',
    name: 'Ankara Ojú Ẹja Emerald',
    family: 'ANKARA',
    weight: 'MID',
    colorName: 'Emerald & ochre',
    colorHex: '#126B57',
    colorTags: ['green', 'emerald', 'gold'],
    pricePerMeterKobo: 4_500_00,
    composition: '100% cotton, Dutch wax',
    gsm: 175,
    widthCm: 120,
    origin: 'Wax print, finished in Lagos',
    occasions: ['EVERYDAY', 'PARTY', 'MATERNITY'],
    isFeatured: true,
    sortOrder: 7,
    description: 'A true wax print — the crackle in the ground is the wax, not a fault.',
  },
  {
    slug: 'ankara-kente-sun-terracotta',
    name: 'Ankara Sun Terracotta',
    family: 'ANKARA',
    weight: 'MID',
    colorName: 'Burnt orange & cream',
    colorHex: '#B45A3C',
    colorTags: ['orange', 'terracotta', 'cream'],
    pricePerMeterKobo: 4_800_00,
    composition: '100% cotton, Dutch wax',
    gsm: 175,
    widthCm: 120,
    occasions: ['EVERYDAY', 'PARTY'],
    sortOrder: 8,
  },
  {
    slug: 'ankara-cowrie-indigo',
    name: 'Ankara Cowrie Indigo',
    family: 'ANKARA',
    weight: 'MID',
    colorName: 'Indigo & bone',
    colorHex: '#1F3560',
    colorTags: ['indigo', 'blue', 'cream'],
    pricePerMeterKobo: 4_500_00,
    composition: '100% cotton, Dutch wax',
    gsm: 175,
    widthCm: 120,
    occasions: ['EVERYDAY', 'CORPORATE', 'MATERNITY'],
    sortOrder: 9,
  },

  // --- Akwete --------------------------------------------------------------
  {
    slug: 'akwete-ikaki-terracotta',
    name: 'Akwete Ìkaki Terracotta',
    family: 'AKWETE',
    weight: 'HEAVY',
    colorName: 'Terracotta & ivory',
    colorHex: '#A34E30',
    colorTags: ['terracotta', 'orange', 'cream'],
    pricePerMeterKobo: 11_000_00,
    composition: '100% cotton, hand-woven',
    gsm: 300,
    widthCm: 100,
    origin: 'Akwete, Abia State',
    artisanNote:
      'Woven by women on upright looms in Akwete. The raised motifs are supplementary weft, worked in without a pattern draft.',
    occasions: ['PARTY', 'BRIDAL', 'EVERYDAY'],
    isFeatured: true,
    sortOrder: 10,
  },
  {
    slug: 'akwete-ebe-olive',
    name: 'Akwete Ebe Olive',
    family: 'AKWETE',
    weight: 'HEAVY',
    colorName: 'Olive & bronze',
    colorHex: '#4B5B3A',
    colorTags: ['green', 'olive', 'bronze'],
    pricePerMeterKobo: 11_500_00,
    composition: '100% cotton, hand-woven',
    gsm: 305,
    widthCm: 100,
    origin: 'Akwete, Abia State',
    occasions: ['CORPORATE', 'EVERYDAY'],
    sortOrder: 11,
  },

  // --- George & brocade ----------------------------------------------------
  {
    slug: 'george-brocade-ivory',
    name: 'George Brocade Ivory',
    family: 'GEORGE',
    weight: 'HEAVY',
    colorName: 'Ivory & pearl',
    colorHex: '#EDE3D2',
    colorTags: ['ivory', 'cream', 'white'],
    pricePerMeterKobo: 16_000_00,
    composition: '80% viscose, 20% cotton jacquard',
    gsm: 350,
    widthCm: 130,
    occasions: ['BRIDAL', 'PARTY'],
    isFeatured: true,
    sortOrder: 12,
    description: 'The bridal cloth. Heavy enough to hold an architectural shoulder without padding.',
  },
  {
    slug: 'george-damask-wine',
    name: 'George Damask Wine',
    family: 'GEORGE',
    weight: 'HEAVY',
    colorName: 'Deep wine',
    colorHex: '#5C1F33',
    colorTags: ['red', 'wine', 'purple'],
    pricePerMeterKobo: 15_500_00,
    composition: '80% viscose, 20% cotton jacquard',
    gsm: 345,
    widthCm: 130,
    occasions: ['PARTY', 'BRIDAL'],
    sortOrder: 13,
  },

  // --- Kente-inspired ------------------------------------------------------
  {
    slug: 'kente-adweneasa-gold',
    name: 'Kente-Inspired Adweneasa',
    family: 'KENTE',
    weight: 'MID',
    colorName: 'Gold, emerald & black',
    colorHex: '#C8A032',
    colorTags: ['gold', 'green', 'black'],
    pricePerMeterKobo: 13_000_00,
    composition: '55% silk, 45% cotton, narrow-strip weave',
    gsm: 240,
    widthCm: 60,
    origin: 'Narrow-strip weave, woven to our own colourway',
    artisanNote:
      'Woven to a colourway we designed rather than copied — traditional Asante patterns carry specific meanings and are not ours to reproduce.',
    occasions: ['PARTY', 'BRIDAL'],
    sortOrder: 14,
  },

  // --- Wool ----------------------------------------------------------------
  {
    slug: 'wool-super130-charcoal',
    name: 'Super 130s Charcoal',
    family: 'WOOL',
    weight: 'MID',
    colorName: 'Charcoal',
    colorHex: '#33363B',
    colorTags: ['grey', 'charcoal', 'black'],
    pricePerMeterKobo: 22_000_00,
    composition: '100% Super 130s worsted wool',
    gsm: 260,
    widthCm: 150,
    origin: 'Biella, Italy',
    occasions: ['CORPORATE', 'BRIDAL'],
    isFeatured: true,
    sortOrder: 15,
    description: 'The boardroom backbone. Fine, matte, and it presses like a dream.',
  },
  {
    slug: 'wool-super110-navy',
    name: 'Super 110s Navy',
    family: 'WOOL',
    weight: 'MID',
    colorName: 'Midnight navy',
    colorHex: '#22304F',
    colorTags: ['navy', 'blue'],
    pricePerMeterKobo: 18_500_00,
    composition: '100% Super 110s worsted wool',
    gsm: 270,
    widthCm: 150,
    origin: 'Huddersfield, England',
    occasions: ['CORPORATE'],
    sortOrder: 16,
  },

  // --- Linen ---------------------------------------------------------------
  {
    slug: 'linen-irish-chalk',
    name: 'Irish Linen Chalk',
    family: 'LINEN',
    weight: 'LIGHT',
    colorName: 'Chalk',
    colorHex: '#E8E0D2',
    colorTags: ['cream', 'white', 'ivory'],
    pricePerMeterKobo: 7_500_00,
    composition: '100% Irish linen',
    gsm: 190,
    widthCm: 145,
    origin: 'Banbridge, Northern Ireland',
    occasions: ['EVERYDAY', 'BRIDAL', 'MATERNITY'],
    sortOrder: 17,
    description: 'Crumples honestly. If that bothers you, take the wool instead.',
  },
  {
    slug: 'linen-italian-olive',
    name: 'Italian Linen Olive',
    family: 'LINEN',
    weight: 'LIGHT',
    colorName: 'Dusty olive',
    colorHex: '#6B7355',
    colorTags: ['green', 'olive'],
    pricePerMeterKobo: 8_200_00,
    composition: '100% Italian linen',
    gsm: 200,
    widthCm: 145,
    occasions: ['EVERYDAY', 'CORPORATE'],
    sortOrder: 18,
  },

  // --- Satin & silk --------------------------------------------------------
  {
    slug: 'silk-satin-emerald',
    name: 'Silk Satin Emerald',
    family: 'SATIN',
    weight: 'LIGHT',
    colorName: 'Emerald',
    colorHex: '#0E5C4A',
    colorTags: ['green', 'emerald'],
    pricePerMeterKobo: 12_000_00,
    composition: '100% silk satin',
    gsm: 120,
    widthCm: 140,
    occasions: ['BRIDAL', 'PARTY'],
    sortOrder: 19,
    description: 'Our house lining, and an evening cloth in its own right.',
  },
  {
    slug: 'silk-satin-ivory',
    name: 'Silk Satin Ivory',
    family: 'SATIN',
    weight: 'LIGHT',
    colorName: 'Ivory',
    colorHex: '#F0E7D8',
    colorTags: ['ivory', 'cream', 'white'],
    pricePerMeterKobo: 12_000_00,
    composition: '100% silk satin',
    gsm: 120,
    widthCm: 140,
    occasions: ['BRIDAL'],
    sortOrder: 20,
  },
];

// ---------------------------------------------------------------------------
// Base styles
// ---------------------------------------------------------------------------

const BASE_STYLES: Prisma.BaseStyleCreateInput[] = [
  {
    slug: 'blazer-trouser',
    name: 'Blazer & Trouser',
    tagline: 'The house two-piece',
    description:
      'A canvassed single-breasted blazer over a straight or wide-leg trouser. The cut most of our customers start with, and the one we have drafted most often.',
    basePriceKobo: 145_000_00,
    yardageMeters: 3.4,
    occasions: ['CORPORATE', 'EVERYDAY', 'PARTY', 'BRIDAL'],
    supportedFits: ['REGULAR', 'SLIM', 'RELAXED'],
    optionCategories: ['LAPEL', 'CLOSURE', 'BUTTON_COUNT', 'BUTTON_COLOR', 'POCKET', 'SLEEVE', 'LINING', 'TRIM'],
    sortOrder: 1,
  },
  {
    slug: 'blazer-skirt',
    name: 'Blazer & Skirt',
    tagline: 'Column or pencil',
    description:
      'The same canvassed blazer with a pencil or column skirt, cut to the length you specify rather than to a size chart.',
    basePriceKobo: 135_000_00,
    yardageMeters: 3.0,
    occasions: ['CORPORATE', 'BRIDAL', 'EVERYDAY'],
    supportedFits: ['REGULAR', 'SLIM', 'RELAXED'],
    optionCategories: ['LAPEL', 'CLOSURE', 'BUTTON_COUNT', 'BUTTON_COLOR', 'POCKET', 'SLEEVE', 'LINING', 'TRIM'],
    sortOrder: 2,
  },
  {
    slug: 'waistcoat-set',
    name: 'Three-Piece Waistcoat Set',
    tagline: 'Blazer, waistcoat, trouser',
    description:
      'Full three-piece. The waistcoat is cut with a shaped back and adjustable strap, and can be worn on its own with the trouser.',
    basePriceKobo: 185_000_00,
    yardageMeters: 4.1,
    occasions: ['CORPORATE', 'BRIDAL', 'PARTY'],
    supportedFits: ['REGULAR', 'SLIM', 'RELAXED'],
    optionCategories: ['LAPEL', 'CLOSURE', 'BUTTON_COUNT', 'BUTTON_COLOR', 'POCKET', 'SLEEVE', 'LINING', 'TRIM'],
    sortOrder: 3,
  },
  {
    slug: 'wrap-suit',
    name: 'Wrap Jacket & Trouser',
    tagline: 'Soft tailoring, no buttons',
    description:
      'A collarless wrap jacket that ties at the waist, over a tapered trouser. Unstructured through the shoulder — the cut for cloth that wants to drape rather than hold.',
    basePriceKobo: 150_000_00,
    yardageMeters: 3.6,
    occasions: ['EVERYDAY', 'PARTY', 'MATERNITY'],
    supportedFits: ['REGULAR', 'RELAXED', 'MATERNITY'],
    optionCategories: ['POCKET', 'SLEEVE', 'LINING', 'TRIM'],
    sortOrder: 4,
  },
  {
    slug: 'maternity-set',
    name: 'Maternity-Adjustable Set',
    tagline: 'Grows 14cm with you',
    description:
      'Hidden expansion panels in both side seams release up to 14cm as you grow, with a ribbed under-bust stay and a front hem drafted longer so it never rides up. Not a bigger size — a different construction.',
    basePriceKobo: 165_000_00,
    yardageMeters: 3.8,
    occasions: ['MATERNITY', 'CORPORATE', 'PARTY'],
    supportedFits: ['MATERNITY', 'RELAXED'],
    optionCategories: ['LAPEL', 'BUTTON_COUNT', 'BUTTON_COLOR', 'POCKET', 'SLEEVE', 'LINING', 'TRIM'],
    sortOrder: 5,
  },
];

// ---------------------------------------------------------------------------
// Design options
// ---------------------------------------------------------------------------

type OptionSeed = Omit<Prisma.DesignOptionCreateInput, 'baseStyle'>;

const DESIGN_OPTIONS: OptionSeed[] = [
  // Lapel
  { slug: 'lapel-notch', name: 'Notch lapel', category: 'LAPEL', priceModifierKobo: 0, isDefault: true, sortOrder: 1, description: 'The standard. Quiet, correct, works with everything.' },
  { slug: 'lapel-peak', name: 'Peak lapel', category: 'LAPEL', priceModifierKobo: 6_000_00, sortOrder: 2, description: 'Points sweeping up towards the shoulder. Sharper, more formal, more us.' },
  { slug: 'lapel-shawl', name: 'Shawl collar', category: 'LAPEL', priceModifierKobo: 8_000_00, sortOrder: 3, description: 'One unbroken curve. Evening, or a soft cloth you do not want to interrupt.' },

  // Closure
  { slug: 'closure-single', name: 'Single-breasted', category: 'CLOSURE', priceModifierKobo: 0, isDefault: true, sortOrder: 1 },
  { slug: 'closure-double', name: 'Double-breasted', category: 'CLOSURE', priceModifierKobo: 12_000_00, sortOrder: 2, description: 'Wider overlap, six buttons, more cloth and more construction.' },

  // Button count
  { slug: 'buttons-one', name: 'One button', category: 'BUTTON_COUNT', priceModifierKobo: 0, sortOrder: 1, description: 'Lowest stance, longest lapel line.' },
  { slug: 'buttons-two', name: 'Two buttons', category: 'BUTTON_COUNT', priceModifierKobo: 0, isDefault: true, sortOrder: 2 },
  { slug: 'buttons-three', name: 'Three buttons', category: 'BUTTON_COUNT', priceModifierKobo: 0, sortOrder: 3, description: 'Higher closure. Good on a longer jacket.' },

  // Button finish
  { slug: 'button-horn-black', name: 'Black horn', category: 'BUTTON_COLOR', colorHex: '#1B1714', priceModifierKobo: 0, isDefault: true, sortOrder: 1 },
  { slug: 'button-horn-brown', name: 'Brown horn', category: 'BUTTON_COLOR', colorHex: '#5A3A22', priceModifierKobo: 0, sortOrder: 2 },
  { slug: 'button-pearl', name: 'Mother of pearl', category: 'BUTTON_COLOR', colorHex: '#EFE7DA', priceModifierKobo: 4_500_00, sortOrder: 3 },
  { slug: 'button-brass', name: 'Antique brass', category: 'BUTTON_COLOR', colorHex: '#B08D57', priceModifierKobo: 3_500_00, sortOrder: 4 },
  { slug: 'button-covered', name: 'Self-covered', category: 'BUTTON_COLOR', colorHex: '#8C8481', priceModifierKobo: 5_000_00, sortOrder: 5, description: 'Covered in your own cloth. Disappears completely.' },

  // Pockets
  { slug: 'pocket-flap', name: 'Flap pockets', category: 'POCKET', priceModifierKobo: 0, isDefault: true, sortOrder: 1 },
  { slug: 'pocket-besom', name: 'Besom (jetted)', category: 'POCKET', priceModifierKobo: 4_000_00, sortOrder: 2, description: 'No flap, just a clean welt. The cleanest line.' },
  { slug: 'pocket-patch', name: 'Patch pockets', category: 'POCKET', priceModifierKobo: 0, sortOrder: 3, description: 'Applied on the outside. Relaxed, and the most useful.' },
  { slug: 'pocket-flap-ticket', name: 'Flap with ticket pocket', category: 'POCKET', priceModifierKobo: 6_500_00, sortOrder: 4 },

  // Sleeve
  { slug: 'sleeve-full', name: 'Full length', category: 'SLEEVE', priceModifierKobo: 0, isDefault: true, sortOrder: 1 },
  { slug: 'sleeve-three-quarter', name: 'Three-quarter', category: 'SLEEVE', priceModifierKobo: 0, sortOrder: 2, description: 'Ends mid-forearm. Made for this climate.' },
  { slug: 'sleeve-turnback', name: 'Turn-back cuff', category: 'SLEEVE', priceModifierKobo: 7_500_00, sortOrder: 3, description: 'A folded cuff showing the lining or a contrast cloth.' },

  // Lining
  { slug: 'lining-emerald', name: 'Emerald silk', category: 'LINING', colorHex: '#0E5C4A', priceModifierKobo: 0, isDefault: true, sortOrder: 1 },
  { slug: 'lining-indigo', name: 'Indigo silk', category: 'LINING', colorHex: '#23335C', priceModifierKobo: 0, sortOrder: 2 },
  { slug: 'lining-ivory', name: 'Ivory silk', category: 'LINING', colorHex: '#F0E7D8', priceModifierKobo: 0, sortOrder: 3 },
  { slug: 'lining-gold', name: 'Aso-oke gold', category: 'LINING', colorHex: '#C6A15B', priceModifierKobo: 3_000_00, sortOrder: 4 },
  { slug: 'lining-terracotta', name: 'Terracotta silk', category: 'LINING', colorHex: '#B45A3C', priceModifierKobo: 3_000_00, sortOrder: 5 },
  { slug: 'lining-adire', name: 'Adire print lining', category: 'LINING', colorHex: '#2F4A7A', priceModifierKobo: 9_000_00, sortOrder: 6, description: 'The whole jacket lined in adire. Nobody sees it but you.' },

  // Trim
  { slug: 'trim-none', name: 'No trim', category: 'TRIM', priceModifierKobo: 0, isDefault: true, sortOrder: 1 },
  { slug: 'trim-gold-piping', name: 'Gold piping', category: 'TRIM', colorHex: '#C6A15B', priceModifierKobo: 11_000_00, sortOrder: 2, description: 'A fine gold cord set into the lapel and pocket edges.' },
  { slug: 'trim-contrast-undercollar', name: 'Contrast under-collar', category: 'TRIM', colorHex: '#23335C', priceModifierKobo: 8_500_00, sortOrder: 3, description: 'Adire under the collar. Shows only when you turn it up.' },
  { slug: 'trim-embroidered-cuff', name: 'Hand-embroidered cuff', category: 'TRIM', colorHex: '#C6A15B', priceModifierKobo: 25_000_00, sortOrder: 4, description: 'Worked by hand in our atelier. Adds about a week.' },
];

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

const COLLECTIONS: Prisma.CollectionCreateInput[] = [
  {
    slug: 'harmattan',
    name: 'Harmattan',
    subtitle: 'Dry season, dust and ochre',
    season: 'Harmattan 2025',
    description:
      'Cut for the months when the air turns dry and the light goes gold. Linen, light adire and aso-oke in dust, ochre and deep indigo.',
    heroImage: ph('collection-harmattan-hero'),
    tileImage: ph('collection-harmattan-tile'),
    occasion: 'EVERYDAY',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: 'boardroom',
    name: 'Boardroom',
    subtitle: 'Armour, quietly',
    season: 'Permanent',
    description:
      'Worsted wool and adire that reads as suiting at ten paces. Built for long days, air conditioning and being the only woman in the room.',
    heroImage: ph('collection-boardroom-hero'),
    tileImage: ph('collection-boardroom-tile'),
    occasion: 'CORPORATE',
    isFeatured: true,
    sortOrder: 2,
  },
  {
    slug: 'vows',
    name: 'Vows',
    subtitle: 'For the bride and the women beside her',
    season: 'Permanent',
    description:
      'Ivory George, silk satin and sányán gold. Trouser suits for brides who never wanted the dress, and coordinated tailoring for the party.',
    heroImage: ph('collection-vows-hero'),
    tileImage: ph('collection-vows-tile'),
    occasion: 'BRIDAL',
    isFeatured: true,
    sortOrder: 3,
  },
  {
    slug: 'nine-months',
    name: 'Nine Months',
    subtitle: 'Tailoring that grows',
    season: 'Permanent',
    description:
      'The maternity line. Hidden expansion panels, ribbed under-bust stays and rebalanced hems, in cloth you would want to wear anyway.',
    heroImage: ph('collection-nine-months-hero'),
    tileImage: ph('collection-nine-months-tile'),
    occasion: 'MATERNITY',
    isFeatured: true,
    sortOrder: 4,
  },
];

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

type ProductSeed = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  storyNote?: string;
  priceKobo: number;
  compareAtKobo?: number;
  occasion: Prisma.ProductCreateInput['occasion'];
  silhouette: string;
  baseStyleSlug: string;
  fabricSlug: string;
  collectionSlug: string;
  isFeatured?: boolean;
  leadTimeDays?: number;
};

const PRODUCTS: ProductSeed[] = [
  {
    slug: 'itan-emerald-two-piece',
    name: 'Ìtàn Emerald Two-Piece',
    subtitle: 'Aso-oke etu blazer and wide-leg trouser',
    description:
      'A fully canvassed peak-lapel blazer in emerald etu aso-oke, over a wide-leg trouser in the same cloth. The shoulder is built with horsehair canvas rather than fusing, so it holds its line through a Lagos afternoon.',
    storyNote:
      'Ìtàn means story. This was the first piece Prisca cut in aso-oke with a full canvas, and it settled the argument about whether hand-woven cloth could be tailored properly.',
    priceKobo: 235_000_00,
    occasion: 'PARTY',
    silhouette: 'Peak lapel, wide leg',
    baseStyleSlug: 'blazer-trouser',
    fabricSlug: 'asooke-etu-emerald',
    collectionSlug: 'harmattan',
    isFeatured: true,
    leadTimeDays: 24,
  },
  {
    slug: 'abeokuta-adire-blazer',
    name: 'Abéòkúta Adire Blazer',
    subtitle: 'Single-breasted blazer in eléko indigo',
    description:
      'Our house adire, cut single-breasted with notch lapels and besom pockets. Half-lined in emerald silk so it breathes. Every one is different, because every length of eléko is.',
    priceKobo: 178_000_00,
    occasion: 'CORPORATE',
    silhouette: 'Notch lapel, single-breasted',
    baseStyleSlug: 'blazer-trouser',
    fabricSlug: 'adire-eleko-indigo',
    collectionSlug: 'boardroom',
    isFeatured: true,
  },
  {
    slug: 'iseyin-asooke-suit',
    name: 'Ìsẹ́yìn Aso-oke Suit',
    subtitle: 'Sányán gold three-piece',
    description:
      'A three-piece in sányán aso-oke — blazer, shaped-back waistcoat and straight trouser. The gold is the natural colour of wild silk, not a dye.',
    priceKobo: 312_000_00,
    occasion: 'BRIDAL',
    silhouette: 'Three-piece, shawl collar',
    baseStyleSlug: 'waistcoat-set',
    fabricSlug: 'asooke-sanyan-gold',
    collectionSlug: 'vows',
    isFeatured: true,
    leadTimeDays: 32,
  },
  {
    slug: 'boardroom-worsted-trouser-suit',
    name: 'Boardroom Worsted Trouser Suit',
    subtitle: 'Super 130s charcoal, double-breasted',
    description:
      'Double-breasted, six buttons, peak lapels, in Italian Super 130s. The most conventional thing we make, and deliberately so — some rooms are not the place to make an argument with your clothes.',
    priceKobo: 268_000_00,
    occasion: 'CORPORATE',
    silhouette: 'Double-breasted, peak lapel',
    baseStyleSlug: 'blazer-trouser',
    fabricSlug: 'wool-super130-charcoal',
    collectionSlug: 'boardroom',
    isFeatured: true,
  },
  {
    slug: 'ileke-bridal-trouser-suit',
    name: 'Ìlèkè Bridal Trouser Suit',
    subtitle: 'Ivory George with hand-embroidered cuff',
    description:
      'For the bride who never wanted the dress. Ivory George brocade, shawl collar, self-covered buttons, with a hand-embroidered cuff worked in gold thread in our atelier.',
    storyNote:
      'Named for the beadwork a Yoruba bride wears. The embroidery on the cuff takes one person about eleven hours.',
    priceKobo: 345_000_00,
    occasion: 'BRIDAL',
    silhouette: 'Shawl collar, column trouser',
    baseStyleSlug: 'blazer-trouser',
    fabricSlug: 'george-brocade-ivory',
    collectionSlug: 'vows',
    isFeatured: true,
    leadTimeDays: 38,
  },
  {
    slug: 'nine-months-adire-set',
    name: 'Nine Months Adire Set',
    subtitle: 'Maternity-adjustable blazer and trouser',
    description:
      'The maternity construction in onìkò adire. Hidden panels at both side seams release up to 14cm, the under-bust stay is ribbed and soft, and the front hem is drafted 4cm longer so it stays level over the bump.',
    priceKobo: 212_000_00,
    occasion: 'MATERNITY',
    silhouette: 'Maternity-adjustable, notch lapel',
    baseStyleSlug: 'maternity-set',
    fabricSlug: 'adire-oniko-chalk',
    collectionSlug: 'nine-months',
    isFeatured: true,
  },
  {
    slug: 'harmattan-linen-set',
    name: 'Harmattan Linen Set',
    subtitle: 'Irish linen, relaxed shoulder',
    description:
      'Unstructured through the shoulder, patch pockets, three-quarter sleeve. Chalk Irish linen that will crumple by lunchtime and look better for it.',
    priceKobo: 156_000_00,
    compareAtKobo: 178_000_00,
    occasion: 'EVERYDAY',
    silhouette: 'Relaxed, patch pocket',
    baseStyleSlug: 'blazer-trouser',
    fabricSlug: 'linen-irish-chalk',
    collectionSlug: 'harmattan',
  },
  {
    slug: 'oru-party-tuxedo',
    name: 'Òru Party Tuxedo',
    subtitle: 'Wine George, shawl collar',
    description:
      'A dinner suit in deep wine George damask, shawl collar faced in emerald silk satin, one covered button. Cut for a room that is already dark.',
    priceKobo: 289_000_00,
    occasion: 'PARTY',
    silhouette: 'Shawl collar, one button',
    baseStyleSlug: 'blazer-trouser',
    fabricSlug: 'george-damask-wine',
    collectionSlug: 'harmattan',
  },
  {
    slug: 'akwete-waistcoat-set',
    name: 'Akwete Waistcoat Set',
    subtitle: 'Three-piece in ìkaki terracotta',
    description:
      'Hand-woven Akwete from Abia State, cut as a three-piece. The raised motifs are supplementary weft, worked in by the weaver without a draft — so we cut the waistcoat to centre them.',
    priceKobo: 296_000_00,
    occasion: 'PARTY',
    silhouette: 'Three-piece, notch lapel',
    baseStyleSlug: 'waistcoat-set',
    fabricSlug: 'akwete-ikaki-terracotta',
    collectionSlug: 'harmattan',
    leadTimeDays: 28,
  },
  {
    slug: 'ankara-wrap-suit',
    name: 'Ankara Wrap Suit',
    subtitle: 'Collarless wrap jacket and tapered trouser',
    description:
      'Soft tailoring in ojú ẹja wax print. No buttons, no canvas — the jacket ties at the waist and the whole thing packs flat. Also cuts beautifully as maternity.',
    priceKobo: 132_000_00,
    occasion: 'EVERYDAY',
    silhouette: 'Wrap, tapered leg',
    baseStyleSlug: 'wrap-suit',
    fabricSlug: 'ankara-oju-eja-emerald',
    collectionSlug: 'harmattan',
  },
  {
    slug: 'george-evening-column',
    name: 'George Evening Column',
    subtitle: 'Blazer and column skirt',
    description:
      'Kente-inspired narrow-strip weave, cut as a cropped blazer over an ankle-length column skirt with a walking vent.',
    priceKobo: 248_000_00,
    occasion: 'PARTY',
    silhouette: 'Cropped blazer, column skirt',
    baseStyleSlug: 'blazer-skirt',
    fabricSlug: 'kente-adweneasa-gold',
    collectionSlug: 'vows',
  },
  {
    slug: 'ekiti-everyday-blazer',
    name: 'Èkìtì Everyday Blazer',
    subtitle: 'Olive linen, patch pockets',
    description:
      'The one you reach for without thinking. Dusty olive Italian linen, unlined, patch pockets, soft shoulder. Named for where all of this started.',
    priceKobo: 128_000_00,
    occasion: 'EVERYDAY',
    silhouette: 'Unstructured, patch pocket',
    baseStyleSlug: 'blazer-trouser',
    fabricSlug: 'linen-italian-olive',
    collectionSlug: 'harmattan',
  },
];

// ---------------------------------------------------------------------------
// Editorial
// ---------------------------------------------------------------------------

const BLOG_POSTS: Prisma.BlogPostCreateInput[] = [
  {
    slug: 'why-adire-deserves-a-canvas',
    title: 'Why adire deserves a canvas',
    excerpt:
      'Hand-dyed indigo has been treated as a casual cloth for decades. Put a horsehair canvas behind it and it becomes suiting.',
    category: 'Fabric',
    tags: ['adire', 'construction', 'atelier'],
    coverImage: ph('journal-adire'),
    coverAlt: 'Indigo cloth being lifted from a dye pit in Abeokuta',
    readMinutes: 6,
    status: 'PUBLISHED',
    publishedAt: new Date('2025-02-11'),
    body: `<p>For most of the last fifty years, adire has been made up quickly. Unlined, unstructured, run up on a domestic machine and worn for a weekend. There is nothing wrong with that — but it created an assumption that hand-dyed cotton is a casual cloth, and the assumption stuck.</p>
<p>It is not true. Eléko adire from Abeokuta comes off the line at around 190gsm, which is roughly the weight of a summer-weight worsted. It takes a press. It holds a crease. The only thing it has been missing is the construction we give to wool without thinking about it.</p>
<h2>What a canvas actually does</h2>
<p>A canvassed jacket has a layer of horsehair and cotton floating between the outer cloth and the lining, attached with hundreds of small stitches rather than glue. The canvas is what gives a lapel its roll and a chest its shape, and because it is only tacked in place, it moulds to the wearer over the first few months.</p>
<p>A fused jacket — where an interfacing is glued to the back of the cloth — is faster and cheaper, and in this humidity it eventually bubbles. You have seen it: that rippled look across the chest of a jacket that has been rained on once too often.</p>
<h2>The problem with fusing adire</h2>
<p>Fusing adire is worse than fusing wool, because the resist-dyeing process leaves the cotton with slightly uneven absorbency. The adhesive takes differently across the panel. Within a year you get a jacket that looks blistered.</p>
<p>So we canvas. Every adire jacket that leaves this atelier has a full or half canvas in it, pad-stitched by hand at the lapel and collar. It adds about six hours of labour per jacket and it is the single largest reason an adire blazer here costs what it does.</p>
<h2>What it changes</h2>
<p>A canvassed adire blazer hangs from the shoulder instead of gripping the chest. The lapel rolls in a soft curve rather than folding on a hard line. And because the cloth is not glued to anything, it keeps the slight movement and handle that made you want hand-dyed cotton in the first place.</p>
<p>That is the whole argument. The cloth was never the limitation.</p>`,
  },
  {
    slug: 'how-to-buy-your-first-suit',
    title: 'How to buy your first made-to-measure suit',
    excerpt:
      'What to decide before you open the builder, what genuinely matters, and what you can safely ignore.',
    category: 'Styling',
    tags: ['guide', 'first-order'],
    coverImage: ph('journal-first-suit'),
    coverAlt: 'A single jacket on a wooden hanger against a plain wall',
    readMinutes: 7,
    status: 'PUBLISHED',
    publishedAt: new Date('2025-03-04'),
    body: `<p>The first made-to-measure order is the hardest, because you are being asked to make decisions you have never had to make before. Here is the short version of what matters.</p>
<h2>Decide where you will wear it first</h2>
<p>Not "where might I wear it" — where will you wear it in the first month. A suit bought for an imaginary occasion sits in the wardrobe. If the honest answer is "the office, twice a week", that points at wool or a quiet adire, notch lapels and a colour you already own shoes for.</p>
<h2>Choose the cloth before anything else</h2>
<p>Everything else follows from it. A heavy aso-oke wants a simple cut, because the cloth is already doing the talking. A plain worsted can carry a peak lapel, a ticket pocket and a loud lining without looking busy.</p>
<h2>What actually matters in the fit</h2>
<p>Three things: the shoulder, the shoulder, and the shoulder. A shoulder that is wrong cannot be fixed afterwards. Sleeve length, waist suppression and trouser hem are all easily altered — the shoulder is structural.</p>
<p>This is why we ask you not to guess that measurement, and why we would rather do a five-minute video call than take a number you were unsure about.</p>
<h2>What you can ignore for now</h2>
<p>Button stance, vent style, pick stitching. These are real decisions and they matter to people who already own six suits. On your first, take the defaults — they are the defaults because they suit the most bodies and the most occasions.</p>
<h2>One thing worth spending on</h2>
<p>The lining. Nobody sees it, which is exactly why it is the one indulgence that never looks like showing off. Adire-lined jackets are the most repeat-ordered thing we make.</p>`,
  },
  {
    slug: 'how-maternity-panels-work',
    title: 'How our maternity panels actually work',
    excerpt:
      'Not a bigger size. A different construction — and here is the mechanism, in detail.',
    category: 'Atelier',
    tags: ['maternity', 'construction'],
    coverImage: ph('journal-maternity'),
    coverAlt: 'A hand opening the hidden expansion panel inside a jacket side seam',
    readMinutes: 5,
    status: 'PUBLISHED',
    publishedAt: new Date('2025-04-18'),
    body: `<p>Most maternity tailoring is a normal pattern, graded up, with an elastic waistband. It fits for about six weeks and then it does not.</p>
<h2>The panel</h2>
<p>We build a folded panel of the same cloth into each side seam, held closed with a concealed placket. Released fully, the two panels give 14cm of additional girth. You do not need to go back to a tailor to release them — the placket opens by hand.</p>
<h2>The under-bust stay</h2>
<p>A soft ribbed band sits under the bust inside the jacket. It anchors the garment at the one point on a changing torso that stays relatively stable, which stops the whole jacket riding up as the bump grows.</p>
<h2>The hem</h2>
<p>A bump pulls the front hem up. So the front is drafted between 3.5cm and 5cm longer than the back, depending on how far along you are when we measure. From the side, the hem reads level, which is the entire trick.</p>
<h2>Afterwards</h2>
<p>Bring it back. We close the panels permanently and re-cut the waist, and you have an ordinary jacket that fits. That alteration is free within the first year, and most people take it up around month five postpartum.</p>`,
  },
  {
    slug: 'a-day-in-iseyin',
    title: 'A day in Ìsẹ́yìn, where the aso-oke comes from',
    excerpt:
      'Four metres of etu is about two days of one weaver’s work. We went to watch.',
    category: 'Fabric',
    tags: ['aso-oke', 'makers'],
    coverImage: ph('journal-asooke'),
    coverAlt: 'A narrow loom in Iseyin with a strip of cloth forming',
    readMinutes: 8,
    status: 'PUBLISHED',
    publishedAt: new Date('2025-05-22'),
    body: `<p>Ìsẹ́yìn is about two hours north-west of Ibadan, and it has been weaving aso-oke for a very long time. The looms are narrow — 55cm at most — because that is the width one person can comfortably throw a shuttle across.</p>
<h2>Why the strips</h2>
<p>Everything comes off the loom as a long strip. To make a piece of cloth wide enough to cut a jacket from, the strips are joined edge to edge by hand. Those joins are a feature, not a compromise, and where they fall on a garment is a real design decision for the cutter.</p>
<h2>What four metres costs in time</h2>
<p>Roughly two days, for one weaver, for a plain etu. A sányán with a supplementary weft pattern is longer. When you see aso-oke priced like printed cotton, someone in that chain is not being paid.</p>
<h2>How we buy</h2>
<p>We pay in full before delivery, we name the workshop on every fabric page, and we order in advance for the season rather than pushing a rush order onto someone else's schedule. None of that is charity. It is the only way to keep getting cloth this good.</p>`,
  },
  {
    slug: 'dressing-a-team-without-a-uniform',
    title: 'Dressing a team without making it a uniform',
    excerpt:
      'One cloth, six different cuts. What actually works when you are tailoring for a whole department.',
    category: 'Styling',
    tags: ['corporate', 'bulk'],
    coverImage: ph('journal-corporate'),
    coverAlt: 'A rail of finished corporate suiting in one cloth, different cuts',
    readMinutes: 5,
    status: 'PUBLISHED',
    publishedAt: new Date('2025-06-30'),
    body: `<p>The instinct with team dressing is to make everything identical. It is the fastest way to make a group of adults feel like they are in costume.</p>
<h2>Same cloth, different cuts</h2>
<p>Hold one variable constant and let the rest move. If everyone is in the same charcoal worsted, it reads as one group from across a lobby — even though one person is in a double-breasted trouser suit, another in a blazer and skirt, and a third in the maternity construction.</p>
<h2>Let people choose the cut</h2>
<p>We give every person in a corporate order the same three or four approved cuts and let them pick. Take-up of the tailoring goes up, complaints go down, and nobody is forced into a silhouette that does not work on their body.</p>
<h2>Plan for change</h2>
<p>Over an eighteen-month contract, people join, leave and become pregnant. We keep every measurement profile on file so a new hire can be matched to the existing order without starting over, and staff who become pregnant get the panel construction in the same cloth at no penalty to the departmental budget.</p>`,
  },
  {
    slug: 'caring-for-african-cloth',
    title: 'Caring for African cloth',
    excerpt:
      'What to dry clean, what to hand wash, and why you should never put a hot iron on metallic thread.',
    category: 'Journal',
    tags: ['care', 'guide'],
    coverImage: ph('journal-care'),
    coverAlt: 'An iron and pressing cloth on a sleeve board with steam rising',
    readMinutes: 4,
    status: 'PUBLISHED',
    publishedAt: new Date('2025-07-15'),
    body: `<p>Made properly, these clothes should outlast the occasion you bought them for. Most of what shortens their life is avoidable.</p>
<h2>Dry clean</h2>
<p>Adire, aso-oke, Akwete, George and anything embroidered or canvassed. Not because they are delicate, but because a canvassed jacket cannot be washed without destroying the relationship between the canvas and the cloth.</p>
<h2>Hand wash</h2>
<p>Ankara cotton, if it is unlined and unstructured. Cold water, no soaking, line dry in the shade. Heat and direct sun will pull the colour out of a wax print faster than anything else.</p>
<h2>Pressing</h2>
<p>On the reverse, always, and use a pressing cloth. A hot iron placed directly on metallic weft — the gold in sányán or in an Ankara with lurex — will melt it. It does not come back.</p>
<h2>Storage</h2>
<p>Wide wooden hangers, never wire. Give a jacket 24 hours between wears so the canvas can recover its shape. And do not store anything in a plastic dry-cleaning bag: cloth needs to breathe, and in this climate a sealed bag is how you get mildew.</p>`,
  },
];

const TESTIMONIALS: Prisma.TestimonialCreateInput[] = [
  {
    quote:
      'I have bought suits in London and Milan. This is the first time a jacket has fitted my shoulders without an argument, and the first time the cloth meant anything to me.',
    authorName: 'Adaeze N.',
    authorRole: 'Partner, commercial law',
    location: 'Lagos',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    quote:
      'I wore the maternity blazer from week 19 to week 38. It never once looked like maternity wear. My colleagues thought I had simply found a very good tailor.',
    authorName: 'Fọlásàdé O.',
    authorRole: 'Head of policy',
    location: 'Abuja',
    isFeatured: true,
    sortOrder: 2,
  },
  {
    quote:
      'I got married in the ivory George trouser suit. My mother cried, and not about the trousers. Eleven hours of hand embroidery on one cuff and you can see every one of them.',
    authorName: 'Chiamaka E.',
    authorRole: 'Bride, November 2024',
    location: 'Enugu',
    isFeatured: true,
    sortOrder: 3,
  },
  {
    quote:
      'Ordered from Houston, measured myself with my sister on a video call, and it arrived fitting better than anything I own. The alteration I expected to need never happened.',
    authorName: 'Bisola A.',
    authorRole: 'Software engineer',
    location: 'Houston, USA',
    isFeatured: false,
    sortOrder: 4,
  },
  {
    quote:
      'We put fourteen people through their fitting in one afternoon in our own office. Procurement got an itemised invoice and I got a team that actually wears the tailoring.',
    authorName: 'Ngozi U.',
    authorRole: 'Director of operations',
    location: 'Port Harcourt',
    isFeatured: false,
    sortOrder: 5,
  },
];

const HOME_TILES: Prisma.HomeTileCreateInput[] = [
  { label: 'Corporate', subtitle: 'Boardroom armour in wool, linen and quiet adire.', href: '/shop?occasion=CORPORATE', imageUrl: ph('tile-corporate'), occasion: 'CORPORATE', sortOrder: 1 },
  { label: 'Bridal', subtitle: 'For the bride, her mother, and the women beside her.', href: '/shop?occasion=BRIDAL', imageUrl: ph('tile-bridal'), occasion: 'BRIDAL', sortOrder: 2 },
  { label: 'Maternity', subtitle: 'Expansion panels that grow with you, week by week.', href: '/shop?occasion=MATERNITY', imageUrl: ph('tile-maternity'), occasion: 'MATERNITY', sortOrder: 3 },
  { label: 'Party', subtitle: 'Aso-oke, George and a hemline that moves.', href: '/shop?occasion=PARTY', imageUrl: ph('tile-party'), occasion: 'PARTY', sortOrder: 4 },
  { label: 'Everyday', subtitle: 'The suit you reach for without thinking.', href: '/shop?occasion=EVERYDAY', imageUrl: ph('tile-everyday'), occasion: 'EVERYDAY', sortOrder: 5 },
];

const LOOKBOOK: {
  name: string;
  caption: string;
  collectionSlug: string;
  occasion: Prisma.LookbookImageCreateInput['occasion'];
  spanHint: number;
}[] = [
  { name: 'lookbook-01', caption: 'Ìtàn emerald two-piece, etu aso-oke', collectionSlug: 'harmattan', occasion: 'PARTY', spanHint: 2 },
  { name: 'lookbook-02', caption: 'Contrasting cloth, one cutting table', collectionSlug: 'harmattan', occasion: 'EVERYDAY', spanHint: 3 },
  { name: 'lookbook-03', caption: 'The back seam and vent', collectionSlug: 'boardroom', occasion: 'CORPORATE', spanHint: 1 },
  { name: 'lookbook-04', caption: 'Ìlèkè bridal, hand-embroidered cuff', collectionSlug: 'vows', occasion: 'BRIDAL', spanHint: 2 },
  { name: 'lookbook-05', caption: 'The cloth wall', collectionSlug: 'harmattan', occasion: 'EVERYDAY', spanHint: 3 },
  { name: 'lookbook-06', caption: 'Nine Months, week 31', collectionSlug: 'nine-months', occasion: 'MATERNITY', spanHint: 1 },
  { name: 'lookbook-07', caption: 'Super 130s, double-breasted', collectionSlug: 'boardroom', occasion: 'CORPORATE', spanHint: 2 },
  { name: 'lookbook-08', caption: 'Chalk and shears on adire', collectionSlug: 'boardroom', occasion: 'CORPORATE', spanHint: 3 },
  { name: 'lookbook-09', caption: 'Òru, wine George damask', collectionSlug: 'harmattan', occasion: 'PARTY', spanHint: 1 },
  { name: 'lookbook-10', caption: 'Èkìtì everyday, olive linen', collectionSlug: 'harmattan', occasion: 'EVERYDAY', spanHint: 1 },
  { name: 'lookbook-11', caption: 'One cloth, three cuts', collectionSlug: 'boardroom', occasion: 'CORPORATE', spanHint: 3 },
  { name: 'lookbook-12', caption: 'Gele and a tailored shoulder', collectionSlug: 'vows', occasion: 'BRIDAL', spanHint: 2 },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function main() {
  console.log('▸ Seeding Preeskahmour…');

  // --- Users ---------------------------------------------------------------
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'prisca@preeskahmour.com').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Preeska2024!';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: 'Prisca Ogunlade',
      role: 'ADMIN',
      phone: '+234 800 000 0000',
      passwordHash: await bcrypt.hash(adminPassword, 12),
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'demo@preeskahmour.com' },
    update: {},
    create: {
      email: 'demo@preeskahmour.com',
      name: 'Adaeze Nwosu',
      role: 'CUSTOMER',
      phone: '+234 801 234 5678',
      passwordHash: await bcrypt.hash('Demo2024!', 12),
    },
  });
  console.log(`  ✔ users (admin: ${admin.email}, demo: ${customer.email})`);

  // --- Site content --------------------------------------------------------
  for (const key of Object.keys(DEFAULT_CONTENT) as SiteContentKey[]) {
    const meta = CONTENT_META[key];
    await prisma.siteSetting.upsert({
      where: { key },
      // Never overwrite content Prisca has already edited in /studio.
      update: {},
      create: {
        key,
        label: meta.label,
        group: meta.group,
        value: DEFAULT_CONTENT[key] as Prisma.InputJsonValue,
      },
    });
  }
  console.log(`  ✔ site content (${Object.keys(DEFAULT_CONTENT).length} blocks)`);

  // --- Fabrics -------------------------------------------------------------
  for (const fabric of FABRICS) {
    await prisma.fabric.upsert({
      where: { slug: fabric.slug },
      update: { pricePerMeterKobo: fabric.pricePerMeterKobo },
      create: fabric,
    });
  }
  console.log(`  ✔ fabrics (${FABRICS.length})`);

  // --- Base styles ---------------------------------------------------------
  for (const style of BASE_STYLES) {
    await prisma.baseStyle.upsert({
      where: { slug: style.slug },
      update: { basePriceKobo: style.basePriceKobo, yardageMeters: style.yardageMeters },
      create: style,
    });
  }
  console.log(`  ✔ base styles (${BASE_STYLES.length})`);

  // --- Design options ------------------------------------------------------
  for (const option of DESIGN_OPTIONS) {
    // These are global options, so baseStyleId is null. Postgres treats NULLs
    // as distinct in a unique index, which means the @@unique([slug,
    // baseStyleId]) constraint does not actually catch a repeat insert here —
    // so we look the row up ourselves rather than relying on upsert.
    const existing = await prisma.designOption.findFirst({
      where: { slug: option.slug, baseStyleId: null },
    });

    if (existing) {
      await prisma.designOption.update({
        where: { id: existing.id },
        data: { priceModifierKobo: option.priceModifierKobo, name: option.name },
      });
    } else {
      await prisma.designOption.create({ data: option });
    }
  }
  console.log(`  ✔ design options (${DESIGN_OPTIONS.length})`);

  // --- Collections ---------------------------------------------------------
  for (const collection of COLLECTIONS) {
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      update: {},
      create: collection,
    });
  }
  console.log(`  ✔ collections (${COLLECTIONS.length})`);

  // --- Products ------------------------------------------------------------
  for (const [index, seed] of PRODUCTS.entries()) {
    const [baseStyle, fabric, collection] = await Promise.all([
      prisma.baseStyle.findUnique({ where: { slug: seed.baseStyleSlug } }),
      prisma.fabric.findUnique({ where: { slug: seed.fabricSlug } }),
      prisma.collection.findUnique({ where: { slug: seed.collectionSlug } }),
    ]);

    const product = await prisma.product.upsert({
      where: { slug: seed.slug },
      update: { priceKobo: seed.priceKobo },
      create: {
        slug: seed.slug,
        name: seed.name,
        subtitle: seed.subtitle,
        description: seed.description,
        storyNote: seed.storyNote,
        priceKobo: seed.priceKobo,
        compareAtKobo: seed.compareAtKobo,
        occasion: seed.occasion,
        silhouette: seed.silhouette,
        baseStyleId: baseStyle?.id,
        fabricId: fabric?.id,
        collectionId: collection?.id,
        isFeatured: seed.isFeatured ?? false,
        leadTimeDays: seed.leadTimeDays ?? 21,
        sortOrder: index,
        seoTitle: `${seed.name} — made to measure`,
        seoDescription: seed.subtitle,
      },
    });

    const existingImages = await prisma.productImage.count({ where: { productId: product.id } });
    if (existingImages === 0) {
      await prisma.productImage.createMany({
        data: [1, 2, 3].map((n) => ({
          productId: product.id,
          url: ph(`product-${seed.slug}-${n}`),
          alt: `${seed.name} — ${['front', 'in movement', 'detail'][n - 1]}`,
          briefNote: ['Primary grid image', 'Movement frame', 'Detail crop'][n - 1],
          sortOrder: n - 1,
        })),
      });
    }
  }
  console.log(`  ✔ products (${PRODUCTS.length}, 3 images each)`);

  // --- Lookbook ------------------------------------------------------------
  if ((await prisma.lookbookImage.count()) === 0) {
    for (const [index, item] of LOOKBOOK.entries()) {
      const collection = await prisma.collection.findUnique({
        where: { slug: item.collectionSlug },
      });
      await prisma.lookbookImage.create({
        data: {
          url: ph(item.name),
          alt: item.caption,
          caption: item.caption,
          collectionId: collection?.id,
          season: collection?.season,
          occasion: item.occasion,
          spanHint: item.spanHint,
          sortOrder: index,
        },
      });
    }
  }
  console.log(`  ✔ lookbook (${LOOKBOOK.length})`);

  // --- Journal -------------------------------------------------------------
  for (const post of BLOG_POSTS) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log(`  ✔ journal posts (${BLOG_POSTS.length})`);

  // --- Testimonials & tiles ------------------------------------------------
  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({ data: TESTIMONIALS });
  }
  if ((await prisma.homeTile.count()) === 0) {
    await prisma.homeTile.createMany({ data: HOME_TILES });
  }
  console.log(`  ✔ testimonials (${TESTIMONIALS.length}) and home tiles (${HOME_TILES.length})`);

  // --- A demo measurement profile, design and order ------------------------
  await seedDemoOrder(customer.id);

  // --- Inbox ---------------------------------------------------------------
  if ((await prisma.b2BEnquiry.count()) === 0) {
    await prisma.b2BEnquiry.createMany({
      data: [
        {
          companyName: 'Adeyemi & Partners',
          contactName: 'Ngozi Uche',
          email: 'ngozi@adeyemipartners.ng',
          phone: '+234 802 111 2233',
          industry: 'Legal',
          headcount: 14,
          garmentTypes: ['Blazer & trouser', 'Blazer & skirt', 'Waistcoat set'],
          neededBy: new Date('2026-01-15'),
          budgetNote: 'Approved up to NGN 3.5m, procurement needs an itemised proforma.',
          message:
            'We are refreshing partner and senior associate dressing ahead of our anniversary. Fourteen people, mixed cuts, one cloth. Can you measure on site in Victoria Island?',
          status: 'NEW',
        },
        {
          companyName: 'Ìtura Hotels',
          contactName: 'Damilola Ade',
          email: 'd.ade@iturahotels.com',
          phone: '+234 803 444 5566',
          industry: 'Hospitality',
          headcount: 40,
          garmentTypes: ['Blazer & skirt', 'Waistcoat set'],
          budgetNote: 'Phased over two quarters.',
          message:
            'Front-of-house uniform for two properties. We want something that does not look like a uniform. Adire would be ideal if it can survive daily wear.',
          status: 'IN_PROGRESS',
          adminNote: 'Sent swatch pack 12/08. Damilola to confirm cloth by end of month.',
        },
      ],
    });
  }

  if ((await prisma.contactMessage.count()) === 0) {
    await prisma.contactMessage.createMany({
      data: [
        {
          name: 'Bisola Ajayi',
          email: 'bisola.ajayi@example.com',
          phone: '+1 713 555 0142',
          topic: 'Sizing',
          message:
            'I am in Houston and cannot get to a tailor. Is the video call fitting available in the US timezone, and how far ahead should I book?',
          status: 'NEW',
        },
        {
          name: 'Halima Bello',
          email: 'halima@example.com',
          topic: 'Fabric',
          message:
            'I have four metres of sányán from my mother that I would like made into a three-piece. Is that enough, and do you deduct the cloth cost?',
          status: 'NEW',
        },
      ],
    });
  }
  console.log('  ✔ studio inbox (2 B2B enquiries, 2 messages)');

  console.log('\n✔ Seed complete.\n');
  console.log(`  Studio:  http://localhost:3000/studio`);
  console.log(`  Sign in: ${adminEmail} / ${adminPassword}`);
  console.log(`  Customer demo: demo@preeskahmour.com / Demo2024!\n`);
}

/**
 * One worked example end-to-end: a saved measurement profile, a custom design
 * built from it, and a paid order. Gives /studio and /account something real
 * to render on a fresh install.
 */
async function seedDemoOrder(userId: string) {
  if ((await prisma.order.count()) > 0) return;

  const profile = await prisma.measurementProfile.create({
    data: {
      userId,
      name: 'Adaeze — everyday',
      source: 'MANUAL',
      isDefault: true,
      heightCm: 168,
      weightKg: 66,
      fitPreference: 'REGULAR',
      bustCm: 92,
      underbustCm: 78,
      waistCm: 74,
      hipCm: 99,
      shoulderCm: 39.5,
      backWidthCm: 36,
      neckCm: 33,
      bicepCm: 29,
      wristCm: 16,
      sleeveLengthCm: 58,
      jacketLengthCm: 66,
      inseamCm: 76,
      outseamCm: 103,
      thighCm: 56,
      kneeCm: 36,
      ankleCm: 24,
      skirtLengthCm: 62,
      notes: 'Right shoulder sits about 1cm lower than the left.',
    },
  });

  const [baseStyle, fabric] = await Promise.all([
    prisma.baseStyle.findUnique({ where: { slug: 'blazer-trouser' } }),
    prisma.fabric.findUnique({ where: { slug: 'adire-eleko-indigo' } }),
  ]);
  if (!baseStyle || !fabric) return;

  const optionSlugs = [
    'lapel-peak',
    'closure-single',
    'buttons-two',
    'button-horn-black',
    'pocket-besom',
    'sleeve-full',
    'lining-gold',
    'trim-none',
  ];
  const options = await prisma.designOption.findMany({
    where: { slug: { in: optionSlugs }, baseStyleId: null },
  });

  const optionsTotal = options.reduce((sum, o) => sum + o.priceModifierKobo, 0);
  const clothTotal = Math.round(fabric.pricePerMeterKobo * baseStyle.yardageMeters);
  const total = baseStyle.basePriceKobo + clothTotal + optionsTotal;

  const design = await prisma.customDesign.create({
    data: {
      userId,
      name: 'Adire peak-lapel two-piece',
      baseStyleId: baseStyle.id,
      fabricId: fabric.id,
      fit: 'REGULAR',
      measurementProfileId: profile.id,
      monogram: 'AN',
      totalPriceKobo: total,
      isDraft: false,
      snapshot: {
        baseStyle: { slug: baseStyle.slug, name: baseStyle.name },
        fabric: { slug: fabric.slug, name: fabric.name, family: fabric.family, colorHex: fabric.colorHex },
        fit: 'REGULAR',
        options: options.map((o) => ({ slug: o.slug, name: o.name, category: o.category, colorHex: o.colorHex })),
      },
      options: { create: options.map((o) => ({ designOptionId: o.id })) },
    },
  });

  // A second design left as a draft, so /account has one of each state.
  const linen = await prisma.fabric.findUnique({ where: { slug: 'linen-irish-chalk' } });
  if (linen) {
    await prisma.customDesign.create({
      data: {
        userId,
        name: 'Linen summer blazer (draft)',
        baseStyleId: baseStyle.id,
        fabricId: linen.id,
        fit: 'RELAXED',
        measurementProfileId: profile.id,
        totalPriceKobo: baseStyle.basePriceKobo + Math.round(linen.pricePerMeterKobo * baseStyle.yardageMeters * 1.12),
        isDraft: true,
      },
    });
  }

  const shipping = 350_00 * 10; // Lagos flat rate, in kobo
  await prisma.order.create({
    data: {
      reference: 'PKM-4A9C21',
      userId,
      email: 'demo@preeskahmour.com',
      phone: '+234 801 234 5678',
      customerName: 'Adaeze Nwosu',
      shipFullName: 'Adaeze Nwosu',
      shipLine1: '18 Glover Road',
      shipCity: 'Ikoyi',
      shipState: 'Lagos',
      shipCountry: 'Nigeria',
      status: 'STITCHING',
      subtotalKobo: total,
      shippingKobo: 0,
      totalKobo: total,
      paymentProvider: 'PAYSTACK',
      paymentStatus: 'SUCCEEDED',
      paymentReference: 'demo_seed_reference',
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
      atelierNotes: 'Cloth cut 14/08. Right shoulder dropped 1cm per profile note.',
      items: {
        create: [
          {
            customDesignId: design.id,
            name: 'Adire peak-lapel two-piece',
            descriptor: 'Adire Eléko Indigo · Peak lapel · Besom pockets · Regular fit',
            imageUrl: ph('product-abeokuta-adire-blazer-1'),
            unitPriceKobo: total,
            quantity: 1,
            totalKobo: total,
            measurementSnapshot: {
              bustCm: 92, waistCm: 74, hipCm: 99, shoulderCm: 39.5,
              sleeveLengthCm: 58, jacketLengthCm: 66, inseamCm: 76,
              source: 'MANUAL',
              notes: 'Right shoulder sits about 1cm lower than the left.',
            },
            designSnapshot: design.snapshot as Prisma.InputJsonValue,
          },
        ],
      },
    },
  });

  void shipping;
  console.log('  ✔ demo measurement profile, 2 designs and 1 order');
}

main()
  .catch((error) => {
    console.error('\n✖ Seed failed:\n', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
