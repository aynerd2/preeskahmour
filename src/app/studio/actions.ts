'use server';

import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readMinutes, sanitizeRichText, stripHtml } from '@/lib/sanitize';
import { CONTENT_META, type SiteContentKey } from '@/lib/site-content';
import {
  b2bSchema,
  baseStyleSchema,
  blogPostSchema,
  collectionSchema,
  designOptionSchema,
  enquiryUpdateSchema,
  fabricSchema,
  homeTileSchema,
  lookbookImageSchema,
  nairaToKobo,
  orderUpdateSchema,
  productSchema,
  testimonialSchema,
} from '@/lib/validators';

/**
 * Every write the studio can make.
 *
 * Two rules hold throughout:
 *   1. `requireAdmin()` runs first in every single action. A server action is
 *      a public HTTP endpoint — being reachable only from a page behind a
 *      guard is not itself a guard.
 *   2. Input is parsed with the same Zod schema the form uses, so the server
 *      never trusts a shape just because a form produced it.
 *
 * Money arrives from the studio in naira (what Prisca thinks in) and is
 * converted to kobo here, in one place.
 */

export type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

async function guard(): Promise<Result> {
  try {
    await requireAdmin();
    return { ok: true };
  } catch {
    return { ok: false, error: 'You need to be signed in as an admin.' };
  }
}

function fail(error: unknown, fallback: string): Result<never> {
  // A unique-constraint violation is nearly always a duplicate slug, and
  // saying so is far more useful than "something went wrong".
  const message = error instanceof Error ? error.message : '';
  if (message.includes('Unique constraint')) {
    return { ok: false, error: 'Something with that slug already exists. Choose another.' };
  }
  console.error('[studio]', error);
  return { ok: false, error: fallback };
}

function revalidateAll(paths: string[]) {
  for (const path of paths) revalidatePath(path);
}

const emptyToNull = (value: string | null | undefined) => (value ? value : null);

// ---------------------------------------------------------------------------
// Fabrics
// ---------------------------------------------------------------------------

export async function saveFabric(input: unknown): Promise<Result<{ id: string }>> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = fabricSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }

  const { id, pricePerMeterNaira, ...rest } = parsed.data;

  const data = {
    ...rest,
    description: emptyToNull(rest.description),
    swatchImage: emptyToNull(rest.swatchImage),
    textureImage: emptyToNull(rest.textureImage),
    detailImage: emptyToNull(rest.detailImage),
    composition: emptyToNull(rest.composition),
    origin: emptyToNull(rest.origin),
    artisanNote: emptyToNull(rest.artisanNote),
    pricePerMeterKobo: nairaToKobo(pricePerMeterNaira),
  };

  try {
    const fabric = id
      ? await prisma.fabric.update({ where: { id }, data })
      : await prisma.fabric.create({ data });

    revalidateAll(['/', '/fabrics', `/fabrics/${fabric.slug}`, '/builder', '/studio/fabrics']);
    return { ok: true, data: { id: fabric.id } };
  } catch (error) {
    return fail(error, 'Could not save that fabric.');
  }
}

export async function deleteFabric(id: string): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  try {
    const fabric = await prisma.fabric.findUnique({
      where: { id },
      include: { _count: { select: { products: true, customDesigns: true } } },
    });
    if (!fabric) return { ok: false, error: 'That fabric no longer exists.' };

    // Deleting cloth that a design or product depends on would orphan them
    // and break historical orders. Retire it from sale instead.
    if (fabric._count.products > 0 || fabric._count.customDesigns > 0) {
      return {
        ok: false,
        error: `${fabric.name} is used by ${fabric._count.products} product(s) and ${fabric._count.customDesigns} design(s). Mark it out of stock instead of deleting it.`,
      };
    }

    await prisma.fabric.delete({ where: { id } });
    revalidateAll(['/fabrics', '/builder', '/studio/fabrics']);
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not delete that fabric.');
  }
}

export async function toggleFabricStock(id: string, inStock: boolean): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  try {
    await prisma.fabric.update({ where: { id }, data: { inStock } });
    revalidateAll(['/fabrics', '/builder', '/studio/fabrics']);
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not update that fabric.');
  }
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function saveProduct(input: unknown): Promise<Result<{ id: string }>> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { id, priceNaira, compareAtNaira, images, ...rest } = parsed.data;

  const data = {
    ...rest,
    subtitle: emptyToNull(rest.subtitle),
    description: emptyToNull(rest.description),
    storyNote: emptyToNull(rest.storyNote),
    seoTitle: emptyToNull(rest.seoTitle),
    seoDescription: emptyToNull(rest.seoDescription),
    baseStyleId: rest.baseStyleId || null,
    fabricId: rest.fabricId || null,
    collectionId: rest.collectionId || null,
    priceKobo: nairaToKobo(priceNaira),
    compareAtKobo: compareAtNaira ? nairaToKobo(compareAtNaira) : null,
  };

  try {
    const product = id
      ? await prisma.product.update({
          where: { id },
          data: {
            ...data,
            // Images are replaced wholesale: the form owns the full ordered
            // list, so reconciling individual rows would only invite drift.
            images: {
              deleteMany: {},
              create: images.map((image, index) => ({
                url: image.url,
                alt: emptyToNull(image.alt),
                briefNote: emptyToNull(image.briefNote),
                sortOrder: index,
              })),
            },
          },
        })
      : await prisma.product.create({
          data: {
            ...data,
            images: {
              create: images.map((image, index) => ({
                url: image.url,
                alt: emptyToNull(image.alt),
                briefNote: emptyToNull(image.briefNote),
                sortOrder: index,
              })),
            },
          },
        });

    revalidateAll(['/', '/shop', `/shop/${product.slug}`, '/studio/products']);
    return { ok: true, data: { id: product.id } };
  } catch (error) {
    return fail(error, 'Could not save that product.');
  }
}

export async function deleteProduct(id: string): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { _count: { select: { orderItems: true } } },
    });
    if (!product) return { ok: false, error: 'That product no longer exists.' };

    if (product._count.orderItems > 0) {
      return {
        ok: false,
        error: 'This piece appears on past orders. Set it inactive instead of deleting it.',
      };
    }

    await prisma.product.delete({ where: { id } });
    revalidateAll(['/', '/shop', '/studio/products']);
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not delete that product.');
  }
}

// ---------------------------------------------------------------------------
// Collections, cuts and design options
// ---------------------------------------------------------------------------

export async function saveCollection(input: unknown): Promise<Result<{ id: string }>> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { id, ...rest } = parsed.data;
  const data = {
    ...rest,
    subtitle: emptyToNull(rest.subtitle),
    description: emptyToNull(rest.description),
    season: emptyToNull(rest.season),
    heroImage: emptyToNull(rest.heroImage),
    tileImage: emptyToNull(rest.tileImage),
  };

  try {
    const collection = id
      ? await prisma.collection.update({ where: { id }, data })
      : await prisma.collection.create({ data });

    revalidateAll(['/', '/shop', '/lookbook', '/studio/collections']);
    return { ok: true, data: { id: collection.id } };
  } catch (error) {
    return fail(error, 'Could not save that collection.');
  }
}

export async function deleteCollection(id: string): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  try {
    // Products keep existing; they simply lose the grouping.
    await prisma.product.updateMany({ where: { collectionId: id }, data: { collectionId: null } });
    await prisma.lookbookImage.updateMany({
      where: { collectionId: id },
      data: { collectionId: null },
    });
    await prisma.collection.delete({ where: { id } });

    revalidateAll(['/shop', '/lookbook', '/studio/collections']);
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not delete that collection.');
  }
}

export async function saveBaseStyle(input: unknown): Promise<Result<{ id: string }>> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = baseStyleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { id, basePriceNaira, ...rest } = parsed.data;
  const data = {
    ...rest,
    tagline: emptyToNull(rest.tagline),
    description: emptyToNull(rest.description),
    thumbnailImage: emptyToNull(rest.thumbnailImage),
    previewMaskUrl: emptyToNull(rest.previewMaskUrl),
    previewShadingUrl: emptyToNull(rest.previewShadingUrl),
    basePriceKobo: nairaToKobo(basePriceNaira),
  };

  try {
    const style = id
      ? await prisma.baseStyle.update({ where: { id }, data })
      : await prisma.baseStyle.create({ data });

    revalidateAll(['/builder', '/studio/base-styles']);
    return { ok: true, data: { id: style.id } };
  } catch (error) {
    return fail(error, 'Could not save that cut.');
  }
}

export async function deleteBaseStyle(id: string): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  try {
    const style = await prisma.baseStyle.findUnique({
      where: { id },
      include: { _count: { select: { customDesigns: true, products: true } } },
    });
    if (!style) return { ok: false, error: 'That cut no longer exists.' };

    if (style._count.customDesigns > 0 || style._count.products > 0) {
      return {
        ok: false,
        error: `${style.name} is used by existing designs or products. Set it inactive instead.`,
      };
    }

    await prisma.baseStyle.delete({ where: { id } });
    revalidateAll(['/builder', '/studio/base-styles']);
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not delete that cut.');
  }
}

export async function saveDesignOption(input: unknown): Promise<Result<{ id: string }>> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = designOptionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { id, priceModifierNaira, ...rest } = parsed.data;
  const data = {
    ...rest,
    description: emptyToNull(rest.description),
    iconUrl: emptyToNull(rest.iconUrl),
    overlayUrl: emptyToNull(rest.overlayUrl),
    colorHex: emptyToNull(rest.colorHex),
    baseStyleId: rest.baseStyleId || null,
    priceModifierKobo: nairaToKobo(priceModifierNaira),
  };

  try {
    const option = id
      ? await prisma.designOption.update({ where: { id }, data })
      : await prisma.designOption.create({ data });

    // Only one default per category, per cut.
    if (data.isDefault) {
      await prisma.designOption.updateMany({
        where: {
          category: data.category,
          baseStyleId: data.baseStyleId,
          id: { not: option.id },
        },
        data: { isDefault: false },
      });
    }

    revalidateAll(['/builder', '/studio/design-options']);
    return { ok: true, data: { id: option.id } };
  } catch (error) {
    return fail(error, 'Could not save that option.');
  }
}

export async function deleteDesignOption(id: string): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  try {
    const option = await prisma.designOption.findUnique({
      where: { id },
      include: { _count: { select: { selections: true } } },
    });
    if (!option) return { ok: false, error: 'That option no longer exists.' };

    if (option._count.selections > 0) {
      return {
        ok: false,
        error: 'Existing designs use this option. Set it inactive instead of deleting it.',
      };
    }

    await prisma.designOption.delete({ where: { id } });
    revalidateAll(['/builder', '/studio/design-options']);
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not delete that option.');
  }
}

// ---------------------------------------------------------------------------
// Journal, lookbook, testimonials, tiles
// ---------------------------------------------------------------------------

export async function saveBlogPost(input: unknown): Promise<Result<{ id: string }>> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { id, body, ...rest } = parsed.data;

  // Sanitised on write, once, rather than on every public read.
  const cleanBody = sanitizeRichText(body);

  const data = {
    ...rest,
    body: cleanBody,
    excerpt: rest.excerpt || stripHtml(cleanBody).slice(0, 200),
    coverImage: emptyToNull(rest.coverImage),
    coverAlt: emptyToNull(rest.coverAlt),
    seoTitle: emptyToNull(rest.seoTitle),
    seoDescription: emptyToNull(rest.seoDescription),
    readMinutes: readMinutes(cleanBody),
  };

  try {
    const existing = id ? await prisma.blogPost.findUnique({ where: { id } }) : null;

    // Stamp publishedAt the first time it goes live, and keep the original
    // date on every later edit.
    const publishedAt =
      data.status === 'PUBLISHED' ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null;

    const post = id
      ? await prisma.blogPost.update({ where: { id }, data: { ...data, publishedAt } })
      : await prisma.blogPost.create({ data: { ...data, publishedAt } });

    revalidateAll(['/journal', `/journal/${post.slug}`, '/studio/journal']);
    return { ok: true, data: { id: post.id } };
  } catch (error) {
    return fail(error, 'Could not save that article.');
  }
}

export async function deleteBlogPost(id: string): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  try {
    await prisma.blogPost.delete({ where: { id } });
    revalidateAll(['/journal', '/studio/journal']);
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not delete that article.');
  }
}

export async function saveLookbookImage(input: unknown): Promise<Result<{ id: string }>> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = lookbookImageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { id, ...rest } = parsed.data;
  const data = {
    ...rest,
    alt: emptyToNull(rest.alt),
    caption: emptyToNull(rest.caption),
    briefNote: emptyToNull(rest.briefNote),
    season: emptyToNull(rest.season),
    collectionId: rest.collectionId || null,
  };

  try {
    const image = id
      ? await prisma.lookbookImage.update({ where: { id }, data })
      : await prisma.lookbookImage.create({ data });

    revalidateAll(['/lookbook', '/studio/lookbook']);
    return { ok: true, data: { id: image.id } };
  } catch (error) {
    return fail(error, 'Could not save that image.');
  }
}

export async function deleteLookbookImage(id: string): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  try {
    await prisma.lookbookImage.delete({ where: { id } });
    revalidateAll(['/lookbook', '/studio/lookbook']);
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not delete that image.');
  }
}

export async function saveTestimonial(input: unknown): Promise<Result<{ id: string }>> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { id, ...rest } = parsed.data;
  const data = {
    ...rest,
    authorRole: emptyToNull(rest.authorRole),
    location: emptyToNull(rest.location),
    imageUrl: emptyToNull(rest.imageUrl),
  };

  try {
    const testimonial = id
      ? await prisma.testimonial.update({ where: { id }, data })
      : await prisma.testimonial.create({ data });

    revalidateAll(['/', '/our-story', '/corporate', '/studio/testimonials']);
    return { ok: true, data: { id: testimonial.id } };
  } catch (error) {
    return fail(error, 'Could not save that testimonial.');
  }
}

export async function deleteTestimonial(id: string): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  try {
    await prisma.testimonial.delete({ where: { id } });
    revalidateAll(['/', '/studio/testimonials']);
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not delete that testimonial.');
  }
}

export async function saveHomeTile(input: unknown): Promise<Result<{ id: string }>> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = homeTileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { id, ...rest } = parsed.data;
  const data = {
    ...rest,
    subtitle: emptyToNull(rest.subtitle),
    imageUrl: emptyToNull(rest.imageUrl),
    briefNote: emptyToNull(rest.briefNote),
    occasion: rest.occasion ?? null,
  };

  try {
    const tile = id
      ? await prisma.homeTile.update({ where: { id }, data })
      : await prisma.homeTile.create({ data });

    revalidateAll(['/', '/studio/content']);
    return { ok: true, data: { id: tile.id } };
  } catch (error) {
    return fail(error, 'Could not save that tile.');
  }
}

export async function deleteHomeTile(id: string): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  try {
    await prisma.homeTile.delete({ where: { id } });
    revalidateAll(['/', '/studio/content']);
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not delete that tile.');
  }
}

// ---------------------------------------------------------------------------
// Site content
// ---------------------------------------------------------------------------

const contentSchema = z.object({
  key: z.string().min(1).max(80),
  value: z.unknown(),
});

/**
 * Saves one editable content block. The value is stored as JSON and merged
 * over its default at read time, so a block saved before a new field existed
 * keeps working.
 */
export async function saveContent(input: unknown): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = contentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'That content block is not valid.' };

  const key = parsed.data.key as SiteContentKey;
  const meta = CONTENT_META[key];
  if (!meta) return { ok: false, error: 'Unknown content block.' };

  try {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: parsed.data.value as Prisma.InputJsonValue },
      create: {
        key,
        label: meta.label,
        group: meta.group,
        value: parsed.data.value as Prisma.InputJsonValue,
      },
    });

    // Content blocks feed several pages, so refresh broadly rather than
    // trying to work out which page uses which key.
    revalidateAll([
      '/',
      '/how-it-works',
      '/measurement-guide',
      '/our-story',
      '/corporate',
      '/returns',
      '/contact',
      '/studio/content',
    ]);
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not save that content.');
  }
}

// ---------------------------------------------------------------------------
// Orders and the inbox
// ---------------------------------------------------------------------------

export async function updateOrder(input: unknown): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = orderUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { id, status, atelierNotes, trackingUrl } = parsed.data;

  try {
    await prisma.order.update({
      where: { id },
      data: {
        status,
        atelierNotes: emptyToNull(atelierNotes),
        trackingUrl: emptyToNull(trackingUrl),
      },
    });

    revalidateAll(['/studio/orders', `/studio/orders/${id}`, '/account/orders']);
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not update that order.');
  }
}

export async function updateEnquiry(
  kind: 'B2B' | 'MESSAGE',
  input: unknown,
): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = enquiryUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { id, status, adminNote } = parsed.data;

  try {
    if (kind === 'B2B') {
      await prisma.b2BEnquiry.update({
        where: { id },
        data: { status, adminNote: emptyToNull(adminNote) },
      });
    } else {
      await prisma.contactMessage.update({
        where: { id },
        data: { status, adminNote: emptyToNull(adminNote) },
      });
    }

    revalidatePath('/studio/enquiries');
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not update that enquiry.');
  }
}

export async function deleteEnquiry(kind: 'B2B' | 'MESSAGE', id: string): Promise<Result> {
  const g = await guard();
  if (!g.ok) return g;

  try {
    if (kind === 'B2B') await prisma.b2BEnquiry.delete({ where: { id } });
    else await prisma.contactMessage.delete({ where: { id } });

    revalidatePath('/studio/enquiries');
    return { ok: true };
  } catch (error) {
    return fail(error, 'Could not delete that.');
  }
}

// Keeps the b2b schema referenced here, so the studio and the public form can
// never drift apart on what a valid enquiry looks like.
export type StudioB2BShape = z.infer<typeof b2bSchema>;

function firstIssue(error: z.ZodError): string {
  const fieldErrors = error.flatten().fieldErrors;
  const first = Object.entries(fieldErrors)[0];
  if (!first) return 'Check the form.';
  const [field, messages] = first;
  return messages?.[0] ? `${messages[0]} (${field})` : 'Check the form.';
}
