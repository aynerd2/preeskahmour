# Asset brief — Preeskahmour

> Generated from `scripts/asset-manifest.ts`. Re-run `npm run assets:placeholders`
> after editing that file; do not hand-edit this document.

## What this is

Every image slot on the site, with the exact pixel size it needs and a note
on what the shot should be. Right now each slot holds a flat coloured
placeholder SVG in `public/placeholders/` carrying its own filename and
dimensions — so an unshot slot is obvious in the layout rather than quietly
looking finished.

**No real photograph of any real person appears anywhere in this repository.**
Nothing here was scraped from Instagram or anywhere else. Every placeholder is
a generated colour panel, and every fabric swatch is an original geometric SVG
(see `src/lib/swatches.ts`) rather than a reproduction of a real textile print.

## How to replace a placeholder

1. Sign in at `/studio` with the owner account.
2. Find the record — Fabrics, Products, Lookbook, Collections, or
   **Content** for the marketing-page slots (hero, story, How It Works…).
3. Upload the image. It goes to Cloudinary and the database URL replaces the
   placeholder path immediately. No deploy, no developer.

Nothing in `public/placeholders/` needs to be deleted — once a real URL is
saved, the placeholder is simply never requested again.

## House-wide art direction

- **Palette on set:** deep emerald, aso-oke gold, burnt terracotta, adire
  indigo, unbleached ivory. Backgrounds are cream or plaster — never pure white,
  never grey seamless.
- **Light:** one warm key, deliberately unfilled shadow. We want contrast and
  shape, not flat e-commerce lighting.
- **Casting:** Nigerian women across a genuine range of ages, body shapes and
  skin tones. At least one visibly pregnant model in every seasonal shoot.
- **Styling:** the garment is the subject. Minimal jewellery, no busy props,
  nothing that dates the picture to one season.
- **Retouching:** clean the cloth, not the person. Do not smooth skin or
  reshape bodies. Keep the texture of the weave — it is the entire point.
- **Delivery:** sRGB JPEG at 85% quality, long edge at least the size listed
  below. Cloudinary handles all resizing and WebP/AVIF conversion.

## Also needed, not listed below

- **Fabric swatches** — one flat, evenly lit, colour-accurate square per fabric,
  at least 1200×1200, shot directly overhead on cream. These upload against each
  fabric in `/studio → Fabrics`. Until then the site draws an original
  procedural pattern in the right colour family.
- **Fabric detail shots** — the same cloth made up into a garment, 1400×1000.
- **Hero video (optional)** — the homepage hero accepts an MP4 instead of a
  still. 10–15s, silent, looping, no cuts. Under 6MB, H.264, 1920×1080.

## Global

| Slot | Where it appears | Size (px) | Brief |
| --- | --- | --- | --- |
| `og-default.svg` | Default social share card | 1200×630 | Wordmark on deep emerald with a single folded length of aso-oke entering from the right. Must read at thumbnail size — no small type. |

## Homepage

| Slot | Where it appears | Size (px) | Brief |
| --- | --- | --- | --- |
| `home-hero.svg` | Homepage hero (full bleed) | 2400×1500 | THE most important shot on the site. Model standing three-quarter to camera in an emerald aso-oke blazer with peak lapel and a wide-leg trouser. Warm studio key from camera left, deep unfilled shadow on the right of her body. Cream seamless backdrop. Compose loose and leave the right third visually quiet — the headline and buttons sit there. Shoot a 9:16 crop of the same setup for mobile. |
| `story-teaser.svg` | Homepage — founder story block | 1200×1500 | Prisca at the cutting table, tape around her neck, chalk in hand, caught mid-work rather than posed to camera. Natural window light, warm. Pattern paper and cloth in the near foreground, slightly out of focus. |
| `builder-promo.svg` | Homepage — builder promo block | 1400×1000 | Extreme close on a finished peak lapel with a contrast adire under-collar and horn buttons. Raking side light so every stitch reads. Shallow depth of field, focus on the buttonhole. |
| `instagram-1.svg` | Homepage — Instagram strip | 1080×1080 | Square crop pulled straight from the @preeskahmour grid once the shoot is live. Across the six: two full looks, two fabric details, one atelier process shot, one client portrait. Keep the crop centred — this grid crops hard on mobile. |
| `instagram-2.svg` | Homepage — Instagram strip | 1080×1080 | Square crop pulled straight from the @preeskahmour grid once the shoot is live. Across the six: two full looks, two fabric details, one atelier process shot, one client portrait. Keep the crop centred — this grid crops hard on mobile. |
| `instagram-3.svg` | Homepage — Instagram strip | 1080×1080 | Square crop pulled straight from the @preeskahmour grid once the shoot is live. Across the six: two full looks, two fabric details, one atelier process shot, one client portrait. Keep the crop centred — this grid crops hard on mobile. |
| `instagram-4.svg` | Homepage — Instagram strip | 1080×1080 | Square crop pulled straight from the @preeskahmour grid once the shoot is live. Across the six: two full looks, two fabric details, one atelier process shot, one client portrait. Keep the crop centred — this grid crops hard on mobile. |
| `instagram-5.svg` | Homepage — Instagram strip | 1080×1080 | Square crop pulled straight from the @preeskahmour grid once the shoot is live. Across the six: two full looks, two fabric details, one atelier process shot, one client portrait. Keep the crop centred — this grid crops hard on mobile. |
| `instagram-6.svg` | Homepage — Instagram strip | 1080×1080 | Square crop pulled straight from the @preeskahmour grid once the shoot is live. Across the six: two full looks, two fabric details, one atelier process shot, one client portrait. Keep the crop centred — this grid crops hard on mobile. |

## Occasion tiles

| Slot | Where it appears | Size (px) | Brief |
| --- | --- | --- | --- |
| `tile-corporate.svg` | Occasion tile — Corporate | 900×1200 | Woman in charcoal or navy worsted, single-breasted, mid-stride in an architectural setting. Cool, controlled, no smile. |
| `tile-bridal.svg` | Occasion tile — Bridal | 900×1200 | Ivory silk or white George trouser suit with hand embroidery at the cuff. Soft, high-key, veil or gele optional. Shot against warm cream. |
| `tile-maternity.svg` | Occasion tile — Maternity | 900×1200 | Visibly pregnant model in an adire maternity blazer, hand resting naturally at the side, not cradling the bump. Show that it reads as tailoring, not as maternity wear. |
| `tile-party.svg` | Occasion tile — Party | 900×1200 | Aso-oke or sequinned georgette, movement in the hem, shot slightly darker with a warm practical light in frame. Evening energy. |
| `tile-everyday.svg` | Occasion tile — Everyday | 900×1200 | Linen or light Ankara, relaxed shoulder, worn with flats on a Lagos street. Documentary feel, natural light. |

## How It Works

| Slot | Where it appears | Size (px) | Brief |
| --- | --- | --- | --- |
| `how-it-works-hero.svg` | How It Works — hero | 2400×1200 | Hands pinning a canvassed jacket front onto a dress form. Atelier visible behind but soft. Warm, low contrast, unhurried. |
| `step-design.svg` | How It Works — step 1 | 1200×900 | Phone in hand showing the builder mid-configuration, with real fabric swatches fanned on the table beneath it. |
| `step-measure.svg` | How It Works — step 2 | 1200×900 | Tape measure drawn across a shoulder line, the tailor’s hands in frame. Close crop, no face needed. |
| `step-tailor.svg` | How It Works — step 3 | 1200×900 | Machinist at an industrial machine, shallow focus on hands and needle, warmth of the atelier behind. |
| `step-delivered.svg` | How It Works — step 4 | 1200×900 | Deep emerald garment box with the gold foil wordmark, tissue and ribbon, shot overhead on a cream surface. |

## Measurement Guide

| Slot | Where it appears | Size (px) | Brief |
| --- | --- | --- | --- |
| `measurement-diagram.svg` | Measurement Guide — diagram | 1200×1600 | ILLUSTRATION, not a photograph. Line-drawn figure front and back with numbered call-outs for every measurement we collect. Ink line on cream, gold call-out numbers, no shading. Commission this from an illustrator — a photo will not work here. |

## Our Story

| Slot | Where it appears | Size (px) | Brief |
| --- | --- | --- | --- |
| `story-hero.svg` | Our Story — hero | 2400×1300 | Wide of the atelier: cutting table, bolts standing on end, dress forms, a machinist at the back. Natural light, completely unstaged. |
| `story-portrait.svg` | Our Story — founder portrait | 1200×1500 | Prisca to camera, arms folded, wearing her own tailoring. Serious and warm; a smile is not required. Plain cream or deep emerald ground. This is the portrait press will reuse — shoot it properly. |
| `story-process.svg` | Our Story — process inset | 1400×1000 | Tailor’s chalk marks and pattern weights on adire laid flat, shears in frame. Shot from directly overhead. |

## Corporate

| Slot | Where it appears | Size (px) | Brief |
| --- | --- | --- | --- |
| `corporate-hero.svg` | Corporate & Bulk — hero | 2400×1300 | Six women in coordinated but not identical suiting — same cloth, different cuts. Corporate lobby or clean architecture. Confident, not stiff, not a stock-photo huddle. |

## Collections

| Slot | Where it appears | Size (px) | Brief |
| --- | --- | --- | --- |
| `collection-harmattan-hero.svg` | Collection — Harmattan hero | 2400×1300 | Dry-season palette: dust, ochre, deep indigo. Model in aso-oke against a bare wall in raking late light. |
| `collection-harmattan-tile.svg` | Collection — Harmattan tile | 900×1100 | Vertical crop of the Harmattan hero look, tighter on the garment. |
| `collection-boardroom-hero.svg` | Collection — Boardroom hero | 2400×1300 | Worsted wool and quiet adire in an office setting. Cool light, hard shadows, glass and concrete. |
| `collection-boardroom-tile.svg` | Collection — Boardroom tile | 900×1100 | Vertical crop of the Boardroom look. |
| `collection-vows-hero.svg` | Collection — Vows hero | 2400×1300 | Bridal party in ivory and gold, shot in soft window light. Group composition with room for type on the left. |
| `collection-vows-tile.svg` | Collection — Vows tile | 900×1100 | Vertical crop of the bridal look, focus on the embroidered cuff. |
| `collection-nine-months-hero.svg` | Collection — Nine Months hero | 2400×1300 | Maternity tailoring, three models at different stages of pregnancy, same cloth. Warm, plain ground. |
| `collection-nine-months-tile.svg` | Collection — Nine Months tile | 900×1100 | Vertical crop showing the side expansion panel detail. |

## Products

| Slot | Where it appears | Size (px) | Brief |
| --- | --- | --- | --- |
| `product-ìtàn-emerald-two-piece-1.svg` | Ìtàn Emerald Two-Piece — primary | 1000×1333 | Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins. |
| `product-ìtàn-emerald-two-piece-2.svg` | Ìtàn Emerald Two-Piece — movement | 1000×1333 | Three-quarter or walking frame of the same look, showing drape and how the cloth moves. |
| `product-ìtàn-emerald-two-piece-3.svg` | Ìtàn Emerald Two-Piece — detail | 1000×1333 | Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing. |
| `product-abeokuta-adire-blazer-1.svg` | Abéòkúta Adire Blazer — primary | 1000×1333 | Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins. |
| `product-abeokuta-adire-blazer-2.svg` | Abéòkúta Adire Blazer — movement | 1000×1333 | Three-quarter or walking frame of the same look, showing drape and how the cloth moves. |
| `product-abeokuta-adire-blazer-3.svg` | Abéòkúta Adire Blazer — detail | 1000×1333 | Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing. |
| `product-iseyin-asooke-suit-1.svg` | Ìseyìn Aso-oke Suit — primary | 1000×1333 | Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins. |
| `product-iseyin-asooke-suit-2.svg` | Ìseyìn Aso-oke Suit — movement | 1000×1333 | Three-quarter or walking frame of the same look, showing drape and how the cloth moves. |
| `product-iseyin-asooke-suit-3.svg` | Ìseyìn Aso-oke Suit — detail | 1000×1333 | Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing. |
| `product-boardroom-worsted-trouser-suit-1.svg` | Boardroom Worsted Trouser Suit — primary | 1000×1333 | Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins. |
| `product-boardroom-worsted-trouser-suit-2.svg` | Boardroom Worsted Trouser Suit — movement | 1000×1333 | Three-quarter or walking frame of the same look, showing drape and how the cloth moves. |
| `product-boardroom-worsted-trouser-suit-3.svg` | Boardroom Worsted Trouser Suit — detail | 1000×1333 | Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing. |
| `product-ileke-bridal-trouser-suit-1.svg` | Ìlèkè Bridal Trouser Suit — primary | 1000×1333 | Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins. |
| `product-ileke-bridal-trouser-suit-2.svg` | Ìlèkè Bridal Trouser Suit — movement | 1000×1333 | Three-quarter or walking frame of the same look, showing drape and how the cloth moves. |
| `product-ileke-bridal-trouser-suit-3.svg` | Ìlèkè Bridal Trouser Suit — detail | 1000×1333 | Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing. |
| `product-nine-months-adire-set-1.svg` | Nine Months Adire Set — primary | 1000×1333 | Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins. |
| `product-nine-months-adire-set-2.svg` | Nine Months Adire Set — movement | 1000×1333 | Three-quarter or walking frame of the same look, showing drape and how the cloth moves. |
| `product-nine-months-adire-set-3.svg` | Nine Months Adire Set — detail | 1000×1333 | Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing. |
| `product-harmattan-linen-set-1.svg` | Harmattan Linen Set — primary | 1000×1333 | Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins. |
| `product-harmattan-linen-set-2.svg` | Harmattan Linen Set — movement | 1000×1333 | Three-quarter or walking frame of the same look, showing drape and how the cloth moves. |
| `product-harmattan-linen-set-3.svg` | Harmattan Linen Set — detail | 1000×1333 | Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing. |
| `product-oru-party-tuxedo-1.svg` | Òru Party Tuxedo — primary | 1000×1333 | Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins. |
| `product-oru-party-tuxedo-2.svg` | Òru Party Tuxedo — movement | 1000×1333 | Three-quarter or walking frame of the same look, showing drape and how the cloth moves. |
| `product-oru-party-tuxedo-3.svg` | Òru Party Tuxedo — detail | 1000×1333 | Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing. |
| `product-akwete-waistcoat-set-1.svg` | Akwete Waistcoat Set — primary | 1000×1333 | Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins. |
| `product-akwete-waistcoat-set-2.svg` | Akwete Waistcoat Set — movement | 1000×1333 | Three-quarter or walking frame of the same look, showing drape and how the cloth moves. |
| `product-akwete-waistcoat-set-3.svg` | Akwete Waistcoat Set — detail | 1000×1333 | Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing. |
| `product-ankara-wrap-suit-1.svg` | Ankara Wrap Suit — primary | 1000×1333 | Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins. |
| `product-ankara-wrap-suit-2.svg` | Ankara Wrap Suit — movement | 1000×1333 | Three-quarter or walking frame of the same look, showing drape and how the cloth moves. |
| `product-ankara-wrap-suit-3.svg` | Ankara Wrap Suit — detail | 1000×1333 | Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing. |
| `product-george-evening-column-1.svg` | George Evening Column — primary | 1000×1333 | Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins. |
| `product-george-evening-column-2.svg` | George Evening Column — movement | 1000×1333 | Three-quarter or walking frame of the same look, showing drape and how the cloth moves. |
| `product-george-evening-column-3.svg` | George Evening Column — detail | 1000×1333 | Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing. |
| `product-ekiti-everyday-blazer-1.svg` | Èkìtì Everyday Blazer — primary | 1000×1333 | Full-length front, model standing square, hands relaxed. Cream seamless, soft key from camera left. This is the grid image — the garment must fill the frame vertically with even margins. |
| `product-ekiti-everyday-blazer-2.svg` | Èkìtì Everyday Blazer — movement | 1000×1333 | Three-quarter or walking frame of the same look, showing drape and how the cloth moves. |
| `product-ekiti-everyday-blazer-3.svg` | Èkìtì Everyday Blazer — detail | 1000×1333 | Detail crop: lapel, cuff, pocket or embroidery. Raking light. This is the shot that sells hand finishing. |

## Lookbook

| Slot | Where it appears | Size (px) | Brief |
| --- | --- | --- | --- |
| `lookbook-01.svg` | Lookbook masonry grid | 1200×1600 | Full look, emerald aso-oke suit, standing against a bare plaster wall. |
| `lookbook-02.svg` | Lookbook masonry grid | 1200×900 | Wide, two models seated, contrasting cloth, editorial spread feel. |
| `lookbook-03.svg` | Lookbook masonry grid | 1200×1600 | Back view showing the jacket seam line and vent. |
| `lookbook-04.svg` | Lookbook masonry grid | 1200×1600 | Bridal ivory George, cropped at the knee, hands and embroidery in focus. |
| `lookbook-05.svg` | Lookbook masonry grid | 1200×900 | Detail: stacked bolts of cloth, colour blocked. |
| `lookbook-06.svg` | Lookbook masonry grid | 1200×1600 | Maternity look, model in profile against warm light. |
| `lookbook-07.svg` | Lookbook masonry grid | 1200×1600 | Corporate look, mid-stride, hard architectural shadow. |
| `lookbook-08.svg` | Lookbook masonry grid | 1200×900 | Atelier process, hands and shears on adire. |
| `lookbook-09.svg` | Lookbook masonry grid | 1200×1600 | Party look, movement blur in the hem, warm practical light. |
| `lookbook-10.svg` | Lookbook masonry grid | 1200×1600 | Everyday linen, flat shoes, street context. |
| `lookbook-11.svg` | Lookbook masonry grid | 1200×900 | Group of three, same cloth, different cuts. |
| `lookbook-12.svg` | Lookbook masonry grid | 1200×1600 | Close portrait, gele and tailored shoulder, direct gaze. |

## Journal

| Slot | Where it appears | Size (px) | Brief |
| --- | --- | --- | --- |
| `journal-adire.svg` | Journal — Adire article cover | 1600×1000 | Indigo dye pit in Abeokuta, cloth being lifted dripping from the vat. Documentary, no styling. |
| `journal-first-suit.svg` | Journal — First suit article cover | 1600×1000 | A single jacket on a wooden hanger against a plain wall. Quiet, still-life. |
| `journal-maternity.svg` | Journal — Maternity article cover | 1600×1000 | Close on the hidden expansion panel, hand pulling it open to show the mechanism. |
| `journal-asooke.svg` | Journal — Aso-oke article cover | 1600×1000 | Narrow loom in Iseyin, weaver’s hands and the strip forming. Warm, dusty light. |
| `journal-corporate.svg` | Journal — Corporate article cover | 1600×1000 | Rail of finished corporate suiting in one cloth, different cuts, in the atelier. |
| `journal-care.svg` | Journal — Fabric care article cover | 1600×1000 | Iron and pressing cloth on a sleeve board, steam visible. Domestic, warm. |

---

**87 image slots** in total.
