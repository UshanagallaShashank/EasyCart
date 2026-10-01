// Displays a responsive grid of product cards with loading skeletons and empty states.
import { PackageOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StaggerList, StaggerItem } from '@/components/motion/reveal';
import { ProductCard } from './product-card';
import type { Product } from '@/features/products/types/product-types';

export function ProductGrid({ products, isLoading, slug }: { products: Product[] | undefined; isLoading: boolean; slug: string }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full rounded-2xl bg-slate-200/60" />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
        <PackageOpen className="size-10 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-700">No products found</p>
        <p className="text-xs text-slate-500">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <StaggerList className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 2xl:grid-cols-5">
      {products.map((product) => (
        <StaggerItem key={product.id} className="h-full">
          <ProductCard product={product} slug={slug} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
