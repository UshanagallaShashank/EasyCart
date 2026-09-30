import { apiRequest } from '@/shared/api/api-client';
import type { PublicStore } from '../types/storefront-types';
import type { Category } from '@/features/categories/types/category-types';
import type { Product } from '@/features/products/types/product-types';

export function getPublicStore(slug: string): Promise<{ store: PublicStore }> {
  return apiRequest(`/stores/${slug}`);
}

export function listPublicCategories(slug: string): Promise<{ categories: Pick<Category, 'id' | 'name'>[] }> {
  return apiRequest(`/stores/${slug}/categories`);
}

export function listPublicProducts(slug: string, params: { search?: string; category_id?: string } = {}): Promise<{ products: Product[] }> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category_id) query.set('category_id', params.category_id);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiRequest(`/stores/${slug}/products${suffix}`);
}

export function getPublicProduct(slug: string, id: string): Promise<{ product: Product }> {
  return apiRequest(`/stores/${slug}/products/${id}`);
}
