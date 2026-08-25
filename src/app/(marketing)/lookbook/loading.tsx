import { MasonrySkeleton, PageHeaderSkeleton } from '@/components/shared/loading-skeletons';

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <MasonrySkeleton />
    </>
  );
}
