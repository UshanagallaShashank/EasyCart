import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from './product-card';
import type { Product } from '@/features/products/types/product-types';

export function ProductGrid({ products, isLoading, slug }: { products: Product[] | undefined; isLoading: boolean; slug: string }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
      </div>
    );
  }
  if (!products?.length) return <p className="text-muted-foreground">No products found.</p>;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => <ProductCard key={product.id} product={product} slug={slug} />)}
    </div>
  );
}
