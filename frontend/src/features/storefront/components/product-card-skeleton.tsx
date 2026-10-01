// Loading placeholder shaped like a product card.
import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
      <Skeleton className="aspect-[4/5] w-full rounded-none bg-slate-200/70" />
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <Skeleton className="h-4 w-4/5 bg-slate-200/70" />
        <Skeleton className="h-4 w-2/5 bg-slate-200/70" />
        <Skeleton className="mt-2 h-5 w-1/3 bg-slate-200/70" />
      </div>
    </div>
  );
}
