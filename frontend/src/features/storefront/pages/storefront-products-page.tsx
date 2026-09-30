import { useParams, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicStore } from '../hooks/use-public-store';
import { usePublicProducts } from '../hooks/use-public-products';
import { StorefrontHeader } from '../components/storefront-header';
import { CategoryFilter } from '../components/category-filter';
import { ProductSearchInput } from '../components/product-search-input';
import { ProductGrid } from '../components/product-grid';

export function StorefrontProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { data: store, isLoading, isError } = usePublicStore(slug!);
  const { data: products, isLoading: productsLoading } = usePublicProducts(
    slug!,
    searchParams.get('search') ?? undefined,
    searchParams.get('category_id') ?? undefined
  );

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !store) return <p className="p-6 text-muted-foreground">Store not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <StorefrontHeader store={store} slug={slug!} />
      <div className="flex flex-col gap-4 px-6">
        <div className="flex gap-4">
          <ProductSearchInput />
          <CategoryFilter slug={slug!} />
        </div>
        <ProductGrid products={products} isLoading={productsLoading} slug={slug!} />
      </div>
    </div>
  );
}
