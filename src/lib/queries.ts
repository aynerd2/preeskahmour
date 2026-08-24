import 'server-only';

import type { FabricFamily, Occasion, Prisma } from '@prisma/client';
import { prisma, safeQuery } from './prisma';

/**
 * Read helpers shared by the public pages.
 *
 * Every one goes through `safeQuery`, so a database hiccup degrades a section
 * into its empty state rather than 500-ing the whole marketing site.
 */

// --- Fabrics ----------------------------------------------------------------

export const fabricSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  family: true,
  weight: true,
  colorName: true,
  colorHex: true,
  colorTags: true,
  swatchImage: true,
  textureImage: true,
  detailImage: true,
  pricePerMeterKobo: true,
  composition: true,
  gsm: true,
  widthCm: true,
  origin: true,
  artisanNote: true,
  occasions: true,
  inStock: true,
  isFeatured: true,
} satisfies Prisma.FabricSelect;

export type FabricCard = Prisma.FabricGetPayload<{ select: typeof fabricSelect }>;

export async function getFabrics(filters?: {
  families?: FabricFamily[];
  occasions?: Occasion[];
  colors?: string[];
  inStockOnly?: boolean;
  search?: string;
  take?: number;
}) {
  const where: Prisma.FabricWhereInput = {};
  if (filters?.families?.length) where.family = { in: filters.families };
  if (filters?.occasions?.length) where.occasions = { hasSome: filters.occasions };
  if (filters?.colors?.length) where.colorTags = { hasSome: filters.colors };
  if (filters?.inStockOnly) where.inStock = true;
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { colorName: { contains: filters.search, mode: 'insensitive' } },
      { origin: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return safeQuery(
    () =>
      prisma.fabric.findMany({
        where,
        select: fabricSelect,
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
        take: filters?.take,
      }),
    [] as FabricCard[],
  );
}

export async function getFeaturedFabrics(take = 8) {
  return safeQuery(
    () =>
      prisma.fabric.findMany({
        where: { inStock: true, isFeatured: true },
        select: fabricSelect,
        orderBy: [{ sortOrder: 'asc' }],
        take,
      }),
    [] as FabricCard[],
  );
}

export async function getFabricBySlug(slug: string) {
  return safeQuery(() => prisma.fabric.findUnique({ where: { slug } }), null);
}

/** Distinct colour tags across the catalogue, for the fabric-library filter. */
export async function getFabricColorTags() {
  const rows = await safeQuery(
    () => prisma.fabric.findMany({ select: { colorTags: true } }),
    [] as { colorTags: string[] }[],
  );
  return [...new Set(rows.flatMap((r) => r.colorTags))].sort();
}

// --- Products ---------------------------------------------------------------

export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  subtitle: true,
  priceKobo: true,
  compareAtKobo: true,
  occasion: true,
  silhouette: true,
  isMadeToMeasure: true,
  leadTimeDays: true,
  images: { select: { url: true, alt: true }, orderBy: { sortOrder: 'asc' }, take: 2 },
  fabric: { select: { name: true, family: true, colorHex: true, swatchImage: true } },
  collection: { select: { name: true, slug: true } },
} satisfies Prisma.ProductSelect;

export type ProductCard = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export type ProductSort = 'featured' | 'newest' | 'price-asc' | 'price-desc';

function productOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'newest':
      return [{ createdAt: 'desc' }];
    case 'price-asc':
      return [{ priceKobo: 'asc' }];
    case 'price-desc':
      return [{ priceKobo: 'desc' }];
    default:
      return [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }];
  }
}

export async function getProducts(filters?: {
  occasions?: Occasion[];
  silhouettes?: string[];
  families?: FabricFamily[];
  collectionSlug?: string;
  sort?: ProductSort;
  take?: number;
}) {
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (filters?.occasions?.length) where.occasion = { in: filters.occasions };
  if (filters?.silhouettes?.length) where.silhouette = { in: filters.silhouettes };
  if (filters?.families?.length) where.fabric = { family: { in: filters.families } };
  if (filters?.collectionSlug) where.collection = { slug: filters.collectionSlug };

  return safeQuery(
    () =>
      prisma.product.findMany({
        where,
        select: productCardSelect,
        orderBy: productOrderBy(filters?.sort ?? 'featured'),
        take: filters?.take,
      }),
    [] as ProductCard[],
  );
}

export async function getProductBySlug(slug: string) {
  return safeQuery(
    () =>
      prisma.product.findFirst({
        where: { slug, isActive: true },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          fabric: true,
          baseStyle: true,
          collection: true,
        },
      }),
    null,
  );
}

export async function getRelatedProducts(product: {
  id: string;
  occasion: Occasion;
  collectionId: string | null;
}) {
  return safeQuery(
    () =>
      prisma.product.findMany({
        where: {
          isActive: true,
          id: { not: product.id },
          OR: [
            { occasion: product.occasion },
            product.collectionId ? { collectionId: product.collectionId } : {},
          ],
        },
        select: productCardSelect,
        take: 4,
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
      }),
    [] as ProductCard[],
  );
}

/** Distinct silhouette tags, for the shop filter rail. */
export async function getSilhouettes() {
  const rows = await safeQuery(
    () =>
      prisma.product.findMany({
        where: { isActive: true },
        select: { silhouette: true },
        distinct: ['silhouette'],
        orderBy: { silhouette: 'asc' },
      }),
    [] as { silhouette: string }[],
  );
  return rows.map((r) => r.silhouette);
}

// --- Collections ------------------------------------------------------------

export async function getCollections(featuredOnly = false) {
  return safeQuery(
    () =>
      prisma.collection.findMany({
        where: { isActive: true, ...(featuredOnly ? { isFeatured: true } : {}) },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: { _count: { select: { products: true } } },
      }),
    [],
  );
}

export async function getCollectionBySlug(slug: string) {
  return safeQuery(
    () => prisma.collection.findFirst({ where: { slug, isActive: true } }),
    null,
  );
}

// --- Builder catalogue ------------------------------------------------------

export async function getBaseStyles() {
  return safeQuery(
    () =>
      prisma.baseStyle.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
    [],
  );
}

export async function getDesignOptions() {
  return safeQuery(
    () =>
      prisma.designOption.findMany({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      }),
    [],
  );
}

// --- Editorial --------------------------------------------------------------

export async function getHomeTiles() {
  return safeQuery(
    () => prisma.homeTile.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    [],
  );
}

export async function getTestimonials(featuredOnly = false, take = 6) {
  return safeQuery(
    () =>
      prisma.testimonial.findMany({
        where: { isActive: true, ...(featuredOnly ? { isFeatured: true } : {}) },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        take,
      }),
    [],
  );
}

export async function getLookbookImages(filters?: { collectionSlug?: string; season?: string }) {
  return safeQuery(
    () =>
      prisma.lookbookImage.findMany({
        where: {
          isActive: true,
          ...(filters?.collectionSlug ? { collection: { slug: filters.collectionSlug } } : {}),
          ...(filters?.season ? { season: filters.season } : {}),
        },
        include: { collection: { select: { name: true, slug: true } } },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
    [],
  );
}

export async function getBlogPosts(opts?: { take?: number; category?: string }) {
  return safeQuery(
    () =>
      prisma.blogPost.findMany({
        where: {
          status: 'PUBLISHED',
          publishedAt: { lte: new Date() },
          ...(opts?.category && opts.category !== 'All' ? { category: opts.category } : {}),
        },
        orderBy: { publishedAt: 'desc' },
        take: opts?.take,
      }),
    [],
  );
}

export async function getBlogPostBySlug(slug: string) {
  return safeQuery(
    () => prisma.blogPost.findFirst({ where: { slug, status: 'PUBLISHED' } }),
    null,
  );
}

export async function getBlogCategories() {
  const rows = await safeQuery(
    () =>
      prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        select: { category: true },
        distinct: ['category'],
      }),
    [] as { category: string }[],
  );
  return rows.map((r) => r.category).sort();
}
