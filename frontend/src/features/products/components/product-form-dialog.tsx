import { useState, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useCreateProduct } from '../hooks/use-create-product';
import { useUpdateProduct } from '../hooks/use-update-product';
import { ApiError } from '@/shared/api/api-error';
import type { Product, ProductPayload } from '../types/product-types';

function toForm(product?: Product): ProductPayload {
  return {
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    sku: product?.sku ?? '',
    category_id: product?.category_id ?? undefined,
    stock_quantity: product?.stock_quantity ?? 0,
    low_stock_threshold: product?.low_stock_threshold ?? 5,
    is_active: product?.is_active ?? true
  };
}

export function ProductFormDialog({ product, trigger }: { product?: Product; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductPayload>(() => toForm(product));
  const { data: categories } = useCategories();
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const isEditing = Boolean(product);
  const isPending = create.isPending || update.isPending;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setForm(toForm(product));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const onSettled = {
      onSuccess: () => setOpen(false),
      onError: (err: unknown) => toast.error(err instanceof ApiError ? err.message : 'Failed to save product')
    };
    if (isEditing && product) {
      update.mutate({ id: product.id, payload: form }, onSettled);
    } else {
      create.mutate(form, onSettled);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit product' : 'New product'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-description">Description</Label>
              <Input id="p-description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-price">Price</Label>
              <Input id="p-price" type="number" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-sku">SKU</Label>
              <Input id="p-sku" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select value={form.category_id ?? 'none'} onValueChange={(v) => setForm((p) => ({ ...p, category_id: v === 'none' ? undefined : v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-stock">Stock quantity</Label>
              <Input id="p-stock" type="number" value={form.stock_quantity} onChange={(e) => setForm((p) => ({ ...p, stock_quantity: Number(e.target.value) }))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-threshold">Low stock threshold</Label>
              <Input id="p-threshold" type="number" value={form.low_stock_threshold} onChange={(e) => setForm((p) => ({ ...p, low_stock_threshold: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
