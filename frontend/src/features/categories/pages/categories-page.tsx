import { CreateCategoryDialog } from '../components/create-category-dialog';
import { CategoryList } from '../components/category-list';

export function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Categories</h1>
        <CreateCategoryDialog />
      </div>
      <CategoryList />
    </div>
  );
}
