import { CardGridSkeleton, PageHeaderSkeleton } from '@/components/shared/loading-skeletons';

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <CardGridSkeleton withRail count={6} />
    </>
  );
}
