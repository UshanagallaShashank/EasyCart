// Types mirroring the backend admin wire format exactly.
export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'pending' | 'rejected';
  created_at: string;
  is_published: boolean;
  owner_email: string | null;
  owner_username: string | null;
  customer_count?: number;
  revenue?: number;
}

export interface StoreRequest {
  id: string;
  name: string;
  slug: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  description: string | null;
  customer?: {
    id: string;
    username: string;
    email: string;
    phone_number: string;
  } | null;
}

export interface TenantDocument {
  id: string;
  title: string;
  file_name: string;
  url: string;
  type: 'pdf' | 'image' | string;
}

export interface AdminTenantDetail {
  tenant: Pick<AdminTenant, 'id' | 'name' | 'slug' | 'status' | 'created_at'>;
  store: { name: string; logo_url: string | null; banner_url: string | null; is_published: boolean; delivery_fee: number; promotion_banner_text: string | null } | null;
  owner: { username: string; email: string; phone_number: string } | null;
  business_address?: string | null;
  id_proof_url?: string | null;
  business_proof_url?: string | null;
  documents?: TenantDocument[];
  verification?: {
    business_address: string | null;
    id_proof_url: string | null;
    business_proof_url: string | null;
    documents: TenantDocument[];
  } | null;
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

export interface PlatformStats {
  totals: { stores: number; active_stores: number; owners: number; customers: number; admins: number; orders: number; pending_orders: number; gmv: number };
  daily_revenue: { date: string; revenue: number; orders: number }[];
  top_stores: { tenant_id: string; name: string; slug: string; revenue: number; orders: number }[];
}

export type PlatformRole = 'tenant_owner' | 'customer' | 'platform_admin';

export interface PlatformUser {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  role: PlatformRole;
  created_at: string;
  store: { id: string; name: string; slug: string } | null;
}

export interface AdminNotification {
  id: string;
  type: 'store_request' | 'store_suspended' | 'store_active' | string;
  title: string;
  message: string;
  link?: string;
  priority?: 'high' | 'medium' | 'low';
  is_read: boolean;
  created_at: string;
}
