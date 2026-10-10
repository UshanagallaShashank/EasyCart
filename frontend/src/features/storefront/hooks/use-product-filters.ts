// Reads and updates storefront catalog filters (search, category, sort) stored in the URL.
import { useSearchParams } from 'react-router-dom';
import type { ProductSort } from '../utils/sort-products';

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  function set_filter(key: 'search' | 'category_id' | 'sort', value?: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

  return {
    search: searchParams.get('search') ?? '',
    categoryId: searchParams.get('category_id') ?? '',
    sort: (searchParams.get('sort') ?? 'featured') as ProductSort,
    set_filter,
    clear_filters: () => setSearchParams(new URLSearchParams(), { replace: true })
  };
}
