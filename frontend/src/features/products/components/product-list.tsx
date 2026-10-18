// Loads products and shows the filter pills, search box, and resulting product table.
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FilterPills } from '@/components/filter-pills';
import { SearchField } from '@/components/search-field';
import { useProducts } from '../hooks/use-products';
import { useProductListFilter, type ProductView } from '../hooks/use-product-list-filter';
import { ProductTable } from './product-table';

export function ProductList() {
  const { data: products, isLoading } = useProducts();
  const { search, setSearch, view, setView, visible, counts } = useProductListFilter(products ?? []);

  if (isLoading) return <Skeleton className="h-80 w-full rounded-2xl" />;
  if (!products?.length) return <EmptyState message="No products yet. Add your first product to start selling." />;

  const views: { value: ProductView; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'active', label: 'Active', count: counts.active },
    { value: 'hidden', label: 'Hidden', count: counts.hidden },
    { value: 'low', label: 'Low stock', count: counts.low }
  ];

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterPills<ProductView> options={views} value={view} onChange={setView} />
        <SearchField value={search} onChange={setSearch} placeholder="Search name or SKU" />
      </div>
      {visible.length ? <ProductTable products={visible} /> : <EmptyState message="No products match your filters." />}
    </>
  );
}
