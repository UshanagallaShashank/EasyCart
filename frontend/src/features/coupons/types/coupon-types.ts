// Types mirroring the backend coupon wire format exactly.
export interface Coupon {
  id: string;
  tenant_id: string;
  code: string;
  discount_type: 'flat' | 'percent';
  discount_value: number;
  is_active: boolean;
  created_at: string;
}

export interface CouponPayload {
  code: string;
  discount_type: 'flat' | 'percent';
  discount_value: number;
}
