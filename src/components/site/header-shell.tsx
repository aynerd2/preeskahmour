'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';

import { Wordmark } from '@/components/brand/wordmark';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useCart, cartCount } from '@/store/cart';
import { MAIN_NAV, OCCASION_LABELS, OCCASION_ORDER } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Announcement = {
  enabled: boolean;
  message: string;
  linkLabel: string;
  href: string;
};

export function HeaderShell({ announcement }: { announcement: Announcement }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const openCart = useCart((s) => s.open);
  const count = hydrated ? cartCount(items) : 0;

  const { data: session } = useSession();

  // The homepage lays its header over a full-bleed hero, so it starts
  // transparent with ivory type and inverts once you scroll past the fold.
  const overHero = pathname === '/';

  React.useEffect(() => {
    if (!overHero) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overHero]);

  React.useEffect(() => setMenuOpen(false), [pathname]);

  const inverted = overHero && !scrolled;

  return (
    <>
      {announcement.enabled ? (
        <div className="bg-emerald-deep px-4 py-2.5 text-center">
          <p className="text-[0.68rem] uppercase tracking-[0.14em] text-ivory/85">
            {announcement.message}{' '}
            {announcement.linkLabel ? (
              <Link href={announcement.href} className="ml-1 text-gold-light underline underline-offset-4">
                {announcement.linkLabel}
              </Link>
            ) : null}
          </p>
        </div>
      ) : null}

      <header
        className={cn(
          'sticky top-0 z-40 transition-colors duration-500 ease-editorial',
          inverted
            ? 'bg-transparent text-ivory'
            : 'border-b border-ink/10 bg-ivory/92 text-ink backdrop-blur-md',
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-4 sm:h-20">
          {/* Left: mobile menu + desktop nav */}
          <div className="flex flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ml-2 flex h-10 w-10 items-center justify-center lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
              {MAIN_NAV.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'link-underline text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-100',
                    pathname.startsWith(item.href) ? 'opacity-100' : 'opacity-75',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Centre: wordmark */}
          <Wordmark className={inverted ? 'text-ivory' : 'text-ink'} />

          {/* Right: secondary nav + actions */}
          <div className="flex flex-1 items-center justify-end gap-1">
            <nav className="mr-4 hidden items-center gap-7 lg:flex" aria-label="Secondary">
              {MAIN_NAV.slice(4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'link-underline text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-opacity',
                    pathname.startsWith(item.href) ? 'opacity-100' : 'opacity-75',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/shop"
              className="hidden h-10 w-10 items-center justify-center sm:flex"
              aria-label="Search the shop"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>

            <Link
              href={session?.user ? '/account' : '/login'}
              className="flex h-10 w-10 items-center justify-center"
              aria-label={session?.user ? 'Your account' : 'Sign in'}
            >
              <User className="h-[18px] w-[18px]" />
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative -mr-2 flex h-10 w-10 items-center justify-center"
              aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 ? (
                <span className="absolute right-0.5 top-1 flex h-[17px] min-w-[17px] items-center justify-center bg-gold px-1 text-[0.6rem] font-semibold text-ink">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent side="left" hideClose className="overflow-y-auto">
          <DialogTitle className="sr-only">Menu</DialogTitle>

          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-5">
            <Wordmark />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="-mr-2 flex h-10 w-10 items-center justify-center"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col px-5 py-6" aria-label="Mobile">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-ink/8 py-4 font-display text-2xl text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="px-5 pb-4">
            <p className="eyebrow mb-3">Shop by occasion</p>
            <div className="flex flex-wrap gap-2">
              {OCCASION_ORDER.map((occasion) => (
                <Link
                  key={occasion}
                  href={`/shop?occasion=${occasion}`}
                  className="border border-ink/20 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-ink-muted"
                >
                  {OCCASION_LABELS[occasion]}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-ink/10 p-5">
            <Button asChild full size="lg">
              <Link href="/builder">Design your suit</Link>
            </Button>
            <Link
              href={session?.user ? '/account' : '/login'}
              className="mt-4 block text-center text-xs uppercase tracking-[0.16em] text-ink-muted"
            >
              {session?.user ? 'Your account' : 'Sign in'}
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
