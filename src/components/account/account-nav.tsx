'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, LogOut, Package, Ruler, Shirt, User } from 'lucide-react';

import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/account', label: 'Overview', icon: User, exact: true },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/measurements', label: 'Measurements', icon: Ruler },
  { href: '/account/designs', label: 'Saved designs', icon: Shirt },
];

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="lg:sticky lg:top-28 lg:self-start">
      {/* Horizontal scroll on mobile, a column on desktop */}
      <ul className="hide-scrollbar -mx-5 flex gap-1 overflow-x-auto border-b border-ink/10 px-5 pb-px lg:mx-0 lg:flex-col lg:gap-0 lg:border-b-0 lg:px-0">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <li key={link.href} className="shrink-0 lg:w-full">
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 whitespace-nowrap px-3 py-3 text-[0.7rem] uppercase tracking-[0.14em] transition-colors lg:border-l-2 lg:px-4',
                  active
                    ? 'border-b-2 border-gold text-ink lg:border-b-0 lg:border-l-gold'
                    : 'border-b-2 border-transparent text-ink-muted hover:text-ink lg:border-b-0 lg:border-l-transparent',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {link.label}
              </Link>
            </li>
          );
        })}

        {isAdmin ? (
          <li className="shrink-0 lg:w-full">
            <Link
              href="/studio"
              className="flex items-center gap-2.5 whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-[0.7rem] uppercase tracking-[0.14em] text-emerald transition-colors hover:text-emerald-deep lg:border-b-0 lg:border-l-2 lg:border-l-transparent lg:px-4"
            >
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
              The studio
            </Link>
          </li>
        ) : null}

        <li className="shrink-0 lg:mt-4 lg:w-full lg:border-t lg:border-ink/10 lg:pt-4">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-2.5 whitespace-nowrap px-3 py-3 text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint transition-colors hover:text-destructive lg:px-4"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  );
}
