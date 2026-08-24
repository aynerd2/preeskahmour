import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Standard page opener. Two modes:
 *   - plain (default): eyebrow, headline and standfirst on the cream ground
 *   - image: the same type laid over a full-bleed editorial photograph
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  image,
  breadcrumbs,
  align = 'left',
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  image?: { url: string; alt: string };
  breadcrumbs?: { label: string; href?: string }[];
  align?: 'left' | 'center';
  children?: React.ReactNode;
  className?: string;
}) {
  if (image) {
    return (
      <header className="relative isolate -mt-16 flex min-h-[56svh] items-end overflow-hidden sm:-mt-20 sm:min-h-[62svh]">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-10 object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/25"
          aria-hidden
        />

        <div className={cn('container pb-14 pt-32 sm:pb-20', className)}>
          <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
            {eyebrow ? <p className="eyebrow text-gold-light">{eyebrow}</p> : null}
            <h1 className="mt-4 text-display-lg text-ivory">{title}</h1>
            {lede ? (
              <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-ivory/75">{lede}</p>
            ) : null}
            {children}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={cn('container pb-12 pt-12 sm:pb-16 sm:pt-16', className)}>
      {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}

      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-4 text-display-lg text-ink">{title}</h1>
        {lede ? (
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-ink-muted">{lede}</p>
        ) : null}
        {children}
      </div>

      <hr className="gold-rule mt-10 border-0 sm:mt-12" />
    </header>
  );
}

export function Breadcrumbs({
  items,
  tone = 'ink',
}: {
  items: { label: string; href?: string }[];
  tone?: 'ink' | 'ivory';
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-7">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.14em]">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? (
              <ChevronRight
                className={cn('h-3 w-3', tone === 'ivory' ? 'text-ivory/40' : 'text-ink-faint')}
                aria-hidden
              />
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'transition-colors',
                  tone === 'ivory'
                    ? 'text-ivory/60 hover:text-ivory'
                    : 'text-ink-faint hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(tone === 'ivory' ? 'text-ivory' : 'text-ink')}
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
