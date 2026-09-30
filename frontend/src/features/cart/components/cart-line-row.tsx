import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '../cart-context';
import type { CartLine } from '../types/cart-types';

export function CartLineRow({ line }: { line: CartLine }) {
  const { removeItem, updateQuantity } = useCart();

  return (
    <div className="flex items-center justify-between gap-4 border-b py-3">
      {line.image ? (
        <img src={line.image} alt={line.name} className="size-12 rounded-md object-cover" />
      ) : (
        <div className="bg-secondary flex size-12 items-center justify-center rounded-md">
          <Package className="text-muted-foreground size-5" />
        </div>
      )}
      <div className="flex-1">
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
      <p className="w-20 text-right tabular-nums">Rs. {(line.price * line.quantity).toFixed(2)}</p>
      <Button variant="ghost" size="sm" onClick={() => removeItem(line.product_id, line.variant_label)}>
        Remove
      </Button>
    </div>
  );
}
