// Request shape for POST /stores/:slug/checkout, built from cart lines at submit time.
export interface CheckoutItem {
  product_id: string;
  variant_label?: string;
  quantity: number;
}

export interface CheckoutPayload {
  items: CheckoutItem[];
  payment_method: 'cash_on_delivery';
  fulfillment_method: 'pickup' | 'delivery';
  delivery_address?: string;
  /** The map pin of the delivery address, when the customer dropped one. */
  delivery_latitude?: number;
  delivery_longitude?: number;
  coupon_code?: string;
}
