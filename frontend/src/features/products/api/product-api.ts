import { apiRequest } from '@/shared/api/api-client';
import type { Product, ProductPayload, ProductUpdatePayload, AdjustStockResponse } from '../types/product-types';

export function listProducts(): Promise<{ products: Product[] }> {
  return apiRequest('/products');
}

export function getProduct(id: string): Promise<{ product: Product }> {
  return apiRequest(`/products/${id}`);
}

export function createProduct(payload: ProductPayload): Promise<{ product: Product }> {
  return apiRequest('/products', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateProduct(id: string, payload: ProductUpdatePayload): Promise<{ product: Product }> {
  return apiRequest(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function deleteProduct(id: string): Promise<{ message: string }> {
  return apiRequest(`/products/${id}`, { method: 'DELETE' });
}

export function adjustStock(id: string, delta: number): Promise<AdjustStockResponse> {
  return apiRequest(`/products/${id}/adjust-stock`, { method: 'POST', body: JSON.stringify({ delta }) });
}
