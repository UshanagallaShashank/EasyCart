// Persists cart lines per store slug, so different stores' carts never mix.
import type { CartLine } from '../types/cart-types';

export function getCart(slug: string): CartLine[] {
  const raw = localStorage.getItem(`cart_${slug}`);
  return raw ? (JSON.parse(raw) as CartLine[]) : [];
}

export function setCart(slug: string, lines: CartLine[]): void {
  localStorage.setItem(`cart_${slug}`, JSON.stringify(lines));
}
