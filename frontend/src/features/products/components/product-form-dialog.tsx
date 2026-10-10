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
import { ProductImageField } from './product-image-field';
import { ApiError } from '@/shared/api/api-error';
import type { Product, ProductPayload } from '../types/product-types';

function toForm(product?: Product): ProductPayload {
  return {
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    sku: product?.sku ?? '',
    images: product?.images ?? [],
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
    const payload: ProductPayload = {
      ...form,
      sku: form.sku?.trim() || `SKU-${Date.now().toString(36).toUpperCase()}`
    };
    const onSettled = {
      onSuccess: () => setOpen(false),
      onError: (err: unknown) => toast.error(err instanceof ApiError ? err.message : 'Failed to save product')
    };
    if (isEditing && product) {
      update.mutate({ id: product.id, payload }, onSettled);
    } else {
      create.mutate(payload, onSettled);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] p-5 gap-3">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-1">
            <DialogTitle className="text-base font-bold">{isEditing ? 'Edit product' : 'New product'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-name" className="text-xs font-semibold">Name</Label>
              <Input id="p-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="h-9 text-xs" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">Category</Label>
              <Select value={form.category_id ?? 'none'} onValueChange={(v) => setForm((p) => ({ ...p, category_id: v === 'none' ? undefined : v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-price" className="text-xs font-semibold">Price (Rs.)</Label>
              <Input id="p-price" type="number" step="0.01" min={0} placeholder="0.00" value={form.price === 0 && !isEditing ? '' : form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value === '' ? 0 : Number(e.target.value) }))} required className="h-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-stock" className="text-xs font-semibold">Stock quantity</Label>
                <Input id="p-stock" type="number" min={0} placeholder="0" value={form.stock_quantity === 0 && !isEditing ? '' : form.stock_quantity} onChange={(e) => setForm((p) => ({ ...p, stock_quantity: e.target.value === '' ? 0 : Number(e.target.value) }))} className="h-9 text-xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-threshold" className="text-xs font-semibold">Low stock alert</Label>
                <Input id="p-threshold" type="number" min={0} placeholder="5" value={form.low_stock_threshold === 0 && !isEditing ? '' : form.low_stock_threshold} onChange={(e) => setForm((p) => ({ ...p, low_stock_threshold: e.target.value === '' ? 0 : Number(e.target.value) }))} className="h-9 text-xs" />
              </div>
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="p-description" className="text-xs font-semibold">Description</Label>
              <Input id="p-description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief product description" className="h-9 text-xs" />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <ProductImageField
                values={form.images ?? []}
                onChange={(urls) => setForm((p) => ({ ...p, images: urls }))}
              />
              <details className="text-[11px] text-muted-foreground mt-0.5">
                <summary className="cursor-pointer hover:text-foreground select-none">
                  SKU (optional): {form.sku || 'Auto-generated'}
                </summary>
                <div className="pt-1.5">
                  <Input
                    id="p-sku"
                    placeholder="Auto-generated if empty"
                    value={form.sku}
                    onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                    className="text-xs h-8"
                  />
                </div>
              </details>
            </div>
          </div>
          <DialogFooter className="mt-2 pt-2 border-t flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="bg-[#0077C8] hover:bg-[#0064AA] text-white">
              {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
