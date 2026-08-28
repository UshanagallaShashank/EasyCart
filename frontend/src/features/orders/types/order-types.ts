// Types mirroring the backend order wire format exactly.
export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  variant_label?: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  customer_id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';
  payment_status: 'unpaid' | 'paid';
  payment_method: 'cash_on_delivery';
  created_at: string;
  updated_at: string;
}
