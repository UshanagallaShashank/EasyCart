// Loading placeholder matching the two-column product detail layout.
import { Skeleton } from '@/components/ui/skeleton';

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pt-6 sm:px-6 md:grid-cols-2 md:pt-10">
      <Skeleton className="aspect-square w-full rounded-3xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
