import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

/** The gold hairline used between editorial sections. */
export function GoldRule({ className }: { className?: string }) {
  return <hr className={cn('gold-rule my-0 border-0', className)} aria-hidden />;
}

/**
 * Standard section heading: small tracked eyebrow, display headline, optional
 * standfirst and a link. Used across every marketing page so the vertical
 * rhythm never drifts between them.
 */
export function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'left',
  link,
  className,
  tone = 'ink',
  as: Tag = 'h2',
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: 'left' | 'center';
  link?: { label: string; href: string };
  className?: string;
  tone?: 'ink' | 'ivory';
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn('eyebrow', tone === 'ivory' && 'text-ivory/60')}>{eyebrow}</p>
      ) : null}

      <div
        className={cn(
          'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-10',
          align === 'center' && 'sm:flex-col sm:items-center',
        )}
      >
        <Tag
          className={cn(
            'max-w-2xl text-display-md',
            tone === 'ivory' ? 'text-ivory' : 'text-ink',
            align === 'center' && 'mx-auto',
          )}
        >
          {title}
        </Tag>

        {link ? (
          <Link
            href={link.href}
            className={cn(
              'link-underline group inline-flex shrink-0 items-center gap-2 pb-1 text-[0.72rem] font-medium uppercase tracking-[0.16em]',
              tone === 'ivory' ? 'text-ivory/80 hover:text-ivory' : 'text-ink-muted hover:text-ink',
            )}
          >
            {link.label}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-editorial group-hover:translate-x-1" />
          </Link>
        ) : null}
      </div>

      {body ? (
        <p
          className={cn(
            'max-w-2xl text-[1.02rem] leading-relaxed',
            tone === 'ivory' ? 'text-ivory/70' : 'text-ink-muted',
            align === 'center' && 'mx-auto',
          )}
        >
          {body}
        </p>
      ) : null}
    </Reveal>
  );
}

/** Consistent vertical padding for a page section. */
export function Section({
  children,
  className,
  size = 'md',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        size === 'sm' && 'py-14 sm:py-16',
        size === 'md' && 'py-16 sm:py-24',
        size === 'lg' && 'py-20 sm:py-32',
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Empty state used wherever the database has nothing to show yet. */
export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'motif-diamond flex flex-col items-center gap-4 border border-dashed border-ink/20 px-6 py-16 text-center',
        className,
      )}
    >
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {body ? <p className="max-w-md text-sm leading-relaxed text-ink-muted">{body}</p> : null}
      {action}
    </div>
  );
}
