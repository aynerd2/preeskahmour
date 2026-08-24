import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';

import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CartProvider } from '@/components/cart/cart-provider';
import { AuthProvider } from '@/components/auth-provider';
import { BRAND } from '@/lib/constants';
import { absoluteUrl } from '@/lib/utils';
import { getContent } from '@/lib/site-content';

import './globals.css';

/**
 * Two faces, self-hosted at build time by next/font.
 *
 * Fraunces — a high-contrast optical serif with a real "soft" axis. Used for
 * every heading, set tight. This is the deliberate move away from the
 * condensed-sans-everywhere look of the reference site.
 *
 * Inter — the geometric-leaning workhorse for UI, body and anything that has
 * to be legible at 12px on a phone in daylight.
 */
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  axes: ['SOFT', 'WONK', 'opsz'],
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getContent('seo.default');

  return {
    metadataBase: new URL(absoluteUrl()),
    title: {
      default: seo.title,
      template: `%s · ${BRAND.name}`,
    },
    description: seo.description,
    applicationName: BRAND.name,
    keywords: [
      'made to measure Nigeria',
      'Ankara suit',
      'aso-oke blazer',
      'adire tailoring',
      'bespoke womenswear Lagos',
      'maternity suit',
      'Nigerian luxury fashion',
      'bridal trouser suit',
    ],
    authors: [{ name: BRAND.founder }],
    creator: BRAND.name,
    openGraph: {
      type: 'website',
      locale: 'en_NG',
      siteName: BRAND.name,
      title: seo.title,
      description: seo.description,
      images: [{ url: seo.ogImage, width: 1200, height: 630, alt: BRAND.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: '#FBF8F3',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground">
        <a
          href="#main"
          className="sr-only z-[100] bg-ink px-4 py-3 text-sm text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          </CartProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
