// Types mirroring the backend product wire format exactly.
export interface ProductVariant {
  label: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  sku: string;
  images: string[];
  variants: ProductVariant[];
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  sku: string;
  category_id?: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
  is_active?: boolean;
}

export type ProductUpdatePayload = Partial<ProductPayload>;

export interface AdjustStockResponse {
  product: Product;
  low_stock: boolean;
}
