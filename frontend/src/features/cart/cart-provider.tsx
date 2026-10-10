import { useState, useEffect, type ReactNode } from 'react';
import { CartContext } from './cart-context';
import { getCart, setCart } from './lib/cart-storage';
import type { CartLine } from './types/cart-types';

function sameLine(a: CartLine, productId: string, variantLabel?: string) {
  return a.product_id === productId && a.variant_label === variantLabel;
}

export function CartProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => getCart(slug));

  useEffect(() => {
    setLines(getCart(slug));
  }, [slug]);

  useEffect(() => {
    setCart(slug, lines);
  }, [slug, lines]);

  function addItem(line: CartLine) {
    setLines((prev) => {
      const existing = prev.find((l) => sameLine(l, line.product_id, line.variant_label));
      const maxStock = line.max_stock ?? existing?.max_stock;
      if (existing) {
        const rawQty = existing.quantity + line.quantity;
        const newQty = maxStock !== undefined ? Math.min(maxStock, rawQty) : rawQty;
        return prev.map((l) => (l === existing ? { ...l, quantity: newQty, max_stock: maxStock } : l));
      }
      const newQty = line.max_stock !== undefined ? Math.min(line.max_stock, line.quantity) : line.quantity;
      return [...prev, { ...line, quantity: newQty }];
    });
  }

  function removeItem(productId: string, variantLabel?: string) {
    setLines((prev) => prev.filter((l) => !sameLine(l, productId, variantLabel)));
  }

  function updateQuantity(productId: string, quantity: number, variantLabel?: string) {
    setLines((prev) =>
      prev.map((l) => {
        if (!sameLine(l, productId, variantLabel)) return l;
        const maxStock = l.max_stock;
        const newQty = maxStock !== undefined ? Math.min(maxStock, Math.max(1, quantity)) : Math.max(1, quantity);
        return { ...l, quantity: newQty };
      })
    );
  }

  function clear() {
    setLines([]);
  }

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  return (
    <CartContext.Provider value={{ lines, total, addItem, removeItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}
