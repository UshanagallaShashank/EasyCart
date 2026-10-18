// Builds the new-store setup checklist from data the owner already has.
import type { Store } from '@/features/stores/types/store-types';

export interface SetupStep {
  key: string;
  label: string;
  hint: string;
  to: string;
  done: boolean;
}

interface SetupInputs {
  store?: Store;
  productCount?: number;
  categoryCount?: number;
  orderCount?: number;
}

export function get_setup_steps({ store, productCount = 0, categoryCount = 0, orderCount = 0 }: SetupInputs): SetupStep[] {
  return [
    { key: 'brand', label: 'Add your logo', hint: 'Customers recognise you faster', to: '/dashboard/store', done: Boolean(store?.logo_url) },
    { key: 'category', label: 'Create a category', hint: 'Helps customers browse', to: '/dashboard/categories', done: categoryCount > 0 },
    { key: 'product', label: 'Add your first product', hint: 'Name, price, photo and stock', to: '/dashboard/products', done: productCount > 0 },
    { key: 'publish', label: 'Publish your store', hint: 'Make your shop visible online', to: '/dashboard/store', done: Boolean(store?.is_published) },
    { key: 'order', label: 'Get your first order', hint: 'Share your store link with customers', to: '/dashboard/orders', done: orderCount > 0 }
  ];
}
