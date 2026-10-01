// Holds variant/quantity selection for a product and adds the chosen line to the cart.
import { useState } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/features/cart/cart-context';
import type { Product } from '@/features/products/types/product-types';

export function useProductPurchase(product: Product) {
  const { addItem } = useCart();
  const [variantLabel, setVariantLabel] = useState(() => product.variants.find((v) => v.stock > 0)?.label);
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants.find((v) => v.label === variantLabel);
  const available = variant ? variant.stock : product.stock_quantity;

  function add_to_cart() {
    addItem({ product_id: product.id, name: product.name, price: variant?.price ?? product.price, quantity, variant_label: variantLabel, image: product.images[0] });
    toast.success(`${product.name} added to cart`);
  }

  function select_variant(label: string) {
    setVariantLabel(label);
    setQuantity(1);
  }

  return { variantLabel, select_variant, quantity, setQuantity, price: variant?.price ?? product.price, available, add_to_cart };
}
