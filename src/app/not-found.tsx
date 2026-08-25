import Link from 'next/link';

import { Wordmark } from '@/components/brand/wordmark';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="motif-diamond flex min-h-dvh flex-col items-center justify-center px-6 py-20 text-center">
      <Wordmark className="text-ink" />

      <p className="mt-14 font-display text-[5rem] leading-none text-gold sm:text-[7rem]">404</p>

      <h1 className="mt-6 text-display-sm text-ink">This one is off the rail</h1>

      <p className="mx-auto mt-4 max-w-md text-[0.98rem] leading-relaxed text-ink-muted">
        The page you were looking for has moved or never existed. The cloth, at least, is all still
        where we left it.
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">Back to the house</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/shop">Browse the shop</Link>
        </Button>
      </div>

      <nav aria-label="Popular pages" className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {[
          { label: 'Design your suit', href: '/builder' },
          { label: 'Fabric library', href: '/fabrics' },
          { label: 'How it works', href: '/how-it-works' },
          { label: 'Contact', href: '/contact' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="link-underline text-[0.66rem] uppercase tracking-[0.16em] text-ink-muted"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
