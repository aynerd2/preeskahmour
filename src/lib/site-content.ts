import { prisma, safeQuery } from './prisma';
import { BRAND } from './constants';

/**
 * Editable site content.
 *
 * Hard requirement of this build: Prisca must be able to change every word and
 * every image on the marketing pages from /studio without a developer. Rows in
 * `SiteSetting` hold the live values; the `DEFAULT_CONTENT` map below is the
 * shape + the seed copy, and is also what renders if a key has never been
 * saved. Studio generates its editing forms from these defaults, so adding a
 * new editable field means adding it here and nowhere else.
 *
 * `briefNote` fields are art-direction notes for the photographer. They are
 * never rendered on the public site — they exist so /studio and
 * README-ASSETS.md can tell Prisca exactly what shot belongs in each slot.
 */

export type ImageSlot = {
  url: string;
  alt: string;
  briefNote?: string;
};

export type SiteContent = {
  'site.announcement': {
    enabled: boolean;
    message: string;
    linkLabel: string;
    href: string;
  };
  'site.footer': {
    blurb: string;
    newsletterHeading: string;
    newsletterBody: string;
  };
  'site.contact': {
    email: string;
    phone: string;
    whatsapp: string;
    addressLines: string[];
    hours: string;
    appointmentNote: string;
  };
  'seo.default': {
    title: string;
    description: string;
    ogImage: string;
  };
  'home.hero': {
    eyebrow: string;
    headline: string;
    subhead: string;
    ctaLabel: string;
    ctaHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    mediaType: 'image' | 'video';
    image: ImageSlot;
    videoUrl: string;
  };
  'home.marquee': {
    enabled: boolean;
    items: string[];
  };
  'home.tilesIntro': {
    eyebrow: string;
    headline: string;
    body: string;
  };
  'home.fabricStrip': {
    eyebrow: string;
    headline: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
  };
  'home.storyTeaser': {
    eyebrow: string;
    headline: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
    image: ImageSlot;
    stats: { value: string; label: string }[];
  };
  'home.builderPromo': {
    eyebrow: string;
    headline: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
    bullets: string[];
    image: ImageSlot;
  };
  'home.instagram': {
    handle: string;
    url: string;
    headline: string;
    images: ImageSlot[];
  };
  'howItWorks.page': {
    eyebrow: string;
    headline: string;
    lede: string;
    hero: ImageSlot;
    steps: { title: string; body: string; image: ImageSlot }[];
    faq: { q: string; a: string }[];
  };
  'measurementGuide.page': {
    headline: string;
    lede: string;
    diagram: ImageSlot;
    tips: string[];
    estimatorNote: string;
  };
  'ourStory.page': {
    eyebrow: string;
    headline: string;
    lede: string;
    hero: ImageSlot;
    portrait: ImageSlot;
    sections: { heading: string; body: string; image?: ImageSlot }[];
    timeline: { year: string; title: string; body: string }[];
    pullQuote: string;
  };
  'corporate.page': {
    eyebrow: string;
    headline: string;
    lede: string;
    hero: ImageSlot;
    bullets: { title: string; body: string }[];
    minimumNote: string;
  };
  'returns.page': {
    headline: string;
    lede: string;
    sections: { heading: string; body: string }[];
  };
};

export type SiteContentKey = keyof SiteContent;

const PLACEHOLDER = (name: string) => `/placeholders/${name}.svg`;

export const DEFAULT_CONTENT: SiteContent = {
  'site.announcement': {
    enabled: true,
    message: 'Complimentary Lagos delivery on made-to-measure orders over ₦300,000.',
    linkLabel: 'Start designing',
    href: '/builder',
  },
  'site.footer': {
    blurb:
      'Preeskahmour is a Lagos atelier making measured-to-you suiting in Nigerian cloth. Every piece is cut for one body, once.',
    newsletterHeading: 'Letters from the atelier',
    newsletterBody:
      'New cloth, fitting notes and the occasional look at what is on the table. Once a month, never more.',
  },
  'site.contact': {
    email: BRAND.email,
    phone: BRAND.phone,
    whatsapp: BRAND.whatsapp,
    addressLines: [...BRAND.addressLines],
    hours: 'Tuesday to Saturday, 10am – 6pm WAT',
    appointmentNote:
      'Fittings are by appointment. Message us on WhatsApp and we will find you a slot — evenings and Sundays included for bridal parties.',
  },
  'seo.default': {
    title: 'Preeskahmour — Made-to-measure suiting in Nigerian cloth',
    description: BRAND.descriptor,
    ogImage: PLACEHOLDER('og-default'),
  },
  'home.hero': {
    eyebrow: 'Lagos atelier · Made to measure',
    headline: 'A suit cut for one body. Yours.',
    subhead:
      'Ankara, aso-oke, adire and fine wool, drafted to your measurements and finished by hand. For the boardroom, the aisle, the bump and the night out.',
    ctaLabel: 'Design your suit',
    ctaHref: '/builder',
    secondaryLabel: 'See the cloth',
    secondaryHref: '/fabrics',
    mediaType: 'image',
    image: {
      url: PLACEHOLDER('home-hero'),
      alt: 'A woman in a made-to-measure emerald aso-oke blazer and matching trousers',
      briefNote:
        'Currently filled by the house film. The hero is a split layout with portrait media, so if you replace it with a still, use PORTRAIT 3:4 (at least 1200×1600): a full-length look, subject centred. A landscape image will be cropped hard at the sides.',
    },
    videoUrl: '',
  },
  'home.marquee': {
    enabled: true,
    items: [
      'Hand-loomed aso-oke',
      'Adire from Abeokuta',
      'Two fittings included',
      'Maternity panels that grow 14cm',
      'Cut in Lagos',
      'Worldwide delivery',
    ],
  },
  'home.tilesIntro': {
    eyebrow: 'Cut for the occasion',
    headline: 'Five ways we cut for a life',
    body:
      'The same drafting table, five different briefs. Choose where you are starting from — we will take it from there.',
  },
  'home.fabricStrip': {
    eyebrow: 'The cloth',
    headline: 'We start with the fabric, not the pattern',
    body:
      'Adire from Abeokuta dye pits, aso-oke off narrow looms in Iseyin, Akwete from Abia, and Super 130s worsted for the boardroom. Choose the cloth and the suit follows.',
    ctaLabel: 'Browse the fabric library',
    ctaHref: '/fabrics',
  },
  'home.storyTeaser': {
    eyebrow: 'The house',
    headline: 'From an Ekiti sewing room to a Lagos atelier',
    body:
      'Prisca Ogunlade learned to sew in Ado-Ekiti, on a machine that belonged to someone else. She now runs a house that cuts for brides, boardrooms and mothers-to-be — and still drafts every new pattern herself.',
    ctaLabel: 'Read our story',
    ctaHref: '/our-story',
    image: {
      url: PLACEHOLDER('story-teaser'),
      alt: 'Prisca Ogunlade at the drafting table in the Preeskahmour atelier',
      briefNote:
        'Portrait 3:4, at least 1200×1600. Prisca at the cutting table, tape around her neck, chalk in hand, mid-work — not posed to camera. Natural window light, warm. Cloth and pattern paper visible in the foreground.',
    },
    stats: [
      { value: '2019', label: 'House founded' },
      { value: '900+', label: 'Suits cut to measure' },
      { value: '21 days', label: 'Standard atelier time' },
    ],
  },
  'home.builderPromo': {
    eyebrow: 'The configurator',
    headline: 'Design it yourself, down to the lining',
    body:
      'Pick a cut, choose your cloth, set the lapel, the buttons, the pockets and the lining, then give us your measurements — or let us estimate them. Watch the suit change as you go.',
    ctaLabel: 'Open the builder',
    ctaHref: '/builder',
    bullets: [
      'Six steps, about four minutes',
      'Live preview updates as you choose',
      'Save the design and finish it later',
      'Your price is visible at every step',
    ],
    image: {
      url: PLACEHOLDER('builder-promo'),
      alt: 'Detail of a peak lapel with contrast adire under-collar',
      briefNote:
        'Detail shot, 1400×1000. Extreme close on a peak lapel with contrast adire under-collar and horn buttons. Raking light to show the stitch. Shallow depth of field.',
    },
  },
  'home.instagram': {
    handle: BRAND.instagramHandle,
    url: BRAND.instagram,
    headline: 'In the world',
    images: Array.from({ length: 6 }, (_, i) => ({
      url: PLACEHOLDER(`instagram-${i + 1}`),
      alt: `Preeskahmour social image ${i + 1}`,
      briefNote:
        'Square crop, 1080×1080. Pull directly from the @preeskahmour grid once the shoot is live. Mix: two full looks, two fabric details, one atelier process, one client portrait.',
    })),
  },
  'howItWorks.page': {
    eyebrow: 'Made to measure',
    headline: 'Four steps between you and a suit that fits',
    lede:
      'No sizes, no guessing, no shop floor. Here is exactly what happens from the moment you open the builder to the day the box arrives.',
    hero: {
      url: PLACEHOLDER('how-it-works-hero'),
      alt: 'Hands pinning a half-made jacket on a tailor’s dummy',
      briefNote:
        'Full-bleed, 2400×1200. Hands pinning a canvassed jacket front on a dress form. Atelier context visible but soft. Warm, low contrast.',
    },
    steps: [
      {
        title: 'Design',
        body:
          'Open the builder and choose your cut, your cloth and every detail down to the lining and the button finish. The preview updates as you go and the price never hides. Save it and come back to it as often as you like.',
        image: {
          url: PLACEHOLDER('step-design'),
          alt: 'A hand scrolling fabric swatches on a phone',
          briefNote: '1200×900. Phone in hand showing the builder, fabric swatches laid on the table beneath it.',
        },
      },
      {
        title: 'Measure',
        body:
          'Enter your measurements against our guided diagram, or answer four quick questions and let us estimate them for you. Estimated measurements are always confirmed with you on a video call before we cut.',
        image: {
          url: PLACEHOLDER('step-measure'),
          alt: 'A tape measure across a shoulder',
          briefNote: '1200×900. Tape measure across the shoulder line, hands of the tailor, close crop.',
        },
      },
      {
        title: 'We tailor',
        body:
          'Your cloth is cut to your pattern — not a graded size — in our Lagos atelier. Canvas is set, the body is closed, the sleeves are hung and everything visible is finished by hand. Twenty-one days, typically.',
        image: {
          url: PLACEHOLDER('step-tailor'),
          alt: 'A tailor working at an industrial machine',
          briefNote: '1200×900. Machinist at work, shallow focus on hands and needle, atelier warmth behind.',
        },
      },
      {
        title: 'Delivered',
        body:
          'It arrives boxed, pressed and tissue-wrapped, anywhere in Nigeria or worldwide. If anything is off, the first alteration is on us — send it back and we will correct it.',
        image: {
          url: PLACEHOLDER('step-delivered'),
          alt: 'A Preeskahmour garment box tied with gold ribbon',
          briefNote: '1200×900. Deep emerald box, gold foil wordmark, tissue and ribbon. Overhead, cream surface.',
        },
      },
    ],
    faq: [
      {
        q: 'What if the fit is not right when it arrives?',
        a: 'Your first alteration is free, always. Send the piece back within 21 days of delivery and we will correct it and return it at our cost. If we cut it wrong, we remake it — no argument, no charge.',
      },
      {
        q: 'How accurate is the quick measurement estimate?',
        a: 'It is a proportional estimate from your height, weight and a few fit questions — not a body scan. It typically lands within about 3.5cm. That is why every estimated profile is confirmed with you on a short video call before we cut, and why estimated orders are made with extra seam allowance.',
      },
      {
        q: 'How long does an order take?',
        a: 'Twenty-one days in the atelier for a standard two-piece, plus delivery. Bridal and heavily embroidered pieces run four to six weeks. Rush work is possible — message us before you order.',
      },
      {
        q: 'Can I send you my own fabric?',
        a: 'Yes. Customers regularly send aso-oke from a family weaver or lace bought for a specific event. Contact us first so we can confirm the yardage you need for your chosen cut, then we deduct the cloth cost from your price.',
      },
      {
        q: 'How do the maternity panels work?',
        a: 'Hidden expansion panels sit inside both side seams and release up to 14cm as you grow, with a ribbed under-bust stay and a front hem drafted longer so it never rides up over the bump. It is a genuinely different construction, not a larger size.',
      },
      {
        q: 'Do you ship outside Nigeria?',
        a: 'Yes, worldwide by courier, with tracking. Duties and import taxes at the destination are the customer’s responsibility.',
      },
      {
        q: 'Can I order for a group — bridesmaids, or an office?',
        a: 'Yes. Six pieces or more goes through our corporate and bulk desk, where you get one point of contact, a fitting session for the whole group and tiered pricing.',
      },
    ],
  },
  'measurementGuide.page': {
    headline: 'How to measure yourself',
    lede:
      'Twenty minutes, a soft tape and — ideally — a friend. Wear close-fitting clothes and the underwear you will wear with the suit. Stand relaxed; do not hold your breath or pull the tape tight.',
    diagram: {
      url: PLACEHOLDER('measurement-diagram'),
      alt: 'Diagram showing where each measurement is taken on the body',
      briefNote:
        'Illustration, 1200×1600. Line-drawn figure, front and back, with numbered call-outs for each measurement. Ink line on cream, gold call-out numbers. Not a photograph.',
    },
    tips: [
      'Use a soft dressmaker’s tape, never a builder’s tape or a piece of string.',
      'Measure over close-fitting clothing, not over a jacket or a jumper.',
      'Keep the tape level all the way round — check the back in a mirror.',
      'Snug, not tight. You should be able to slip one finger under the tape.',
      'Stand as you normally stand. Do not suck in, and do not square up your shoulders for the camera.',
      'Ask someone to take your shoulder and back measurements. These two are almost impossible to do accurately alone.',
      'Write down centimetres. If you only have inches, our form converts for you.',
    ],
    estimatorNote:
      'No tape in the house? Answer four questions and we will estimate your measurements from your height and weight using our proportion table. It is an educated starting point, not a body scan — we confirm every estimated set with you on a video call before cutting.',
  },
  'ourStory.page': {
    eyebrow: 'Our story',
    headline: 'Prisca Ogunlade',
    lede:
      'A trained seamstress from Ado-Ekiti who built a house on the belief that Nigerian cloth deserves the same drafting, canvassing and hand-finishing as anything cut on Savile Row.',
    hero: {
      url: PLACEHOLDER('story-hero'),
      alt: 'The Preeskahmour atelier in Lagos',
      briefNote:
        'Full-bleed, 2400×1300. Wide of the atelier — cutting table, bolts of cloth standing, dress forms, a machinist at the back. Natural light, unstaged.',
    },
    portrait: {
      url: PLACEHOLDER('story-portrait'),
      alt: 'Portrait of Prisca Ogunlade, founder of Preeskahmour',
      briefNote:
        'Portrait 3:4, at least 1200×1600. Prisca to camera, arms folded, wearing her own tailoring. Serious, warm, no smile required. Plain cream or deep emerald ground.',
    },
    sections: [
      {
        heading: 'Ado-Ekiti, and a machine that was not hers',
        body:
          'Prisca learned on a borrowed pedal machine in her aunt’s front room, taking in school uniforms for other people’s children. She finished her apprenticeship at nineteen with a certificate, a pair of shears and no capital. The first thing she sold was a two-piece in wax print, cut from a pattern she drafted on newspaper.',
      },
      {
        heading: 'The problem she kept running into',
        body:
          'Nigerian women were being asked to choose. Either a beautifully made suit in imported wool that ignored the cloth they grew up around, or a beautiful African print run up quickly, unlined, unstructured and out of shape within a season. Nobody was drafting a proper canvassed jacket in aso-oke. So she did.',
      },
      {
        heading: 'What made-to-measure means here',
        body:
          'Every Preeskahmour piece begins as a pattern drafted for one person. No graded sizes, no nesting. The jacket front is canvassed so it holds its shape in Lagos humidity. Buttonholes, under-collars and linings are finished by hand. It takes twenty-one days because that is how long it takes.',
        image: {
          url: PLACEHOLDER('story-process'),
          alt: 'Chalk marks on cloth during pattern cutting',
          briefNote:
            '1400×1000. Tailor’s chalk marks and pattern weights on adire laid flat, shears in frame. Overhead.',
        },
      },
      {
        heading: 'Cutting for every stage',
        body:
          'The maternity line came from a client who was told by three tailors to just buy a bigger size. Prisca drafted her a jacket with expansion panels in the side seams that grew with her for five months and still looked like tailoring. It is now one of the things the house is known for.',
      },
      {
        heading: 'The weavers and the dyers',
        body:
          'We buy adire from dye pits in Abeokuta, aso-oke from narrow looms in Iseyin, and Akwete from women weaving in Abia State. We pay before delivery and we name the makers on every fabric page. When the cloth is hand-made, the price on the tag says so.',
      },
    ],
    timeline: [
      { year: '2014', title: 'The apprenticeship', body: 'Prisca completes her training in Ado-Ekiti and begins taking in private clients from her aunt’s front room.' },
      { year: '2019', title: 'Preeskahmour is founded', body: 'The house is registered in Lagos with one machinist, one cutting table and a rented corner in Yaba.' },
      { year: '2021', title: 'The maternity cut', body: 'The expansion-panel maternity jacket is drafted for a single client and quickly becomes a house signature.' },
      { year: '2022', title: 'Adire, properly canvassed', body: 'First fully canvassed adire suiting collection — the technical problem the house set out to solve.' },
      { year: '2024', title: 'The Ikoyi atelier', body: 'The house moves into a dedicated atelier and fitting room, with six people on the floor.' },
      { year: '2025', title: 'Made to measure, online', body: 'The configurator opens, taking the atelier to women in Abuja, Port Harcourt, London and Houston.' },
    ],
    pullQuote:
      'Fabric is not decoration. It is the whole argument. Everything else is just making sure we are worthy of it.',
  },
  'corporate.page': {
    eyebrow: 'Corporate & bulk',
    headline: 'Uniform, without looking like uniform',
    lede:
      'Measured tailoring for teams of six or more — law firms, hotels, banks, campaign teams, bridal parties. One point of contact, one fitting session, one delivery date.',
    hero: {
      url: PLACEHOLDER('corporate-hero'),
      alt: 'A team of women in matching corporate suiting',
      briefNote:
        'Full-bleed, 2400×1300. Six women in coordinated but not identical suiting — same cloth, different cuts. Corporate lobby or clean architectural setting. Confident, not stiff.',
    },
    bullets: [
      {
        title: 'One fitting session, your office',
        body: 'Our team comes to you and measures everyone in a single afternoon. Nobody takes a day off, nobody guesses their size.',
      },
      {
        title: 'Same cloth, different bodies',
        body: 'Everyone gets the cut that suits them — blazer and trouser, blazer and skirt, waistcoat set — in the same house cloth, so the group reads as one without anyone being forced into a shape that does not work.',
      },
      {
        title: 'Tiered pricing from six pieces',
        body: 'Pricing steps down at 6, 15 and 40 pieces. Quotes are itemised so procurement can see exactly what they are approving.',
      },
      {
        title: 'Repeat orders held on file',
        body: 'We keep every measurement profile. When you hire someone new in eighteen months, we cut to match without starting over.',
      },
      {
        title: 'Maternity handled properly',
        body: 'Staff who become pregnant mid-contract get the expansion-panel construction in the same house cloth, at no penalty to the department budget.',
      },
      {
        title: 'Invoicing that works for finance',
        body: 'Proforma invoice, purchase-order references, staged payment and a named contact who answers the phone.',
      },
    ],
    minimumNote: 'Minimum order six pieces. Lead time four to eight weeks depending on volume.',
  },
  'returns.page': {
    headline: 'Alterations, returns & care',
    lede:
      'Made-to-measure is cut for one person, so it cannot simply go back on a rail. Here is what we do instead — and it is more generous than a returns policy.',
    sections: [
      {
        heading: 'Your first alteration is free',
        body:
          'Within 21 days of delivery, send the piece back and we will alter it to fit and return it, at our cost, anywhere in Nigeria. International customers cover the outbound shipping only. Most pieces need nothing; sleeves and trouser hems are the usual suspects.',
      },
      {
        heading: 'If we cut it wrong, we remake it',
        body:
          'If the garment does not match the measurements on your order, that is our error. We remake it from new cloth at no charge, and we prioritise it in the atelier queue.',
      },
      {
        heading: 'Cancelling an order',
        body:
          'Cancel within 48 hours of ordering for a full refund. After that, cloth has usually been cut and we can refund everything except the fabric cost. Once a garment has been stitched, we cannot refund it — but we can alter it.',
      },
      {
        heading: 'Ready-to-wear pieces',
        body:
          'Anything bought from the shop that is not made-to-measure can be returned unworn, with tags, within 14 days for a full refund.',
      },
      {
        heading: 'Caring for African cloth',
        body:
          'Dry clean adire, aso-oke, George and anything embroidered — never machine wash. Ankara cotton can be hand-washed cold and line-dried in shade; heat and direct sun will pull the colour. Press on the reverse, always, and use a pressing cloth over metallic thread. Store on a wide wooden hanger, never wire.',
      },
      {
        heading: 'Repairs, years later',
        body:
          'Bring a Preeskahmour piece back at any point in its life and we will repair it. Buttons, linings, a re-cut waist after a change in body — we keep your pattern on file for exactly this reason. Repairs outside the first year are charged at cost.',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

/** Human labels + grouping for the /studio content editor. */
export const CONTENT_META: Record<SiteContentKey, { label: string; group: string; hint?: string }> = {
  'site.announcement': { label: 'Announcement bar', group: 'Global', hint: 'The thin strip above the header.' },
  'site.footer': { label: 'Footer copy', group: 'Global' },
  'site.contact': { label: 'Contact details', group: 'Global', hint: 'Used in the footer, the contact page and structured data.' },
  'seo.default': { label: 'Default SEO', group: 'Global', hint: 'Fallback title, description and share image.' },
  'home.hero': { label: 'Homepage hero', group: 'Homepage' },
  'home.marquee': { label: 'Homepage ticker', group: 'Homepage' },
  'home.tilesIntro': { label: 'Occasion tiles intro', group: 'Homepage' },
  'home.fabricStrip': { label: 'Fabric spotlight strip', group: 'Homepage' },
  'home.storyTeaser': { label: 'Story teaser', group: 'Homepage' },
  'home.builderPromo': { label: 'Builder promo', group: 'Homepage' },
  'home.instagram': { label: 'Instagram strip', group: 'Homepage', hint: 'A static grid — paste image URLs from the feed.' },
  'howItWorks.page': { label: 'How It Works page', group: 'Pages' },
  'measurementGuide.page': { label: 'Measurement Guide page', group: 'Pages' },
  'ourStory.page': { label: 'Our Story page', group: 'Pages' },
  'corporate.page': { label: 'Corporate & Bulk page', group: 'Pages' },
  'returns.page': { label: 'Returns & Care page', group: 'Pages' },
};

export const CONTENT_KEYS = Object.keys(DEFAULT_CONTENT) as SiteContentKey[];

/** Shallow-merge a stored value over its default so new fields never break. */
function merge<K extends SiteContentKey>(key: K, stored: unknown): SiteContent[K] {
  const base = DEFAULT_CONTENT[key];
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return base;
  return { ...(base as object), ...(stored as object) } as SiteContent[K];
}

/** Read one content block, falling back to the default. */
export async function getContent<K extends SiteContentKey>(key: K): Promise<SiteContent[K]> {
  const row = await safeQuery(
    () => prisma.siteSetting.findUnique({ where: { key } }),
    null,
  );
  return merge(key, row?.value);
}

/** Read several blocks in one round trip. */
export async function getContentMany<K extends SiteContentKey>(
  keys: K[],
): Promise<{ [P in K]: SiteContent[P] }> {
  const rows = await safeQuery(
    () => prisma.siteSetting.findMany({ where: { key: { in: keys as string[] } } }),
    [] as { key: string; value: unknown }[],
  );
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  const out = {} as { [P in K]: SiteContent[P] };
  for (const key of keys) out[key] = merge(key, byKey.get(key));
  return out;
}
