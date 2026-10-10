// Cart state shape and the hook components use to read/update it.
import { createContext, useContext } from 'react';
import type { CartLine } from './types/cart-types';

export interface CartState {
  lines: CartLine[];
  total: number;
  addItem(line: CartLine): void;
  removeItem(productId: string, variantLabel?: string): void;
  updateQuantity(productId: string, quantity: number, variantLabel?: string): void;
  clear(): void;
}

export const CartContext = createContext<CartState | null>(null);

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
