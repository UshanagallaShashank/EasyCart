// Adjust-stock, edit, and delete (with confirmation) icon buttons for one product.
import { toast } from 'sonner';
import { Boxes, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ApiError } from '@/shared/api/api-error';
import { useDeleteProduct } from '../hooks/use-delete-product';
import { ProductFormDialog } from './product-form-dialog';
import { AdjustStockDialog } from './adjust-stock-dialog';
import type { Product } from '../types/product-types';

export function ProductRowActions({ product }: { product: Product }) {
  const remove = useDeleteProduct();

  function delete_product() {
    remove.mutate(product.id, {
      onSuccess: () => toast.success(`${product.name} deleted`),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to delete product')
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <AdjustStockDialog product={product} trigger={<Button variant="ghost" size="icon" aria-label="Adjust stock" title="Adjust stock"><Boxes /></Button>} />
      <ProductFormDialog product={product} trigger={<Button variant="ghost" size="icon" aria-label="Edit product" title="Edit"><Pencil /></Button>} />
      <ConfirmDialog
        title={`Delete ${product.name}?`}
        description="This removes the product from your catalog and storefront. This can't be undone."
        onConfirm={delete_product}
        trigger={<Button variant="ghost" size="icon" aria-label="Delete product" title="Delete" className="text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 /></Button>}
      />
    </div>
  );
}
