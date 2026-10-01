// One-tap add-to-cart button shown on product cards for simple (variant-free) products.
import type { MouseEvent } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useCart } from '@/features/cart/cart-context';
import type { Product } from '@/features/products/types/product-types';

export function QuickAddButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  function handle_quick_add(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    addItem({ product_id: product.id, name: product.name, price: product.price, quantity: 1, image: product.images[0] });
    toast.success(`${product.name} added to cart`);
  }

  return (
    <button
      type="button"
      onClick={handle_quick_add}
      aria-label={`Add ${product.name} to cart`}
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition-all hover:scale-105 hover:bg-sky-600 active:scale-95 focus-visible:ring-3 focus-visible:ring-sky-500/40 focus-visible:outline-none"
    >
      <Plus className="size-4" />
    </button>
  );
}
