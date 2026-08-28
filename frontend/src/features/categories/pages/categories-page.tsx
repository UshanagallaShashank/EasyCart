import { CreateCategoryDialog } from '../components/create-category-dialog';
import { CategoryList } from '../components/category-list';

export function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Categories</h1>
        <CreateCategoryDialog />
      </div>
      <CategoryList />
    </div>
  );
}
