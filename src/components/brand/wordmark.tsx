import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * The wordmark. Set in the display serif at wide tracking — the whole brand
 * identity in one line, so it must never be squeezed or given a drop shadow.
 */
export function Wordmark({
  className,
  href = '/',
  as = 'link',
}: {
  className?: string;
  href?: string;
  as?: 'link' | 'text';
}) {
  const inner = (
    <span
      className={cn(
        'font-display text-[1.05rem] font-medium uppercase leading-none tracking-[0.34em] sm:text-[1.15rem]',
        className,
      )}
    >
      Preeskahmour
    </span>
  );

  if (as === 'text') return inner;

  return (
    <Link href={href} aria-label="Preeskahmour — home" className="inline-block">
      {inner}
    </Link>
  );
}

/**
 * Monogram used as the favicon, the loading mark and the studio sidebar badge.
 * An original construction: a P inside concentric adire-style squares.
 */
export function Monogram({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect x="1" y="1" width="46" height="46" stroke="currentColor" strokeOpacity="0.35" />
      <rect x="6" y="6" width="36" height="36" stroke="currentColor" strokeOpacity="0.6" />
      <path
        d="M18 34V14h7.6c3.9 0 6.4 2.3 6.4 5.9 0 3.7-2.5 6-6.4 6H21.6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="square"
      />
    </svg>
  );
}
