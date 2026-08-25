import { CardGridSkeleton, PageHeaderSkeleton } from '@/components/shared/loading-skeletons';

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <CardGridSkeleton
        withRail
        count={8}
        aspect="aspect-square"
        columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      />
    </>
  );
}
