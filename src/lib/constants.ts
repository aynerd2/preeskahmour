import type {
  DesignOptionCategory,
  FabricFamily,
  FabricWeight,
  FitPreference,
  Occasion,
  OrderStatus,
} from '@prisma/client';

export const BRAND = {
  name: 'Preeskahmour',
  legalName: 'Preeskahmour Atelier Ltd',
  founder: 'Prisca Ogunlade',
  tagline: 'Made to your measure. Cut from our cloth.',
  descriptor:
    'A Nigerian house of made-to-measure tailoring for women — Ankara, aso-oke, adire and fine wool, cut for every stage of a life.',
  instagram: 'https://instagram.com/preeskahmour',
  instagramHandle: '@preeskahmour',
  email: 'atelier@preeskahmour.com',
  phone: '+234 800 000 0000',
  whatsapp: '+2348000000000',
  addressLines: ['The Atelier, 14 Aké Close', 'Ikoyi, Lagos', 'Nigeria'],
  originStory: 'Ado-Ekiti, Ekiti State',
} as const;

export const OCCASION_LABELS: Record<Occasion, string> = {
  CORPORATE: 'Corporate',
  BRIDAL: 'Bridal',
  MATERNITY: 'Maternity',
  PARTY: 'Party',
  EVERYDAY: 'Everyday',
};

export const OCCASION_BLURBS: Record<Occasion, string> = {
  CORPORATE: 'Boardroom armour in wool, linen and quiet adire.',
  BRIDAL: 'For the bride, her mother, and the women beside her.',
  MATERNITY: 'Cut with expansion panels that grow with you, week by week.',
  PARTY: 'Aso-oke, sequinned georgette and a hemline that moves.',
  EVERYDAY: 'The suit you reach for without thinking.',
};

export const OCCASION_ORDER: Occasion[] = [
  'CORPORATE',
  'BRIDAL',
  'MATERNITY',
  'PARTY',
  'EVERYDAY',
];

export const FABRIC_FAMILY_LABELS: Record<FabricFamily, string> = {
  ANKARA: 'Ankara',
  ASO_OKE: 'Aso-oke',
  ADIRE: 'Adire',
  AKWETE: 'Akwete',
  GEORGE: 'George & Brocade',
  KENTE: 'Kente-inspired',
  WOOL: 'Wool',
  LINEN: 'Linen',
  SATIN: 'Satin & Silk',
};

export const FABRIC_FAMILY_NOTES: Record<FabricFamily, string> = {
  ANKARA: 'Dutch wax print. Dense colour, crisp hand, holds a pleat beautifully.',
  ASO_OKE: 'Hand-loomed Yoruba strip cloth. Structural, lightly textured, ceremonial.',
  ADIRE: 'Yoruba indigo resist-dye. Every length differs; no two jackets are twins.',
  AKWETE: 'Igbo hand-woven cloth from Abia State. Raised weft motifs, substantial drape.',
  GEORGE: 'Guinea brocade and George — lustrous, weighty, built for occasion dressing.',
  KENTE: 'Kente-inspired narrow-strip weaves in silk and cotton blends.',
  WOOL: 'Super 110s–130s worsted. The corporate backbone of the house.',
  LINEN: 'Irish and Italian linen for Lagos heat. Crumples honestly.',
  SATIN: 'Silk satin and duchesse for linings, bridal and evening.',
};

export const FABRIC_WEIGHT_LABELS: Record<FabricWeight, string> = {
  LIGHT: 'Light',
  MID: 'Mid-weight',
  HEAVY: 'Heavy',
};

export const FIT_LABELS: Record<FitPreference, string> = {
  REGULAR: 'Regular',
  SLIM: 'Slim',
  RELAXED: 'Relaxed',
  MATERNITY: 'Maternity-adjustable',
};

export const FIT_DESCRIPTIONS: Record<FitPreference, string> = {
  REGULAR: 'Clean through the body with room to move. Our most-ordered cut.',
  SLIM: 'Closer through the waist and sleeve, higher armhole, sharper line.',
  RELAXED: 'Softened shoulder, dropped armhole, generous through the hip.',
  MATERNITY:
    'Hidden expansion panels at both side seams give up to 14cm of growth, with a ribbed under-bust stay and a rebalanced hem so the front never rides up.',
};

export const DESIGN_CATEGORY_LABELS: Record<DesignOptionCategory, string> = {
  LAPEL: 'Lapel',
  CLOSURE: 'Closure',
  BUTTON_COUNT: 'Buttons',
  BUTTON_COLOR: 'Button finish',
  POCKET: 'Pockets',
  SLEEVE: 'Sleeve',
  LINING: 'Lining',
  TRIM: 'Trim & embroidery',
};

export const DESIGN_CATEGORY_ORDER: DesignOptionCategory[] = [
  'LAPEL',
  'CLOSURE',
  'BUTTON_COUNT',
  'BUTTON_COLOR',
  'POCKET',
  'SLEEVE',
  'LINING',
  'TRIM',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Awaiting payment',
  PAID: 'Payment received',
  IN_ATELIER: 'In the atelier',
  CUTTING: 'Cutting',
  STITCHING: 'Stitching',
  FINISHING: 'Finishing',
  QUALITY_CHECK: 'Quality check',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

/** The customer-visible atelier journey, in order. */
export const ORDER_PROGRESS: OrderStatus[] = [
  'PAID',
  'IN_ATELIER',
  'CUTTING',
  'STITCHING',
  'FINISHING',
  'QUALITY_CHECK',
  'SHIPPED',
  'DELIVERED',
];

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
] as const;

export const MAIN_NAV = [
  { label: 'Shop', href: '/shop' },
  { label: 'Design Your Suit', href: '/builder' },
  { label: 'Fabrics', href: '/fabrics' },
  { label: 'Lookbook', href: '/lookbook' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Journal', href: '/journal' },
] as const;

export const FOOTER_NAV = [
  {
    heading: 'Shop',
    links: [
      { label: 'All pieces', href: '/shop' },
      { label: 'Corporate', href: '/shop?occasion=CORPORATE' },
      { label: 'Bridal', href: '/shop?occasion=BRIDAL' },
      { label: 'Maternity', href: '/shop?occasion=MATERNITY' },
      { label: 'Party', href: '/shop?occasion=PARTY' },
      { label: 'Fabric library', href: '/fabrics' },
    ],
  },
  {
    heading: 'Made to measure',
    links: [
      { label: 'Design your suit', href: '/builder' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Measurement guide', href: '/measurement-guide' },
      { label: 'Corporate & bulk', href: '/corporate' },
    ],
  },
  {
    heading: 'House',
    links: [
      { label: 'Our story', href: '/our-story' },
      { label: 'Lookbook', href: '/lookbook' },
      { label: 'Journal', href: '/journal' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Care',
    links: [
      { label: 'Size help', href: '/measurement-guide' },
      { label: 'Returns & alterations', href: '/returns' },
      { label: 'Your account', href: '/account' },
      { label: 'Track an order', href: '/account/orders' },
    ],
  },
] as const;

/** Flat-rate delivery, in kobo. Editable later from /studio settings. */
export const SHIPPING_RATES = {
  LAGOS: 350_000,
  NIGERIA: 650_000,
  INTERNATIONAL: 4_500_000,
} as const;

export const FREE_SHIPPING_THRESHOLD_KOBO = 30_000_000; // NGN 300,000
