// Variant selection, quantity controls, and cart submission on product detail page.
import { useState } from 'react';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/features/cart/cart-context';
import type { Product } from '@/features/products/types/product-types';

export function ProductDetailActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [variantLabel, setVariantLabel] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants.find((v) => v.label === variantLabel);
  const price = variant?.price ?? product.price;

  function handle_add_cart() {
    addItem({ product_id: product.id, name: product.name, price, quantity, variant_label: variantLabel, image: product.images[0] });
    toast.success(`Added ${product.name} to cart`);
  }

  return (
    <div className="flex flex-col gap-4">
      {product.variants.length > 0 && (
        <Select value={variantLabel} onValueChange={setVariantLabel}>
          <SelectTrigger className="w-56 bg-white"><SelectValue placeholder="Select variant" /></SelectTrigger>
          <SelectContent>{product.variants.map((v) => <SelectItem key={v.label} value={v.label}>{v.label} (Rs. {v.price.toFixed(2)})</SelectItem>)}</SelectContent>
        </Select>
      )}
      <div className="flex items-center gap-3">
        <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="w-20 rounded-md border border-slate-200 px-3 py-2 text-sm bg-white" />
        <Button onClick={handle_add_cart} className="bg-sky-600 hover:bg-sky-500 text-white font-semibold">
          <ShoppingCart className="mr-2 size-4" /> Add to cart
        </Button>
      </div>
    </div>
  );
}
