'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  AlertTriangle,
  ExternalLink,
  FileText,
  Home,
  Images,
  Inbox,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Palette,
  Quote,
  Scissors,
  Settings2,
  Shirt,
  Sparkles,
  X,
} from 'lucide-react';

import { Monogram } from '@/components/brand/wordmark';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: 'enquiries' | 'orders';
};

const SECTIONS: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Orders',
    links: [
      { href: '/studio', label: 'Dashboard', icon: Home, exact: true },
      { href: '/studio/orders', label: 'Orders', icon: Package, badge: 'orders' },
      { href: '/studio/enquiries', label: 'Inbox', icon: Inbox, badge: 'enquiries' },
    ],
  },
  {
    heading: 'Catalogue',
    links: [
      { href: '/studio/fabrics', label: 'Fabrics', icon: Palette },
      { href: '/studio/products', label: 'Products', icon: Shirt },
      { href: '/studio/collections', label: 'Collections', icon: LayoutGrid },
      { href: '/studio/base-styles', label: 'Cuts', icon: Scissors },
      { href: '/studio/design-options', label: 'Design options', icon: Sparkles },
    ],
  },
  {
    heading: 'Content',
    links: [
      { href: '/studio/content', label: 'Pages & homepage', icon: Settings2 },
      { href: '/studio/journal', label: 'Journal', icon: FileText },
      { href: '/studio/lookbook', label: 'Lookbook', icon: Images },
      { href: '/studio/testimonials', label: 'Testimonials', icon: Quote },
    ],
  },
];

export function StudioNav({
  name,
  counts,
  cloudinaryReady,
}: {
  name: string;
  counts: { enquiries: number; orders: number };
  cloudinaryReady: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-ivory/10 px-5 py-5">
        <Monogram className="text-gold" size={28} />
        <div className="min-w-0">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-ivory">Studio</p>
          <p className="truncate text-[0.62rem] text-ivory/45">{name}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Studio">
        {SECTIONS.map((section) => (
          <div key={section.heading} className="mb-6">
            <p className="px-3 pb-2 text-[0.58rem] uppercase tracking-[0.2em] text-ivory/30">
              {section.heading}
            </p>

            <ul className="space-y-0.5">
              {section.links.map((link) => {
                const active = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                const Icon = link.icon;
                const count = link.badge ? counts[link.badge] : 0;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-[0.8rem] transition-colors',
                        active
                          ? 'bg-ivory/10 text-ivory'
                          : 'text-ivory/60 hover:bg-ivory/5 hover:text-ivory',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{link.label}</span>
                      {count > 0 ? (
                        <span className="shrink-0 bg-gold px-1.5 text-[0.6rem] font-medium text-ink">
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!cloudinaryReady ? (
        <div className="mx-3 mb-3 flex gap-2 border border-gold/30 bg-gold/10 p-3">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
          <p className="text-[0.66rem] leading-relaxed text-ivory/70">
            Cloudinary is not configured, so uploads are off. You can still paste image URLs.
          </p>
        </div>
      ) : null}

      <div className="border-t border-ivory/10 px-3 py-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 text-[0.8rem] text-ivory/60 transition-colors hover:text-ivory"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          View the site
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 px-3 py-2 text-[0.8rem] text-ivory/60 transition-colors hover:text-terracotta-light"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-ink/10 bg-ink px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Monogram className="text-gold" size={22} />
          <span className="font-display text-xs uppercase tracking-[0.2em] text-ivory">Studio</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center text-ivory"
          aria-label="Open studio menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/60"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-ink">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 z-10 flex h-9 w-9 items-center justify-center text-ivory/70"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            {nav}
          </div>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden bg-ink lg:sticky lg:top-0 lg:block lg:h-dvh">{nav}</aside>
    </>
  );
}
