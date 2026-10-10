export interface Coupon {
  id: string;
  tenant_id: string;
  code: string;
  discount_type: 'flat' | 'percent';
  discount_value: number;
  is_active: boolean;
  expires_at?: string | null;
  status?: 'active' | 'inactive' | 'expired';
  is_expired?: boolean;
  created_at: string;
}

export interface CouponPayload {
  code: string;
  discount_type: 'flat' | 'percent';
  discount_value: number;
  expires_at?: string | null;
}
