import type { MetadataRoute } from 'next';

import { prisma, safeQuery } from '@/lib/prisma';
import { absoluteUrl } from '@/lib/utils';

/**
 * Sitemap. Static routes plus everything published in the database.
 *
 * /studio, /account, /checkout and the API are excluded here and in
 * robots.txt — nothing behind auth or mid-transaction belongs in an index.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/shop'), changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/builder'), changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/fabrics'), changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/lookbook'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/how-it-works'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/measurement-guide'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/our-story'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/journal'), changeFrequency: 'weekly', priority: 0.6 },
    { url: absoluteUrl('/corporate'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly', priority: 0.5 },
    { url: absoluteUrl('/returns'), changeFrequency: 'yearly', priority: 0.4 },
  ];

  const [products, fabrics, posts, collections] = await Promise.all([
    safeQuery(
      () =>
        prisma.product.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
      [] as { slug: string; updatedAt: Date }[],
    ),
    safeQuery(
      () => prisma.fabric.findMany({ select: { slug: true, updatedAt: true } }),
      [] as { slug: string; updatedAt: Date }[],
    ),
    safeQuery(
      () =>
        prisma.blogPost.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
        }),
      [] as { slug: string; updatedAt: Date }[],
    ),
    safeQuery(
      () =>
        prisma.collection.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
      [] as { slug: string; updatedAt: Date }[],
    ),
  ]);

  return [
    ...staticRoutes,
    ...products.map((p) => ({
      url: absoluteUrl(`/shop/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...fabrics.map((f) => ({
      url: absoluteUrl(`/fabrics/${f.slug}`),
      lastModified: f.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/journal/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
    ...collections.map((c) => ({
      url: absoluteUrl(`/lookbook?collection=${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
