// Store, catalog and order calls for the customer side.
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category, Product, PublicStore } from '@/types/catalog';
import type { Order } from '@/types/order';
import type { CustomerOrderDelivery } from '@/types/delivery';

export function useStore(slug: string) {
  return useQuery({ queryKey: ['storefront', slug], queryFn: async () => (await api<{ store: PublicStore }>(`/stores/${slug}`)).store, retry: false });
}

export function useProducts(slug: string, search: string, categoryId: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (categoryId) params.set('category_id', categoryId);
  return useQuery({ queryKey: ['products', 'public', slug, search, categoryId], queryFn: async () => (await api<{ products: Product[] }>(`/stores/${slug}/products?${params}`)).products });
}

export function useProduct(slug: string, id: string) {
  return useQuery({ queryKey: ['products', 'public', slug, id], queryFn: async () => (await api<{ product: Product }>(`/stores/${slug}/products/${id}`)).product });
}

export function useCategories(slug: string) {
  return useQuery({ queryKey: ['storefront', slug, 'categories'], queryFn: async () => (await api<{ categories: Category[] }>(`/stores/${slug}/categories`)).categories });
}

export function useMyOrders() {
  return useQuery({ queryKey: ['my-orders'], queryFn: async () => (await api<{ orders: Order[] }>('/my-orders')).orders });
}

export function useMyOrder(id: string) {
  return useQuery({ queryKey: ['my-orders', id], queryFn: async () => (await api<{ order: Order }>(`/my-orders/${id}`)).order });
}

export function useMyDelivery(id: string, enabled: boolean) {
  return useQuery({ queryKey: ['my-orders', id, 'delivery'], queryFn: async () => (await api<{ delivery: CustomerOrderDelivery }>(`/my-orders/${id}/delivery`)).delivery, enabled });
}

export function useMyStores() {
  return useQuery({ queryKey: ['my-stores'], queryFn: async () => (await api<{ stores: { slug: string; name: string; logo_url: string | null }[] }>('/my-stores')).stores });
}

// Customer-facing words for order status.
export const ORDER_STATUS: Record<Order['status'], { label: string; tone: 'warning' | 'primary' | 'success' | 'danger' }> = {
  pending: { label: 'Placed', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'primary' },
  fulfilled: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' }
};
