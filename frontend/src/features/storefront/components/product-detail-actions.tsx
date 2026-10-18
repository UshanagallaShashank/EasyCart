import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShoppingBag, Zap, Truck, ShieldCheck, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/features/cart/cart-context';
import type { Product } from '@/features/products/types/product-types';

export function ProductDetailActions({ product, slug }: { product: Product; slug?: string }) {
  const { addItem, updateQuantity, lines } = useCart();
  const navigate = useNavigate();
  const [variantLabel, setVariantLabel] = useState<string | undefined>();

  const variant = product.variants.find((v) => v.label === variantLabel);
  const price = variant?.price ?? product.price;

  // Maximum stock available for product or selected variant
  const availableStock = variant ? (variant.stock ?? 0) : (product.stock_quantity ?? 0);

  // Existing quantity already in cart
  const existingInCart = lines.find(
    (l) => l.product_id === product.id && l.variant_label === variantLabel
  )?.quantity ?? 0;

  const [quantity, setQuantity] = useState(() => (existingInCart > 0 ? existingInCart : 1));

  // Sync quantity selector when opening detail page or changing variant
  useEffect(() => {
    if (existingInCart > 0) {
      setQuantity(existingInCart);
    } else {
      setQuantity(1);
    }
  }, [product.id, variantLabel, existingInCart]);

  function handleAddToCart() {
    if (availableStock <= 0) {
      toast.error('Item is out of stock');
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available in stock`);
      return;
    }

    if (existingInCart > 0) {
      updateQuantity(product.id, quantity, variantLabel);
      toast.success(`Updated ${product.name} quantity to ${quantity} in cart`);
    } else {
      addItem({
        product_id: product.id,
        name: product.name,
        price,
        quantity,
        variant_label: variantLabel,
        image: product.images[0],
        max_stock: availableStock
      });
      toast.success(`Added ${quantity} × ${product.name} to cart`);
    }
  }

  function handleBuyNow() {
    if (availableStock <= 0) {
      toast.error('Item is out of stock');
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available in stock`);
      return;
    }

    if (existingInCart > 0) {
      updateQuantity(product.id, quantity, variantLabel);
    } else {
      addItem({
        product_id: product.id,
        name: product.name,
        price,
        quantity,
        variant_label: variantLabel,
        image: product.images[0],
        max_stock: availableStock
      });
    }
    if (slug) {
      navigate(`/${slug}/cart`);
    }
  }

  const isOutOfStock = availableStock <= 0;

  return (
    <div className="flex flex-col gap-5">
      {product.variants.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Select Variant</label>
          <Select value={variantLabel} onValueChange={setVariantLabel}>
            <SelectTrigger className="w-full sm:w-64 bg-white rounded-2xl border-slate-200"><SelectValue placeholder="Choose option" /></SelectTrigger>
            <SelectContent className="rounded-2xl">{product.variants.map((v) => <SelectItem key={v.label} value={v.label}>{v.label} (Rs. {v.price.toFixed(2)})</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {/* Quantity Pill + Add to Cart Pill */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Quantity Controls Pill */}
        <div className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm shadow-2xs">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            className="flex size-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-8 text-center font-bold text-slate-900 text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => {
              if (quantity >= availableStock) {
                toast.error(`Only ${availableStock} items in stock`);
                return;
              }
              setQuantity((q) => Math.min(availableStock, q + 1));
            }}
            disabled={quantity >= availableStock || isOutOfStock}
            className="flex size-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        {/* Add to Cart / Update Cart Navy Pill */}
        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="h-11 rounded-full bg-[#0F172A] px-7 text-xs font-bold text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md shadow-slate-900/10 gap-2 cursor-pointer flex-1 sm:flex-none justify-center"
        >
          <ShoppingBag className="size-4" /> {isOutOfStock ? 'Out of stock' : existingInCart > 0 ? 'Update cart' : 'Add to cart'}
        </Button>
      </div>

      {/* Buy Now Outline Pill */}
      <Button
        type="button"
        variant="outline"
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        className="h-11 w-full rounded-full border border-slate-200 bg-slate-50/50 px-6 text-xs font-bold text-[#0F172A] hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed gap-2 cursor-pointer justify-center"
      >
        <Zap className="size-4 text-amber-500 fill-amber-500" /> {isOutOfStock ? 'Out of stock' : 'Buy now'}
      </Button>

      {/* Trust Perks Box */}
      <div className="mt-2 rounded-2xl border border-sky-100/80 bg-sky-50/50 p-4 space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-medium">
          <Truck className="size-4 text-sky-500" /> Delivery or in-store pickup at checkout
        </div>
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="size-4 text-sky-500" /> Secure checkout
        </div>
      </div>
    </div>
  );
}
