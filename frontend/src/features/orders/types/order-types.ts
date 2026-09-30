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
export type FulfillmentStatus = PickupFulfillmentStatus | DeliveryFulfillmentStatus;

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
  delivery_fee: number;
  fulfillment_status: FulfillmentStatus;
  assigned_to: string | null;
  coupon_code: string | null;
  discount_amount: number;
  created_at: string;
  updated_at: string;
}
