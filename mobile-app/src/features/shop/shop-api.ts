// Store, catalog and order calls for the customer side.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { findInCachedLists } from '@/lib/instant';
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
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['products', 'public', slug, id],
    queryFn: async () => (await api<{ product: Product }>(`/stores/${slug}/products/${id}`)).product,
    // Shown at once from the product list already on the phone; the full product replaces it when it arrives.
    placeholderData: () => findInCachedLists<Product>(queryClient, ['products', 'public', slug], id)
  });
}

export function useCategories(slug: string) {
  return useQuery({ queryKey: ['storefront', slug, 'categories'], queryFn: async () => (await api<{ categories: Category[] }>(`/stores/${slug}/categories`)).categories });
}

export function useMyOrders() {
  return useQuery({ queryKey: ['my-orders'], queryFn: async () => (await api<{ orders: Order[] }>('/my-orders')).orders });
}

export function useMyOrder(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['my-orders', id],
    queryFn: async () => (await api<{ order: Order }>(`/my-orders/${id}`)).order,
    placeholderData: () => findInCachedLists<Order>(queryClient, ['my-orders'], id)
  });
}

export function useMyDelivery(id: string, enabled: boolean) {
  return useQuery({ queryKey: ['my-orders', id, 'delivery'], queryFn: async () => (await api<{ delivery: CustomerOrderDelivery }>(`/my-orders/${id}/delivery`)).delivery, enabled });
}

// What the server says about optional features, such as online payment. The server decides; no address or build setting does.
export interface AppConfig {
  online_payments: boolean;
  payment_provider: 'mock' | 'razorpay' | null;
  razorpay_key_id: string | null;
}

export function useAppConfig() {
  return useQuery({ queryKey: ['config'], queryFn: () => api<AppConfig>('/config'), staleTime: 5 * 60_000, refetchInterval: false });
}

// What the server hands back when a payment is started.
export type StartedPayment =
  | { provider: 'mock'; amount: number; currency: string; reference: string }
  | { provider: 'razorpay'; key_id: string; razorpay_order_id: string; amount: number; currency: string };

export interface OrderRating {
  store_stars: number;
  delivery_stars: number | null;
  comment: string | null;
}

export function useOrderRating(orderId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['my-orders', orderId, 'rating'],
    queryFn: async () => (await api<{ rating: OrderRating | null }>(`/my-orders/${orderId}/rating`)).rating,
    enabled,
    retry: false
  });
}

export function useRateOrder(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rating: { store_stars: number; delivery_stars?: number; comment?: string }) => api(`/my-orders/${orderId}/rating`, { method: 'POST', body: rating }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-orders', orderId, 'rating'] })
  });
}

export interface NearbyShop {
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  address: string | null;
  delivery_fee: number;
  max_delivery_radius_km: number;
  latitude: number;
  longitude: number;
  distance_km: number;
  delivers_to_you: boolean;
}

export function useNearbyShops(point: { latitude: number; longitude: number } | null) {
  return useQuery({
    queryKey: ['nearby-shops', point?.latitude.toFixed(3), point?.longitude.toFixed(3)],
    queryFn: async () => (await api<{ stores: NearbyShop[] }>(`/stores/nearby?lat=${point!.latitude}&lng=${point!.longitude}`)).stores,
    enabled: point !== null
  });
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
