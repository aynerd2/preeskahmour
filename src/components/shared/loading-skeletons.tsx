import { Skeleton } from '@/components/ui/skeleton';

/**
 * Route-level loading states.
 *
 * Every one mirrors the real layout's shape rather than showing a spinner, so
 * the page does not jump when the data lands — which matters most on the
 * mid-range Android connections most of this audience is on.
 */

export function PageHeaderSkeleton() {
  return (
    <div className="container pb-12 pt-12 sm:pb-16 sm:pt-16">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-5 h-12 w-full max-w-xl" />
      <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
      <Skeleton className="mt-2 h-4 w-3/4 max-w-xl" />
      <div className="mt-10 h-px w-full bg-ink/10 sm:mt-12" />
    </div>
  );
}

export function CardGridSkeleton({
  count = 6,
  aspect = 'aspect-[3/4]',
  columns = 'grid-cols-2 lg:grid-cols-3',
  withRail = false,
}: {
  count?: number;
  aspect?: string;
  columns?: string;
  withRail?: boolean;
}) {
  const grid = (
    <div className={`grid gap-x-4 gap-y-10 sm:gap-x-5 lg:gap-x-6 ${columns}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className={`w-full ${aspect}`} />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );

  if (!withRail) return <div className="container pb-24">{grid}</div>;

  return (
    <div className="container pb-24">
      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="hidden space-y-6 lg:block">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-2.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ))}
        </div>
        {grid}
      </div>
    </div>
  );
}

export function ArticleListSkeleton() {
  return (
    <div className="container pb-24">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <Skeleton className="aspect-[8/5] w-full" />
        <div className="flex flex-col justify-center gap-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>

      <div className="mt-20 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[8/5] w-full" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MasonrySkeleton() {
  const heights = ['h-72', 'h-52', 'h-80', 'h-64', 'h-56', 'h-72', 'h-60', 'h-80', 'h-52'];
  return (
    <div className="container pb-24">
      <div className="columns-2 gap-4 lg:columns-3 lg:gap-6">
        {heights.map((height, i) => (
          <Skeleton key={i} className={`mb-4 w-full lg:mb-6 ${height}`} />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      <div className="mt-8 space-y-px border border-ink/12 bg-ink/5">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 bg-background px-4 py-4">
            <Skeleton className="h-10 w-10 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
