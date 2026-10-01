// Grid of category cards showing how many products each holds, with confirmed delete.
import { toast } from 'sonner';
import { Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ApiError } from '@/shared/api/api-error';
import { useProducts } from '@/features/products/hooks/use-products';
import { useCategories } from '../hooks/use-categories';
import { useDeleteCategory } from '../hooks/use-delete-category';

export function CategoryList() {
  const { data: categories, isLoading } = useCategories();
  const { data: products } = useProducts();
  const remove = useDeleteCategory();

  function delete_category(id: string) {
    remove.mutate(id, { onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to delete category') });
  }

  if (isLoading) return <Skeleton className="h-32 w-full rounded-2xl" />;
  if (!categories?.length) return <EmptyState message="No categories yet. Categories help customers browse your store." />;

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((c) => {
        const count = products?.filter((p) => p.category_id === c.id).length;
        return (
          <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Tag className="size-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{c.name}</p>
              <p className="text-xs text-slate-500">{count === undefined ? '…' : `${count} ${count === 1 ? 'product' : 'products'}`}</p>
            </div>
            <ConfirmDialog
              title={`Delete "${c.name}"?`}
              description="Products in this category stay in your catalog but will no longer be grouped under it."
              onConfirm={() => delete_category(c.id)}
              trigger={<Button variant="ghost" size="icon" aria-label={`Delete ${c.name}`} className="text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 /></Button>}
            />
          </li>
        );
      })}
    </ul>
  );
}
