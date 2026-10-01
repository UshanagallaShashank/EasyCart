import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '../cart-context';
import type { CartLine } from '../types/cart-types';

export function CartLineRow({ line }: { line: CartLine }) {
  const { removeItem, updateQuantity } = useCart();

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b py-3 sm:flex-nowrap sm:gap-4">
      {line.image ? (
        <img src={line.image} alt={line.name} className="size-12 rounded-md object-cover" />
      ) : (
        <div className="bg-secondary flex size-12 items-center justify-center rounded-md">
          <Package className="text-muted-foreground size-5" />
        </div>
      )}
      <div className="min-w-0 flex-1 basis-[calc(100%-4rem)] sm:basis-auto">
        <p className="font-medium">{line.name}</p>
        {line.variant_label && <p className="text-muted-foreground text-sm">{line.variant_label}</p>}
      </div>
      <Input
        type="number"
        min={1}
        value={line.quantity}
        onChange={(e) => updateQuantity(line.product_id, Number(e.target.value), line.variant_label)}
        className="w-20"
      />
      <p className="ml-auto w-24 text-right tabular-nums sm:ml-0 sm:w-20">Rs. {(line.price * line.quantity).toFixed(2)}</p>
      <Button variant="ghost" size="sm" onClick={() => removeItem(line.product_id, line.variant_label)}>
        Remove
      </Button>
    </div>
  );
}
