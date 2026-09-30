// Products catalog page with real-time search, category filtering, and product grid.
import { useParams, useSearchParams } from 'react-router-dom';
import { usePublicProducts } from '../hooks/use-public-products';
import { CategoryFilter } from '../components/category-filter';
import { ProductSearchInput } from '../components/product-search-input';
import { ProductGrid } from '../components/product-grid';

export function StorefrontProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { data: products, isLoading } = usePublicProducts(
    slug!,
    searchParams.get('search') ?? undefined,
    searchParams.get('category_id') ?? undefined
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">All Products</h1>
          <p className="text-xs text-slate-500 mt-1">{products?.length ?? 0} items available</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ProductSearchInput />
          <CategoryFilter slug={slug!} />
        </div>
      </div>
      <ProductGrid products={products} isLoading={isLoading} slug={slug!} />
    </div>
  );
}
