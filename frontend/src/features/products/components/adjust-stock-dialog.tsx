import { useState, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdjustStock } from '../hooks/use-adjust-stock';
import { ApiError } from '@/shared/api/api-error';
import type { Product } from '../types/product-types';

export function AdjustStockDialog({ product, trigger }: { product: Product; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState(0);
  const adjust = useAdjustStock();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    adjust.mutate(
      { id: product.id, delta },
      {
        onSuccess: (result) => {
          setOpen(false);
          setDelta(0);
          if (result.low_stock) toast.warning(`${product.name} is now low on stock`);
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to adjust stock')
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adjust stock for {product.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <Label htmlFor="delta">Change (use a negative number to remove stock)</Label>
            <Input id="delta" type="number" value={delta} onChange={(e) => setDelta(Number(e.target.value))} required />
            <p className="text-muted-foreground text-sm">Current: {product.stock_quantity} → New: {product.stock_quantity + delta}</p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={adjust.isPending}>
              {adjust.isPending ? 'Saving…' : 'Apply'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
