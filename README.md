# Preeskahmour

Made-to-measure suiting in Nigerian cloth — the full commerce platform for a
Lagos atelier: an editorial storefront, a six-step suit configurator with a
live preview, Paystack and Stripe checkout, customer accounts, and a `/studio`
CMS that puts every word and image on the site under the owner's control.

Built with Next.js 15 (App Router), TypeScript, Tailwind, Prisma and Postgres.

---

## Getting it running

You need **Node 20+** and a **Postgres database**. Nothing else.

```bash
npm install
```

```bash
cp .env.example .env
```

Fill in `DATABASE_URL` and `AUTH_SECRET` — everything else is optional and the
app degrades honestly without it (see [Optional services](#optional-services)).

Generate a secret with:

```bash
openssl rand -base64 32
```

Then create the schema and load the sample catalogue:

```bash
npm run db:seed
```

```bash
npm run dev
```

The site is at `http://localhost:3000`, and the studio at
`http://localhost:3000/studio`.

The seed prints two sign-ins when it finishes:

| Role | Email | Password |
| --- | --- | --- |
| Owner (studio access) | `prisca@preeskahmour.com` | `Preeska2024!` |
| Customer (demo data) | `demo@preeskahmour.com` | `Demo2024!` |

Change the owner credentials with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
before seeding, and change them again before going live.

### No Postgres to hand?

The quickest free option is a [Neon](https://neon.tech) branch — create a
project, copy the connection string into `DATABASE_URL`, and run `npm run
db:seed`. [Railway](https://railway.app) and [Supabase](https://supabase.com)
work identically. Locally, `docker run --name pkm -e POSTGRES_PASSWORD=postgres
-e POSTGRES_DB=preeskahmour -p 5432:5432 -d postgres:16` is enough.

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run start` | Serve the production build |
| `npm run db:seed` | Apply migrations, then seed the catalogue. Safe to re-run — every write is an upsert and it will not overwrite content edited in the studio |
| `npm run db:migrate` | Create a new migration after changing `schema.prisma` |
| `npm run db:deploy` | Apply migrations only (what CI/production runs) |
| `npm run db:studio` | Prisma Studio, for poking at rows directly |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run assets:placeholders` | Regenerate the placeholder images and `README-ASSETS.md` |

---

## Optional services

The app runs fully without any of these. Each one is absent-tolerant on
purpose, and says so in the UI rather than failing silently.

| Service | Without it |
| --- | --- |
| **Cloudinary** | Uploads are disabled in the studio and a banner says so. Every image field still accepts a pasted URL, so the site remains fully editable. |
| **Paystack** | The naira payment option disappears from checkout. |
| **Stripe** | The international card option disappears from checkout. |
| **Both payment rails** | Checkout explains that online payment is not switched on and routes the customer to contact the atelier directly. |

Webhook endpoints, once you have keys:

- Paystack → `https://your-domain/api/webhooks/paystack`
- Stripe → `https://your-domain/api/webhooks/stripe`

Both verify signatures and refuse anything unsigned. Locally, use
`stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

---

## How it is put together

```
prisma/
  schema.prisma        23 models. Money is integer kobo everywhere.
  seed.ts              Idempotent sample catalogue.
src/
  app/
    (marketing)/       The public site + the customer account area.
    studio/            The CMS. Its own root layout; no public chrome.
    api/               Checkout, webhooks, designs, forms, auth.
  components/
    builder/           The configurator and its SVG live preview.
    studio/            The CMS form system.
    ui/                shadcn-derived primitives, restyled to the house look.
  lib/
    pricing.ts         The ONLY place a garment price is computed.
    measurements.ts    The field dictionary + the estimate heuristic.
    swatches.ts        Procedural fabric patterns.
    site-content.ts    Typed editable content + defaults.
    orders.ts          Re-derives every order line from the database.
    payments/          One interface, two rails.
scripts/
  asset-manifest.ts    Every image slot on the site, in one list.
```

A few decisions worth knowing about:

**Money is always integer kobo.** `145_000_00` is ₦145,000. The studio takes
naira because that is how Prisca thinks, and converts in exactly one place.
No floats touch a price.

**The client never sends money.** The cart posts ids and quantities; checkout
re-derives every line from the database. A tampered `localStorage` cart
claiming a ₦300,000 suit costs ₦1 still produces an order for ₦300,000.

**The live preview is vector, not raster.** The builder draws the garment as a
single inline SVG in the style of a tailor's technical flat, filling it with
the chosen cloth through an SVG `<pattern>`. Changing a lapel is a synchronous
re-render with no network request. It is a pure function of `GarmentConfig`, so
a WebGL viewer could replace it without touching the store, the schema or any
step component. See the header comment in
`src/components/builder/garment-preview.tsx`.

**The measurement estimator is a heuristic, and says so.** It is a table of
stature proportions adjusted by a BMI-derived girth term — not a body scan, not
machine learning. Every estimated profile is flagged in the database, shown as
estimated to the customer and to the atelier, and confirmed on a video call
before anything is cut. `src/lib/measurements.ts` explains the whole thing.

**Content is editable, not hardcoded.** Every marketing page reads from the
database. `DEFAULT_CONTENT` in `src/lib/site-content.ts` defines both the shape
and the fallback copy; the studio generates its editing forms from that shape,
so adding a field there makes it editable with no further work.

---

## Deploying

### The app — Vercel

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).
2. Add every variable from `.env.example` in **Settings → Environment Variables**.
3. Set `NEXT_APP_URL` and `NEXTAUTH_URL` to the real domain.
4. Deploy. The build runs `prisma generate` automatically.

Run migrations against production once, from your machine:

```bash
DATABASE_URL="your-production-url" npm run db:deploy
```

Seed production **only** if you want the sample catalogue in it:

```bash
DATABASE_URL="your-production-url" npm run db:seed
```

### The database — Neon or Railway

Either works. Use a pooled connection string on Vercel (Neon calls it
`-pooler`), since serverless functions open a lot of short-lived connections.

### After the first deploy

- Sign in at `/studio` and change the owner password.
- Point the Paystack and Stripe webhooks at the live URLs above.
- Work through `README-ASSETS.md` with a photographer.

---

## About the images

**There is no real photography in this repository, and no depiction of any real
person.** Every image slot holds a generated placeholder carrying its own
filename and pixel dimensions, so an unshot slot is obvious in the layout
rather than quietly looking finished. Fabric swatches are original geometric
SVGs evoking each weave — not reproductions of anyone's textile designs.

[`README-ASSETS.md`](./README-ASSETS.md) lists all 87 slots with exact
dimensions and a shot note for each. It is generated from
`scripts/asset-manifest.ts`; edit that and re-run `npm run assets:placeholders`
rather than editing the document by hand.

Replacing a placeholder never needs a developer: sign in to `/studio`, find the
record, upload. The database URL replaces the placeholder path immediately.

---

## Verification status

What has been checked, so you know what to trust:

- `npm run typecheck` and `npm run lint` are clean.
- `npm run build` compiles all routes.
- `npm run db:seed` runs end to end against a live Postgres.
- The builder was driven end to end in a browser: the preview repaints on every
  option change with no page reload, and the prices it quotes match the pricing
  engine exactly.
- Every public page was audited at 375px: no horizontal overflow, no images
  missing alt text, one `h1` per page, no skipped heading levels.
- `/studio` and `/account` redirect anonymous visitors to sign-in.

**Not yet verified:** the Paystack and Stripe flows have not been exercised
against real sandbox keys — no test credentials were available in this
environment. The provider integrations, signature verification and the
idempotent settlement logic are written and typecheck, but the round trip
should be run once with real test keys before taking money.
