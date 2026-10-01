// Products catalog page with debounced search, category chips, sorting, and product grid.
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePublicProducts } from '../hooks/use-public-products';
import { useProductFilters } from '../hooks/use-product-filters';
import { CategoryFilter } from '../components/category-filter';
import { ProductSearchInput } from '../components/product-search-input';
import { ProductSortSelect } from '../components/product-sort-select';
import { ProductGrid } from '../components/product-grid';
import { sort_products } from '../utils/sort-products';

export function StorefrontProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { search, categoryId, sort, set_filter, clear_filters } = useProductFilters();
  const { data, isLoading } = usePublicProducts(slug!, search || undefined, categoryId || undefined);
  const products = data ? sort_products(data, sort) : undefined;
  const hasFilters = Boolean(search || categoryId);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 pt-6 sm:px-6 sm:pt-10">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">Shop all</h1>
        <p className="mt-1 text-sm text-slate-500" aria-live="polite">
          {isLoading ? 'Loading products…' : `${products?.length ?? 0} ${products?.length === 1 ? 'product' : 'products'}${search ? ` for “${search}”` : ''}`}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ProductSearchInput value={search} onSearch={(term) => set_filter('search', term)} />
        <ProductSortSelect value={sort} onChange={(next) => set_filter('sort', next === 'featured' ? undefined : next)} />
      </div>
      <CategoryFilter slug={slug!} value={categoryId} onChange={(id) => set_filter('category_id', id)} />
      <ProductGrid
        products={products}
        isLoading={isLoading}
        slug={slug!}
        emptyAction={hasFilters && <Button variant="outline" onClick={clear_filters}>Clear filters</Button>}
      />
    </div>
  );
}
