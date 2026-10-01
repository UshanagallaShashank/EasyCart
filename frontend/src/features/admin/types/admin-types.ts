// Types mirroring the backend admin wire format exactly.
export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  created_at: string;
  is_published: boolean;
  owner_email: string | null;
  owner_username: string | null;
}

export interface AdminTenantDetail {
  tenant: Pick<AdminTenant, 'id' | 'name' | 'slug' | 'status' | 'created_at'>;
  store: { name: string; logo_url: string | null; banner_url: string | null; is_published: boolean; delivery_fee: number; promotion_banner_text: string | null } | null;
  owner: { username: string; email: string; phone_number: string } | null;
  activity: {
    product_count: number;
    active_product_count: number;
    low_stock_count: number;
    order_count: number;
    pending_order_count: number;
    revenue: number;
    customer_count: number;
    last_order_at: string | null;
    recent_orders: { id: string; total: number; status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'; payment_status: 'unpaid' | 'paid'; created_at: string }[];
  };
}
