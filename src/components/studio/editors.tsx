'use client';

import * as React from 'react';

import { StudioForm, type FormValues, type Section } from './studio-form';
import {
  DESIGN_CATEGORY_OPTIONS,
  FAMILY_OPTIONS,
  FIT_OPTIONS,
  JOURNAL_CATEGORIES,
  OCCASION_OPTIONS,
  POST_STATUS_OPTIONS,
  WEIGHT_OPTIONS,
} from './field-options';
import {
  saveBaseStyle,
  saveBlogPost,
  saveCollection,
  saveDesignOption,
  saveFabric,
  saveHomeTile,
  saveLookbookImage,
  saveProduct,
  saveTestimonial,
} from '@/app/studio/actions';

/**
 * One editor per model, each described as a list of field sections and handed
 * to the shared StudioForm renderer.
 *
 * Keeping them together makes the shape of the whole CMS visible at a glance,
 * and adding a field to a model is a single line rather than a new component.
 */

type Ref = { value: string; label: string };

// ---------------------------------------------------------------------------

export function FabricEditor({ initial }: { initial: FormValues }) {
  const sections: Section[] = [
    {
      legend: 'The cloth',
      fields: [
        { type: 'text', name: 'name', label: 'Name', required: true, width: 'half', placeholder: 'Adire Eléko Indigo' },
        { type: 'slug', name: 'slug', label: 'URL slug', from: 'name', width: 'half' },
        { type: 'select', name: 'family', label: 'Family', options: FAMILY_OPTIONS, width: 'third' },
        { type: 'select', name: 'weight', label: 'Weight', options: WEIGHT_OPTIONS, width: 'third' },
        { type: 'money', name: 'pricePerMeterNaira', label: 'Price per metre', width: 'third' },
        {
          type: 'textarea',
          name: 'description',
          label: 'Description',
          hint: 'One or two sentences. Shown on the fabric page and inside the builder.',
          rows: 3,
        },
      ],
    },
    {
      legend: 'Colour',
      hint: 'The colour tags power the filters on the fabric library and in the builder.',
      fields: [
        { type: 'text', name: 'colorName', label: 'Colour name', required: true, width: 'half', placeholder: 'Deep indigo & chalk' },
        { type: 'color', name: 'colorHex', label: 'Main colour', width: 'half' },
        {
          type: 'tags',
          name: 'colorTags',
          label: 'Colour tags',
          hint: 'Lowercase, one word each — indigo, blue, cream. These are what customers filter by.',
        },
      ],
    },
    {
      legend: 'Photography',
      hint: 'Until a swatch photograph is uploaded, the site draws an original geometric pattern in the right colour family. Shoot swatches flat, evenly lit and colour-accurate, at least 1200×1200.',
      fields: [
        { type: 'image', name: 'swatchImage', label: 'Swatch photograph', folder: 'fabrics', aspect: 'aspect-square', hint: 'Flat, overhead, on cream. This replaces the generated pattern everywhere.' },
        { type: 'image', name: 'textureImage', label: 'Builder texture (optional)', folder: 'fabrics', aspect: 'aspect-square', hint: 'A larger tileable crop for the live preview. Falls back to the swatch.' },
        { type: 'image', name: 'detailImage', label: 'Made-up detail', folder: 'fabrics', hint: 'The cloth made into a garment, 1400×1000.' },
      ],
    },
    {
      legend: 'Provenance & spec',
      fields: [
        { type: 'text', name: 'composition', label: 'Composition', width: 'half', placeholder: '100% cotton, natural indigo' },
        { type: 'text', name: 'origin', label: 'Woven or dyed in', width: 'half', placeholder: 'Abeokuta, Ogun State' },
        { type: 'number', name: 'gsm', label: 'Weight (gsm)', width: 'third' },
        { type: 'number', name: 'widthCm', label: 'Width (cm)', width: 'third' },
        { type: 'number', name: 'sortOrder', label: 'Sort order', width: 'third' },
        {
          type: 'textarea',
          name: 'artisanNote',
          label: 'About the makers',
          hint: 'Who wove or dyed it, and how. This is the part customers quote back to us.',
          rows: 3,
        },
      ],
    },
    {
      legend: 'Where it appears',
      fields: [
        { type: 'multiselect', name: 'occasions', label: 'Cuts well for', options: OCCASION_OPTIONS },
        { type: 'checkbox', name: 'inStock', label: 'In stock', hint: 'Out-of-stock cloth stays visible but cannot be ordered.' },
        { type: 'checkbox', name: 'isFeatured', label: 'Feature on the homepage' },
      ],
    },
  ];

  return (
    <StudioForm
      sections={sections}
      initial={initial}
      onSave={saveFabric}
      cancelHref="/studio/fabrics"
      saveLabel="Save fabric"
    />
  );
}

// ---------------------------------------------------------------------------

export function ProductEditor({
  initial,
  fabrics,
  baseStyles,
  collections,
}: {
  initial: FormValues;
  fabrics: Ref[];
  baseStyles: Ref[];
  collections: Ref[];
}) {
  const sections: Section[] = [
    {
      legend: 'The piece',
      fields: [
        { type: 'text', name: 'name', label: 'Name', required: true, width: 'half' },
        { type: 'slug', name: 'slug', label: 'URL slug', from: 'name', width: 'half' },
        { type: 'text', name: 'subtitle', label: 'Subtitle', hint: 'One line under the name.', },
        { type: 'textarea', name: 'description', label: 'Description', rows: 5 },
        {
          type: 'textarea',
          name: 'storyNote',
          label: 'Story note',
          hint: 'Optional. Shown as a pull quote — where the name came from, who it was first cut for.',
          rows: 3,
        },
      ],
    },
    {
      legend: 'Price & classification',
      fields: [
        { type: 'money', name: 'priceNaira', label: 'Price', width: 'third' },
        { type: 'money', name: 'compareAtNaira', label: 'Was (optional)', hint: 'Shows a struck-through price.', width: 'third' },
        { type: 'number', name: 'leadTimeDays', label: 'Atelier days', width: 'third' },
        { type: 'select', name: 'occasion', label: 'Occasion', options: OCCASION_OPTIONS, width: 'half' },
        { type: 'text', name: 'silhouette', label: 'Silhouette', hint: 'Free text — becomes a shop filter. "Peak lapel, wide leg".', width: 'half' },
      ],
    },
    {
      legend: 'Links',
      hint: 'The cut and cloth chosen here are what "Customise this" pre-selects in the builder.',
      fields: [
        { type: 'select', name: 'fabricId', label: 'Cloth', options: fabrics, allowEmpty: 'None', width: 'third' },
        { type: 'select', name: 'baseStyleId', label: 'Cut', options: baseStyles, allowEmpty: 'None', width: 'third' },
        { type: 'select', name: 'collectionId', label: 'Collection', options: collections, allowEmpty: 'None', width: 'third' },
      ],
    },
    {
      legend: 'Images',
      hint: 'The first image is the one that appears in the shop grid. Three is the house standard: front, movement, detail.',
      fields: [{ type: 'imageList', name: 'images', label: 'Product images', folder: 'products' }],
    },
    {
      legend: 'Visibility & SEO',
      fields: [
        { type: 'checkbox', name: 'isActive', label: 'Live on the site' },
        { type: 'checkbox', name: 'isFeatured', label: 'Feature on the homepage' },
        { type: 'checkbox', name: 'isMadeToMeasure', label: 'Made to measure' },
        { type: 'number', name: 'sortOrder', label: 'Sort order', width: 'third' },
        { type: 'text', name: 'seoTitle', label: 'SEO title', width: 'half' },
        { type: 'textarea', name: 'seoDescription', label: 'SEO description', rows: 2 },
      ],
    },
  ];

  return (
    <StudioForm
      sections={sections}
      initial={initial}
      onSave={saveProduct}
      cancelHref="/studio/products"
      saveLabel="Save product"
    />
  );
}

// ---------------------------------------------------------------------------

export function CollectionEditor({ initial }: { initial: FormValues }) {
  const sections: Section[] = [
    {
      legend: 'Collection',
      fields: [
        { type: 'text', name: 'name', label: 'Name', required: true, width: 'half' },
        { type: 'slug', name: 'slug', label: 'URL slug', from: 'name', width: 'half' },
        { type: 'text', name: 'subtitle', label: 'Subtitle', width: 'half' },
        { type: 'text', name: 'season', label: 'Season', hint: 'Harmattan 2025, or Permanent.', width: 'half' },
        { type: 'textarea', name: 'description', label: 'Description', rows: 4 },
        { type: 'select', name: 'occasion', label: 'Occasion', options: OCCASION_OPTIONS, allowEmpty: 'None' , width: 'half' },
        { type: 'number', name: 'sortOrder', label: 'Sort order', width: 'half' },
      ],
    },
    {
      legend: 'Images',
      fields: [
        { type: 'image', name: 'heroImage', label: 'Hero', folder: 'collections', hint: 'Full bleed, 2400×1300.' },
        { type: 'image', name: 'tileImage', label: 'Tile', folder: 'collections', aspect: 'aspect-[3/4]', hint: 'Vertical crop, 900×1100.' },
      ],
    },
    {
      legend: 'Visibility',
      fields: [
        { type: 'checkbox', name: 'isActive', label: 'Live on the site' },
        { type: 'checkbox', name: 'isFeatured', label: 'Featured' },
      ],
    },
  ];

  return (
    <StudioForm
      sections={sections}
      initial={initial}
      onSave={saveCollection}
      cancelHref="/studio/collections"
      saveLabel="Save collection"
    />
  );
}

// ---------------------------------------------------------------------------

export function BaseStyleEditor({ initial }: { initial: FormValues }) {
  const sections: Section[] = [
    {
      legend: 'The cut',
      fields: [
        { type: 'text', name: 'name', label: 'Name', required: true, width: 'half' },
        { type: 'slug', name: 'slug', label: 'URL slug', from: 'name', width: 'half' },
        { type: 'text', name: 'tagline', label: 'Tagline', hint: 'One short line on the builder card.' },
        { type: 'textarea', name: 'description', label: 'Description', rows: 4 },
      ],
    },
    {
      legend: 'Price & cloth',
      hint: 'The base price covers the labour: pattern, cutting, fittings and finishing. Cloth is added on top from the yardage below.',
      fields: [
        { type: 'money', name: 'basePriceNaira', label: 'Base price', width: 'half' },
        { type: 'number', name: 'yardageMeters', label: 'Metres of cloth', step: 0.1, width: 'half' },
      ],
    },
    {
      legend: 'What it supports',
      hint: 'Only the option categories ticked here appear in step 3 of the builder for this cut.',
      fields: [
        { type: 'multiselect', name: 'occasions', label: 'Occasions', options: OCCASION_OPTIONS },
        { type: 'multiselect', name: 'supportedFits', label: 'Fits', options: FIT_OPTIONS },
        { type: 'multiselect', name: 'optionCategories', label: 'Option categories', options: DESIGN_CATEGORY_OPTIONS },
      ],
    },
    {
      legend: 'Preview artwork (optional)',
      hint: 'The builder draws this cut as a vector technical flat by default, which needs no artwork at all. Upload here only to override that with bespoke illustration — authored on a 600×800 canvas.',
      fields: [
        { type: 'image', name: 'thumbnailImage', label: 'Thumbnail', folder: 'styles', aspect: 'aspect-[3/4]' },
        { type: 'image', name: 'previewMaskUrl', label: 'Garment mask', folder: 'styles', aspect: 'aspect-[3/4]' },
        { type: 'image', name: 'previewShadingUrl', label: 'Shading overlay', folder: 'styles', aspect: 'aspect-[3/4]' },
      ],
    },
    {
      legend: 'Visibility',
      fields: [
        { type: 'checkbox', name: 'isActive', label: 'Available in the builder' },
        { type: 'number', name: 'sortOrder', label: 'Sort order', width: 'third' },
      ],
    },
  ];

  return (
    <StudioForm
      sections={sections}
      initial={initial}
      onSave={saveBaseStyle}
      cancelHref="/studio/base-styles"
      saveLabel="Save cut"
    />
  );
}

// ---------------------------------------------------------------------------

export function DesignOptionEditor({
  initial,
  baseStyles,
}: {
  initial: FormValues;
  baseStyles: Ref[];
}) {
  const sections: Section[] = [
    {
      legend: 'Option',
      fields: [
        { type: 'text', name: 'name', label: 'Name', required: true, width: 'half' },
        { type: 'slug', name: 'slug', label: 'Slug', from: 'name', hint: 'The builder draws its vector shape from this slug — keep the existing ones (lapel-peak, pocket-besom…) as they are.', width: 'half' },
        { type: 'select', name: 'category', label: 'Category', options: DESIGN_CATEGORY_OPTIONS, width: 'half' },
        { type: 'money', name: 'priceModifierNaira', label: 'Adds to the price', width: 'half' },
        { type: 'textarea', name: 'description', label: 'Description', hint: 'Shown on the option chip. One sentence.', rows: 2 },
      ],
    },
    {
      legend: 'Appearance',
      fields: [
        { type: 'color', name: 'colorHex', label: 'Colour', hint: 'For buttons, linings and trim — this is the colour drawn in the preview.', width: 'half' },
        { type: 'number', name: 'zIndex', label: 'Layer order', hint: 'Higher paints on top.', width: 'half' },
        { type: 'image', name: 'iconUrl', label: 'Icon (optional)', folder: 'options', aspect: 'aspect-square' },
        { type: 'image', name: 'overlayUrl', label: 'Preview overlay (optional)', folder: 'options', aspect: 'aspect-[3/4]', hint: 'Overrides the drawn shape. 600×800, transparent background.' },
      ],
    },
    {
      legend: 'Scope',
      fields: [
        {
          type: 'select',
          name: 'baseStyleId',
          label: 'Only for this cut',
          options: baseStyles,
          allowEmpty: 'Every cut',
          hint: 'Leave as "Every cut" unless this option only makes sense on one silhouette.',
          width: 'half',
        },
        { type: 'number', name: 'sortOrder', label: 'Sort order', width: 'half' },
        { type: 'checkbox', name: 'isDefault', label: 'Selected by default', hint: 'One default per category. Setting this clears the previous one.' },
        { type: 'checkbox', name: 'isActive', label: 'Available in the builder' },
      ],
    },
  ];

  return (
    <StudioForm
      sections={sections}
      initial={initial}
      onSave={saveDesignOption}
      cancelHref="/studio/design-options"
      saveLabel="Save option"
    />
  );
}

// ---------------------------------------------------------------------------

export function BlogPostEditor({ initial }: { initial: FormValues }) {
  const sections: Section[] = [
    {
      legend: 'Article',
      fields: [
        { type: 'text', name: 'title', label: 'Title', required: true, width: 'half' },
        { type: 'slug', name: 'slug', label: 'URL slug', from: 'title', width: 'half' },
        { type: 'textarea', name: 'excerpt', label: 'Excerpt', hint: 'Leave empty and we take the first couple of lines.', rows: 2 },
        { type: 'select', name: 'category', label: 'Category', options: JOURNAL_CATEGORIES, width: 'third' },
        { type: 'select', name: 'status', label: 'Status', options: POST_STATUS_OPTIONS, width: 'third' },
        { type: 'text', name: 'authorName', label: 'Author', width: 'third' },
        { type: 'tags', name: 'tags', label: 'Tags' },
      ],
    },
    {
      legend: 'Body',
      hint: 'Written as HTML. Use <h2> for section headings, <p> for paragraphs, <blockquote> for pull quotes, <ul>/<li> for lists. Anything unsafe is stripped when you save. Read time is calculated for you.',
      fields: [{ type: 'richtext', name: 'body', label: 'Article body' }],
    },
    {
      legend: 'Cover image',
      fields: [
        { type: 'image', name: 'coverImage', label: 'Cover', folder: 'journal', hint: '1600×1000.' },
        { type: 'text', name: 'coverAlt', label: 'Cover alt text', hint: 'Describe the image for screen readers.' },
      ],
    },
    {
      legend: 'SEO',
      fields: [
        { type: 'text', name: 'seoTitle', label: 'SEO title' },
        { type: 'textarea', name: 'seoDescription', label: 'SEO description', rows: 2 },
      ],
    },
  ];

  return (
    <StudioForm
      sections={sections}
      initial={initial}
      onSave={saveBlogPost}
      cancelHref="/studio/journal"
      saveLabel="Save article"
    />
  );
}

// ---------------------------------------------------------------------------

export function LookbookEditor({
  initial,
  collections,
}: {
  initial: FormValues;
  collections: Ref[];
}) {
  const sections: Section[] = [
    {
      legend: 'Image',
      fields: [
        { type: 'image', name: 'url', label: 'Image', folder: 'lookbook', aspect: 'aspect-[3/4]' },
        { type: 'text', name: 'alt', label: 'Alt text', hint: 'Describe it for screen readers.' },
        { type: 'text', name: 'caption', label: 'Caption', hint: 'Shown under the image in the grid.' },
        { type: 'text', name: 'briefNote', label: 'Shot note', hint: 'Internal only — never shown publicly.' },
      ],
    },
    {
      legend: 'Placement',
      fields: [
        { type: 'select', name: 'collectionId', label: 'Collection', options: collections, allowEmpty: 'None', width: 'half' },
        { type: 'select', name: 'occasion', label: 'Occasion', options: OCCASION_OPTIONS, allowEmpty: 'None', width: 'half' },
        { type: 'text', name: 'season', label: 'Season', width: 'half' },
        {
          type: 'select',
          name: 'spanHint',
          label: 'Shape in the grid',
          options: [
            { value: '1', label: 'Portrait' },
            { value: '2', label: 'Tall portrait' },
            { value: '3', label: 'Landscape' },
          ],
          width: 'half',
        },
        { type: 'number', name: 'sortOrder', label: 'Sort order', width: 'half' },
        { type: 'checkbox', name: 'isActive', label: 'Show in the lookbook' },
      ],
    },
  ];

  return (
    <StudioForm
      sections={sections}
      initial={initial}
      onSave={(values) => saveLookbookImage({ ...values, spanHint: Number(values.spanHint) })}
      cancelHref="/studio/lookbook"
      saveLabel="Save image"
    />
  );
}

// ---------------------------------------------------------------------------

export function TestimonialEditor({ initial }: { initial: FormValues }) {
  const sections: Section[] = [
    {
      legend: 'The quote',
      fields: [
        { type: 'textarea', name: 'quote', label: 'Quote', rows: 4, hint: 'Do not include the quotation marks — the site adds them.' },
        { type: 'text', name: 'authorName', label: 'Name', required: true, width: 'third' },
        { type: 'text', name: 'authorRole', label: 'Role', width: 'third' },
        { type: 'text', name: 'location', label: 'Location', width: 'third' },
        { type: 'image', name: 'imageUrl', label: 'Portrait (optional)', folder: 'testimonials', aspect: 'aspect-square' },
      ],
    },
    {
      legend: 'Placement',
      fields: [
        { type: 'checkbox', name: 'isFeatured', label: 'Show on the homepage' },
        { type: 'checkbox', name: 'isActive', label: 'Live on the site' },
        { type: 'number', name: 'sortOrder', label: 'Sort order', width: 'third' },
      ],
    },
  ];

  return (
    <StudioForm
      sections={sections}
      initial={initial}
      onSave={saveTestimonial}
      cancelHref="/studio/testimonials"
      saveLabel="Save testimonial"
    />
  );
}

// ---------------------------------------------------------------------------

export function HomeTileEditor({
  initial,
  onDone,
}: {
  initial: FormValues;
  onDone: string;
}) {
  const sections: Section[] = [
    {
      legend: 'Occasion tile',
      fields: [
        { type: 'text', name: 'label', label: 'Label', required: true, width: 'half' },
        { type: 'text', name: 'href', label: 'Links to', required: true, width: 'half', placeholder: '/shop?occasion=BRIDAL' },
        { type: 'text', name: 'subtitle', label: 'Subtitle', hint: 'One line under the tile.' },
        { type: 'select', name: 'occasion', label: 'Occasion', options: OCCASION_OPTIONS, allowEmpty: 'None', width: 'half' },
        { type: 'number', name: 'sortOrder', label: 'Sort order', width: 'half' },
        { type: 'image', name: 'imageUrl', label: 'Image', folder: 'tiles', aspect: 'aspect-[3/4]', hint: '900×1200 vertical.' },
        { type: 'checkbox', name: 'isActive', label: 'Show on the homepage' },
      ],
    },
  ];

  return (
    <StudioForm
      sections={sections}
      initial={initial}
      onSave={saveHomeTile}
      cancelHref={onDone}
      saveLabel="Save tile"
    />
  );
}
