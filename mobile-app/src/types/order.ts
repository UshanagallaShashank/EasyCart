// Types mirroring the backend order wire format exactly.
export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  variant_label?: string;
}

export type PickupFulfillmentStatus = 'not_started' | 'ready_for_pickup' | 'picked_up';
export type DeliveryFulfillmentStatus = 'not_started' | 'dispatched' | 'delivered';
// Set by the rider flow (request a rider -> offered/accepted -> picked up), never chosen by hand.
export type RiderFulfillmentStatus = 'ready_for_delivery' | 'rider_assigned';
export type FulfillmentStatus = PickupFulfillmentStatus | DeliveryFulfillmentStatus | RiderFulfillmentStatus;

export interface Order {
  id: string;
  tenant_id: string;
  customer_id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';
  payment_status: 'unpaid' | 'paid';
  payment_method: 'cash_on_delivery';
  fulfillment_method: 'pickup' | 'delivery';
  delivery_address: string | null;
  /** The map pin the customer dropped for a delivery address, when there is one. */
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  delivery_fee: number;
  fulfillment_status: FulfillmentStatus;
  assigned_to: string | null;
  rider_id?: string | null;
  rider_offer_status?: 'offered' | 'accepted' | null;
  // Only in the customer's own view, while the order is on its way.
  delivery_code?: string | null;
  // Only in the store's view.
  pickup_code?: string | null;
  delivered_at?: string | null;
  cash_collected?: number | null;
  coupon_code: string | null;
  discount_amount: number;
  created_at: string;
  updated_at: string;
}
