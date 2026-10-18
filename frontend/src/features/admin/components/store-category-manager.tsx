import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Tags, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { fetchAdminStoreCategories, addAdminStoreCategory, removeAdminStoreCategory } from '../api/admin-api';

const DEFAULT_CATEGORIES = [
  'Others',
  'Grocery & Supermarket',
  'Fashion & Apparel',
  'Electronics & Gadgets',
  'Health & Beauty',
  'Home & Living / Furniture',
  'Jewelry & Accessories',
  'Books & Stationery',
  'Artisanal & Handicrafts',
  'Restaurant & Food',
  'Bakery',
  'General Retail'
];

export function StoreCategoryManager() {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin_store_categories'],
    queryFn: fetchAdminStoreCategories
  });

  const fetchedCategories = data?.categories && data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES;
  const othersItem = fetchedCategories.find(c => c.toLowerCase().trim() === 'others' || c.toLowerCase().trim() === 'other') || 'Others';
  const restCategories = fetchedCategories.filter(c => c !== othersItem && !c.toLowerCase().trim().includes('other'));

  const categories = [othersItem, ...restCategories];

  const addMutation = useMutation({
    mutationFn: (name: string) => addAdminStoreCategory(name),
    onSuccess: (res) => {
      queryClient.setQueryData(['admin_store_categories'], { categories: res.categories });
      queryClient.invalidateQueries({ queryKey: ['public_store_categories'] });
      toast.success(`Category "${newCategory.trim()}" added successfully!`);
      setNewCategory('');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add category');
    }
  });

  const removeMutation = useMutation({
    mutationFn: (name: string) => removeAdminStoreCategory(name),
    onSuccess: (res, name) => {
      queryClient.setQueryData(['admin_store_categories'], { categories: res.categories });
      queryClient.invalidateQueries({ queryKey: ['public_store_categories'] });
      toast.success(`Category "${name}" removed`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove category');
    }
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) {
      toast.error('Please enter a category name');
      return;
    }
    addMutation.mutate(trimmed);
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
            <Tags className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Manage Store Categories</h2>
            <p className="text-xs text-slate-500">Add or remove store categories available in applicant registration</p>
          </div>
        </div>
        <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 border border-sky-200/60">
          {categories.length} Active Categories
        </span>
      </div>

      {/* Add New Category Form */}
      <form onSubmit={handleAdd} className="mt-4 flex items-center gap-2">
        <Input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="e.g. Pet Supplies & Toys..."
          className="h-9 min-w-0 flex-1 rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-sky-500"
        />
        <Button
          type="submit"
          disabled={addMutation.isPending || !newCategory.trim()}
          className="h-9 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs gap-1.5 px-4 cursor-pointer shrink-0"
        >
          {addMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          Add Category
        </Button>
      </form>

      {/* Active Categories List */}
      <div className="mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-xs text-slate-400">
            <Loader2 className="size-4 animate-spin mr-2 text-sky-600" /> Loading store categories...
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isPermanent = cat.toLowerCase().includes('other');
              return (
                <div
                  key={cat}
                  className="group flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:border-sky-300 hover:bg-sky-50/50"
                >
                  <span>{cat}</span>
                  {isPermanent ? (
                    <span className="text-[10px] text-slate-400 font-normal select-none bg-slate-200/60 px-1.5 py-0.5 rounded-md" title="Permanent category">
                      Permanent
                    </span>
                  ) : (
                    categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(cat)}
                        disabled={removeMutation.isPending}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded-md hover:bg-rose-100/60 cursor-pointer"
                        title={`Remove ${cat}`}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold flex items-center gap-2">
              <AlertTriangle className="size-5 text-rose-600" /> Delete Category
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs sm:text-sm mt-1.5">
              Are you sure you want to delete <strong className="text-slate-900 font-semibold">"{categoryToDelete}"</strong>?
              This category will no longer be available in applicant store registration.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 justify-end sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={removeMutation.isPending}
              onClick={() => {
                if (categoryToDelete) {
                  removeMutation.mutate(categoryToDelete);
                  setCategoryToDelete(null);
                }
              }}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
            >
              {removeMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
