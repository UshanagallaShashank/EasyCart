// Store, product and account shapes, matching the backend (same as the website).
export interface PublicStore {
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  delivery_fee: number;
  max_delivery_radius_km?: number;
  pincode?: string | null;
  address?: string | null;
  promotion_banner_text?: string | null;
}

export interface ProductVariant {
  label: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  images: string[];
  variants: ProductVariant[];
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export type Role = 'customer' | 'tenant_owner' | 'delivery_partner' | 'platform_admin';

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  role: Role;
}
