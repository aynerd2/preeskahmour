import { z } from 'zod';

import { MEASUREMENT_FIELDS, type MeasurementKey } from './measurements';

/**
 * Every shape that crosses a trust boundary.
 *
 * The same schema is used by the form (via @hookform/resolvers) and by the
 * API route or server action that receives it, so client and server can never
 * disagree about what is valid. Nothing here is duplicated in a route handler.
 */

// --- primitives -------------------------------------------------------------

/**
 * Nigerian numbers arrive as 0801…, +234801…, 234801… and with spaces or
 * dashes. Accept all of them and let the atelier deal with the formatting —
 * rejecting a real customer over a leading zero is a worse outcome than
 * storing an untidy string.
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(7, 'That phone number looks too short')
  .max(24, 'That phone number looks too long')
  .regex(/^[+0-9()\-\s]+$/, 'Use digits, spaces, brackets, + and - only');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')
  .max(200);

export const nameSchema = z.string().trim().min(2, 'Tell us your name').max(120);

/**
 * Honeypot. A field hidden from humans by CSS; bots fill it in. Anything
 * non-empty is rejected silently by the route with a 200, so the bot has no
 * signal that it failed.
 */
export const honeypotSchema = z.string().max(0).optional().or(z.literal(''));

// --- inbound forms ----------------------------------------------------------

export const CONTACT_TOPICS = [
  'General',
  'Sizing',
  'Fabric',
  'Bridal',
  'An existing order',
  'Press',
  'Newsletter',
] as const;

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  topic: z.enum(CONTACT_TOPICS).default('General'),
  message: z.string().trim().min(5, 'Tell us a little more').max(4000),
  website: honeypotSchema,
});

export type ContactInput = z.infer<typeof contactSchema>;

export const GARMENT_TYPES = [
  'Blazer & trouser',
  'Blazer & skirt',
  'Waistcoat set',
  'Wrap jacket',
  'Maternity-adjustable',
  'Not sure yet',
] as const;

export const b2bSchema = z.object({
  companyName: z.string().trim().min(2, 'Which organisation?').max(160),
  contactName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  industry: z.string().trim().max(120).optional().or(z.literal('')),
  headcount: z.coerce
    .number()
    .int()
    .min(6, 'Our corporate desk starts at six pieces')
    .max(5000, 'Talk to us directly for orders this large')
    .optional(),
  garmentTypes: z.array(z.enum(GARMENT_TYPES)).max(6).default([]),
  neededBy: z.string().trim().max(40).optional().or(z.literal('')),
  budgetNote: z.string().trim().max(400).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Tell us what you need').max(4000),
  website: honeypotSchema,
});

export type B2BInput = z.infer<typeof b2bSchema>;

// --- auth -------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema.optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'Use at least 8 characters')
      .max(200)
      // Deliberately light: length does more for security than forced symbols,
      // and complexity rules push people towards reused passwords.
      .regex(/[a-zA-Z]/, 'Include at least one letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Those passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// --- measurements -----------------------------------------------------------

/**
 * Built from the field dictionary so the bounds shown in the form and the
 * bounds enforced on the server are the same numbers, from one source.
 */
const measurementValues = Object.fromEntries(
  MEASUREMENT_FIELDS.map((field) => [
    field.key,
    z.coerce
      .number()
      .min(field.min, `${field.label} should be at least ${field.min}cm`)
      .max(field.max, `${field.label} should be under ${field.max}cm`)
      .optional()
      .nullable(),
  ]),
) as unknown as Record<MeasurementKey, z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;

export const measurementProfileSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(1, 'Give this profile a name').max(80).default('My measurements'),
  source: z.enum(['MANUAL', 'ESTIMATED', 'ATELIER']).default('MANUAL'),

  heightCm: z.coerce.number().min(130).max(210).optional().nullable(),
  weightKg: z.coerce.number().min(35).max(200).optional().nullable(),
  fitPreference: z.enum(['REGULAR', 'SLIM', 'RELAXED', 'MATERNITY']).default('REGULAR'),
  braBandCm: z.coerce.number().min(55).max(130).optional().nullable(),
  torsoLength: z.enum(['SHORT', 'AVERAGE', 'LONG']).optional().nullable(),
  shoulderSlope: z.enum(['SQUARE', 'AVERAGE', 'SLOPED']).optional().nullable(),
  pregnancyWeeks: z.coerce.number().int().min(1).max(42).optional().nullable(),

  ...measurementValues,

  notes: z.string().trim().max(1000).optional().nullable(),
  isDefault: z.boolean().default(false),
});

export type MeasurementProfileInput = z.infer<typeof measurementProfileSchema>;

export const estimateSchema = z.object({
  heightCm: z.coerce.number().min(130, 'Height in centimetres').max(210),
  weightKg: z.coerce.number().min(35, 'Weight in kilograms').max(200),
  fitPreference: z.enum(['REGULAR', 'SLIM', 'RELAXED', 'MATERNITY']).default('REGULAR'),
  braBandCm: z.coerce.number().min(55).max(130).optional().nullable(),
  torsoLength: z.enum(['SHORT', 'AVERAGE', 'LONG']).default('AVERAGE'),
  shoulderSlope: z.enum(['SQUARE', 'AVERAGE', 'SLOPED']).default('AVERAGE'),
  pregnancyWeeks: z.coerce.number().int().min(1).max(42).optional().nullable(),
});

export type EstimateInputSchema = z.infer<typeof estimateSchema>;

// --- the builder ------------------------------------------------------------

export const customDesignSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(1).max(120).default('Untitled design'),
  baseStyleId: z.string().cuid('Choose a style'),
  fabricId: z.string().cuid('Choose a cloth'),
  fit: z.enum(['REGULAR', 'SLIM', 'RELAXED', 'MATERNITY']).default('REGULAR'),
  optionIds: z.array(z.string().cuid()).max(20).default([]),
  measurementProfileId: z.string().cuid().optional().nullable(),
  monogram: z
    .string()
    .trim()
    .max(4, 'Up to four characters')
    .regex(/^[A-Za-z.\s]*$/, 'Letters only')
    .optional()
    .or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  isDraft: z.boolean().default(true),
});

export type CustomDesignInput = z.infer<typeof customDesignSchema>;

// --- checkout ---------------------------------------------------------------

export const addressSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  line1: z.string().trim().min(3, 'Street address').max(200),
  line2: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City').max(100),
  state: z.string().trim().min(2, 'State').max(100),
  country: z.string().trim().min(2).max(100).default('Nigeria'),
  postcode: z.string().trim().max(20).optional().or(z.literal('')),
});

export const checkoutLineSchema = z.object({
  kind: z.enum(['PRODUCT', 'CUSTOM']),
  productId: z.string().cuid().optional(),
  customDesignId: z.string().cuid().optional(),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
});

export const checkoutSchema = z.object({
  email: emailSchema,
  customerName: nameSchema,
  phone: phoneSchema,
  address: addressSchema,
  items: z.array(checkoutLineSchema).min(1, 'Your bag is empty').max(20),
  provider: z.enum(['PAYSTACK', 'STRIPE']).default('PAYSTACK'),
  customerNote: z.string().trim().max(1000).optional().or(z.literal('')),
  /** Measurement profile applied to any ready-to-wear lines in this order. */
  measurementProfileId: z.string().cuid().optional().nullable(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// --- studio -----------------------------------------------------------------

export const fabricSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z.string().trim().min(2).max(90).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes'),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  family: z.enum(['ANKARA', 'ASO_OKE', 'ADIRE', 'AKWETE', 'GEORGE', 'KENTE', 'WOOL', 'LINEN', 'SATIN']),
  weight: z.enum(['LIGHT', 'MID', 'HEAVY']).default('MID'),
  colorName: z.string().trim().min(2).max(100),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #0B4D3F'),
  colorTags: z.array(z.string().trim().toLowerCase().max(40)).max(12).default([]),
  swatchImage: z.string().trim().max(600).optional().or(z.literal('')),
  textureImage: z.string().trim().max(600).optional().or(z.literal('')),
  detailImage: z.string().trim().max(600).optional().or(z.literal('')),
  /** Entered in naira in the studio; converted to kobo before writing. */
  pricePerMeterNaira: z.coerce.number().min(100).max(2_000_000),
  composition: z.string().trim().max(200).optional().or(z.literal('')),
  gsm: z.coerce.number().int().min(30).max(900).optional().nullable(),
  widthCm: z.coerce.number().int().min(20).max(320).optional().nullable(),
  origin: z.string().trim().max(160).optional().or(z.literal('')),
  artisanNote: z.string().trim().max(2000).optional().or(z.literal('')),
  occasions: z.array(z.enum(['CORPORATE', 'BRIDAL', 'MATERNITY', 'PARTY', 'EVERYDAY'])).default([]),
  inStock: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const productSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z.string().trim().min(2).max(90).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes'),
  name: z.string().trim().min(2).max(160),
  subtitle: z.string().trim().max(200).optional().or(z.literal('')),
  description: z.string().trim().max(4000).optional().or(z.literal('')),
  storyNote: z.string().trim().max(2000).optional().or(z.literal('')),
  priceNaira: z.coerce.number().min(1000).max(50_000_000),
  compareAtNaira: z.coerce.number().min(0).max(50_000_000).optional().nullable(),
  occasion: z.enum(['CORPORATE', 'BRIDAL', 'MATERNITY', 'PARTY', 'EVERYDAY']),
  silhouette: z.string().trim().min(2).max(120),
  baseStyleId: z.string().cuid().optional().nullable(),
  fabricId: z.string().cuid().optional().nullable(),
  collectionId: z.string().cuid().optional().nullable(),
  isMadeToMeasure: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  leadTimeDays: z.coerce.number().int().min(1).max(180).default(21),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  seoTitle: z.string().trim().max(160).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(320).optional().or(z.literal('')),
  images: z
    .array(
      z.object({
        url: z.string().trim().min(1).max(600),
        alt: z.string().trim().max(300).optional().or(z.literal('')),
        briefNote: z.string().trim().max(500).optional().or(z.literal('')),
      }),
    )
    .max(10)
    .default([]),
});

export const blogPostSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z.string().trim().min(2).max(90).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes'),
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().max(500).optional().or(z.literal('')),
  body: z.string().trim().min(20, 'The article needs a body'),
  coverImage: z.string().trim().max(600).optional().or(z.literal('')),
  coverAlt: z.string().trim().max(300).optional().or(z.literal('')),
  category: z.string().trim().min(2).max(60).default('Journal'),
  tags: z.array(z.string().trim().max(40)).max(10).default([]),
  authorName: z.string().trim().min(2).max(120).default('Prisca Ogunlade'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  seoTitle: z.string().trim().max(160).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(320).optional().or(z.literal('')),
});

export const collectionSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z.string().trim().min(2).max(90).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes'),
  name: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(200).optional().or(z.literal('')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  season: z.string().trim().max(80).optional().or(z.literal('')),
  heroImage: z.string().trim().max(600).optional().or(z.literal('')),
  tileImage: z.string().trim().max(600).optional().or(z.literal('')),
  occasion: z.enum(['CORPORATE', 'BRIDAL', 'MATERNITY', 'PARTY', 'EVERYDAY']).optional().nullable(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const baseStyleSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z.string().trim().min(2).max(90).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes'),
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(160).optional().or(z.literal('')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  basePriceNaira: z.coerce.number().min(1000).max(50_000_000),
  yardageMeters: z.coerce.number().min(0.5).max(20),
  thumbnailImage: z.string().trim().max(600).optional().or(z.literal('')),
  previewMaskUrl: z.string().trim().max(600).optional().or(z.literal('')),
  previewShadingUrl: z.string().trim().max(600).optional().or(z.literal('')),
  occasions: z.array(z.enum(['CORPORATE', 'BRIDAL', 'MATERNITY', 'PARTY', 'EVERYDAY'])).default([]),
  supportedFits: z.array(z.enum(['REGULAR', 'SLIM', 'RELAXED', 'MATERNITY'])).min(1).default(['REGULAR']),
  optionCategories: z
    .array(z.enum(['LAPEL', 'CLOSURE', 'BUTTON_COUNT', 'BUTTON_COLOR', 'POCKET', 'SLEEVE', 'LINING', 'TRIM']))
    .default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const designOptionSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z.string().trim().min(2).max(90).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes'),
  name: z.string().trim().min(2).max(120),
  category: z.enum(['LAPEL', 'CLOSURE', 'BUTTON_COUNT', 'BUTTON_COLOR', 'POCKET', 'SLEEVE', 'LINING', 'TRIM']),
  description: z.string().trim().max(600).optional().or(z.literal('')),
  priceModifierNaira: z.coerce.number().min(0).max(5_000_000).default(0),
  iconUrl: z.string().trim().max(600).optional().or(z.literal('')),
  overlayUrl: z.string().trim().max(600).optional().or(z.literal('')),
  colorHex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #C6A15B')
    .optional()
    .or(z.literal('')),
  zIndex: z.coerce.number().int().min(0).max(100).default(10),
  baseStyleId: z.string().cuid().optional().nullable(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const testimonialSchema = z.object({
  id: z.string().cuid().optional(),
  quote: z.string().trim().min(10).max(1000),
  authorName: z.string().trim().min(2).max(120),
  authorRole: z.string().trim().max(120).optional().or(z.literal('')),
  location: z.string().trim().max(120).optional().or(z.literal('')),
  imageUrl: z.string().trim().max(600).optional().or(z.literal('')),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const lookbookImageSchema = z.object({
  id: z.string().cuid().optional(),
  url: z.string().trim().min(1).max(600),
  alt: z.string().trim().max(300).optional().or(z.literal('')),
  caption: z.string().trim().max(300).optional().or(z.literal('')),
  briefNote: z.string().trim().max(500).optional().or(z.literal('')),
  collectionId: z.string().cuid().optional().nullable(),
  season: z.string().trim().max(80).optional().or(z.literal('')),
  occasion: z.enum(['CORPORATE', 'BRIDAL', 'MATERNITY', 'PARTY', 'EVERYDAY']).optional().nullable(),
  spanHint: z.coerce.number().int().min(1).max(3).default(1),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const homeTileSchema = z.object({
  id: z.string().cuid().optional(),
  label: z.string().trim().min(2).max(80),
  subtitle: z.string().trim().max(300).optional().or(z.literal('')),
  href: z.string().trim().min(1).max(300),
  imageUrl: z.string().trim().max(600).optional().or(z.literal('')),
  briefNote: z.string().trim().max(500).optional().or(z.literal('')),
  occasion: z.enum(['CORPORATE', 'BRIDAL', 'MATERNITY', 'PARTY', 'EVERYDAY']).optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const orderUpdateSchema = z.object({
  id: z.string().cuid(),
  status: z.enum([
    'PENDING_PAYMENT', 'PAID', 'IN_ATELIER', 'CUTTING', 'STITCHING',
    'FINISHING', 'QUALITY_CHECK', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED',
  ]),
  atelierNotes: z.string().trim().max(4000).optional().or(z.literal('')),
  trackingUrl: z.string().trim().max(600).optional().or(z.literal('')),
});

export const enquiryUpdateSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'QUOTED', 'CLOSED']),
  adminNote: z.string().trim().max(4000).optional().or(z.literal('')),
});

/** Naira in the studio forms, kobo in the database. One place to convert. */
export const nairaToKobo = (naira: number) => Math.round(naira * 100);
export const koboToNaira = (kobo: number) => kobo / 100;
