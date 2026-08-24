'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Scroll-triggered fade-and-rise, the site's only entrance animation.
 *
 * Uses IntersectionObserver rather than a scroll listener so it costs nothing
 * on a mid-range Android, and reveals once then disconnects. Anyone with
 * `prefers-reduced-motion: reduce` sees the content immediately — the global
 * rule in globals.css already collapses the duration, and we skip the
 * observer entirely so nothing is ever left invisible if it misfires.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger, in milliseconds. Keep under ~350 or the page feels slow. */
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'span';
}) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      // Fire slightly before the element reaches the fold so the motion has
      // finished by the time it is properly in view.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={shown && delay ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(shown ? 'animate-fade-rise' : 'opacity-0', className)}
    >
      {children}
    </Tag>
  );
}
