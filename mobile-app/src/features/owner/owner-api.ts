// Store owner data and actions.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Order } from '@/types/order';
import type { Product } from '@/types/catalog';
import type { StoreDeliveryRow, StoreOrderDelivery, StoreSettlementSummary, NearbyRider } from '@/types/delivery';

export const useOwnStore = () => useQuery({ queryKey: ['store'], queryFn: async () => (await api<{ store: { name: string; slug: string; is_published: boolean; delivery_fee: number; latitude?: number | null } }>('/stores/me')).store });
export const useOrders = () => useQuery({ queryKey: ['orders'], queryFn: async () => (await api<{ orders: Order[] }>('/orders')).orders });
export const useOrder = (id: string) => useQuery({ queryKey: ['orders', id], queryFn: async () => (await api<{ order: Order }>(`/orders/${id}`)).order });
export const useOrderDelivery = (id: string, enabled: boolean) => useQuery({ queryKey: ['orders', id, 'delivery'], queryFn: async () => (await api<{ delivery: StoreOrderDelivery }>(`/orders/${id}/delivery`)).delivery, enabled });
export const useStoreDeliveries = () => useQuery({ queryKey: ['store-deliveries'], queryFn: async () => (await api<{ deliveries: StoreDeliveryRow[] }>('/delivery/orders')).deliveries });
export const useStoreSettlements = () => useQuery({ queryKey: ['store-settlements'], queryFn: () => api<StoreSettlementSummary>('/delivery/settlements') });
export const useRidersNearby = () => useQuery({ queryKey: ['store-deliveries', 'riders'], queryFn: () => api<{ riders: NearbyRider[] }>('/delivery/riders-nearby') });
export const useOwnerProducts = () => useQuery({ queryKey: ['products', 'own'], queryFn: async () => (await api<{ products: Product[] }>('/products')).products });

// Any owner action refreshes orders, deliveries, settlements and products.
export function useOwnerAction<T, R>(run: (input: T) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: () => { for (const key of [['orders'], ['store-deliveries'], ['store-settlements'], ['products']]) void queryClient.invalidateQueries({ queryKey: key }); }
  });
}

export const ownerCalls = {
  setStatus: ({ id, status }: { id: string; status: Order['status'] }) => api(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  setFulfillment: ({ id, fulfillment_status }: { id: string; fulfillment_status: string }) => api(`/orders/${id}/fulfillment-status`, { method: 'PATCH', body: { fulfillment_status } }),
  setPayment: ({ id, payment_status }: { id: string; payment_status: 'paid' | 'unpaid' }) => api(`/orders/${id}/payment-status`, { method: 'PATCH', body: { payment_status } }),
  delivery: ({ id, action }: { id: string; action: 'request-rider' | 'cancel-rider' | 'new-pickup-code' | 'new-delivery-code' }) => api(`/orders/${id}/delivery/${action}`, { method: 'POST' }),
  settle: ({ id, method }: { id: string; method: 'cash' | 'upi' }) => api(`/orders/${id}/delivery/settle`, { method: 'POST', body: { method } }),
  adjustStock: ({ id, delta }: { id: string; delta: number }) => api(`/products/${id}/adjust-stock`, { method: 'POST', body: { delta } })
};

// Owner-facing words for where an order is.
export function orderStage(order: Order): { label: string; tone: 'warning' | 'primary' | 'success' | 'danger' | 'neutral' } {
  if (order.status === 'cancelled') return { label: 'Cancelled', tone: 'danger' };
  if (order.status === 'fulfilled' || order.fulfillment_status === 'delivered' || order.fulfillment_status === 'picked_up') return { label: 'Completed', tone: 'success' };
  if (order.fulfillment_status === 'dispatched') return { label: 'Out for delivery', tone: 'warning' };
  if (order.fulfillment_status === 'rider_assigned') return { label: order.rider_offer_status === 'accepted' ? 'Rider picking up' : 'Offered to rider', tone: 'warning' };
  if (order.fulfillment_status === 'ready_for_delivery') return { label: 'Finding rider', tone: 'warning' };
  if (order.fulfillment_status === 'ready_for_pickup') return { label: 'Ready for pickup', tone: 'primary' };
  return order.status === 'pending' ? { label: 'New', tone: 'warning' } : { label: 'Preparing', tone: 'primary' };
}
