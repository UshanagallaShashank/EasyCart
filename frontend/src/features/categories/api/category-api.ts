import { apiRequest } from '@/shared/api/api-client';
import type { Category } from '../types/category-types';

export function listCategories(): Promise<{ categories: Category[] }> {
  return apiRequest('/categories');
}

export function createCategory(name: string): Promise<{ category: Category }> {
  return apiRequest('/categories', { method: 'POST', body: JSON.stringify({ name }) });
}

export function deleteCategory(id: string): Promise<{ message: string }> {
  return apiRequest(`/categories/${id}`, { method: 'DELETE' });
}
