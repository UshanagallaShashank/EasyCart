// Responsive grid of product cards with card-shaped loading skeletons and an empty state.
import type { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';
import { StaggerList, StaggerItem } from '@/components/motion/reveal';
import { ProductCard } from './product-card';
import { ProductCardSkeleton } from './product-card-skeleton';
import type { Product } from '@/features/products/types/product-types';

const GRID_CLASS = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4';

interface ProductGridProps {
  products: Product[] | undefined;
  isLoading: boolean;
  slug: string;
  emptyAction?: ReactNode;
}

export function ProductGrid({ products, isLoading, slug, emptyAction }: ProductGridProps) {
  if (isLoading) {
    return <div className={GRID_CLASS}>{Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>;
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <PackageOpen className="mb-2 size-10 text-slate-400" />
        <p className="text-sm font-semibold text-slate-800">No products found</p>
        <p className="text-sm text-slate-500">Try a different search or category.</p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <StaggerList className={GRID_CLASS}>
      {products.map((product) => (
        <StaggerItem key={product.id} className="h-full"><ProductCard product={product} slug={slug} /></StaggerItem>
      ))}
    </StaggerList>
  );
}
