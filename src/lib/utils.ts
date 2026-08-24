import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Money is stored everywhere in the database as an integer of the smallest
 * currency unit (kobo for NGN, cents for USD). Never store float naira.
 */
export function formatMoney(minorUnits: number, currency: 'NGN' | 'USD' = 'NGN') {
  const value = minorUnits / 100;
  return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/** NGN -> USD display conversion for the secondary Stripe rail. */
export const NGN_PER_USD = Number(process.env.NEXT_PUBLIC_NGN_PER_USD ?? 1600);

export function ngnToUsdMinor(ngnMinor: number) {
  return Math.round(ngnMinor / NGN_PER_USD);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...opts,
  }).format(new Date(date));
}

export function titleCase(input: string) {
  return input
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Human label for an enum-ish constant: MADE_TO_MEASURE -> Made To Measure */
export function humanize(value: string) {
  return titleCase(value.replace(/_/g, ' '));
}

export function truncate(input: string, max = 160) {
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1).trimEnd()}…`;
}

/** Deterministic order reference, e.g. PKM-7F3A21 */
export function orderReference() {
  return `PKM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function absoluteUrl(path = '') {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
