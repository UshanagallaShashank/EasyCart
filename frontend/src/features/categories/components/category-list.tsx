import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCategories } from '../hooks/use-categories';
import { useDeleteCategory } from '../hooks/use-delete-category';
import { ApiError } from '@/shared/api/api-error';

export function CategoryList() {
  const { data: categories, isLoading } = useCategories();
  const remove = useDeleteCategory();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!categories?.length) return <p className="text-muted-foreground">No categories yet.</p>;

  return (
    <ul className="flex max-w-sm flex-col gap-2">
      {categories.map((category) => (
        <li key={category.id} className="flex items-center justify-between rounded-md border px-3 py-2">
          <span>{category.name}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              remove.mutate(category.id, {
                onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to delete category')
              })
            }
          >
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
