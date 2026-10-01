// Variant selection, quantity stepper, and add-to-cart / buy-now buttons on the product page.
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantityStepper } from '@/components/quantity-stepper';
import { VariantPicker } from './variant-picker';
import { format_price } from '@/lib/format-price';
import { useProductPurchase } from '../hooks/use-product-purchase';
import type { Product } from '@/features/products/types/product-types';

export function ProductDetailActions({ product, slug }: { product: Product; slug: string }) {
  const navigate = useNavigate();
  const { variantLabel, select_variant, quantity, setQuantity, price, available, add_to_cart } = useProductPurchase(product);
  const soldOut = available !== undefined && available <= 0;

  function handle_buy_now() {
    add_to_cart();
    navigate(`/${slug}/cart`);
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="font-heading text-2xl font-semibold text-slate-900 tabular-nums sm:text-3xl">{format_price(price)}</p>
      {product.variants.length > 0 && <VariantPicker variants={product.variants} value={variantLabel} onChange={select_variant} />}
      <div className="flex items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} max={available} />
        <Button size="lg" disabled={soldOut} onClick={add_to_cart} className="h-11 min-w-0 flex-1 rounded-full bg-slate-900 text-base font-semibold text-white hover:bg-slate-800">
          <ShoppingBag className="size-5" /> {soldOut ? 'Sold out' : 'Add to cart'}
        </Button>
      </div>
      {!soldOut && (
        <Button size="lg" variant="outline" onClick={handle_buy_now} className="h-12 rounded-full text-base font-semibold">
          <Zap className="size-5 text-[#F58220]" /> Buy now
        </Button>
      )}
    </div>
  );
}
