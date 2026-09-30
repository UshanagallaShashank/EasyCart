// Product categories page with creation dialog and list view
import { PageHeader } from '@/components/page-header';
import { CreateCategoryDialog } from '../components/create-category-dialog';
import { CategoryList } from '../components/category-list';

export function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Categories" description="Organize your store catalogue into browseable product categories.">
        <CreateCategoryDialog />
      </PageHeader>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 overflow-hidden">
        <CategoryList />
      </div>
    </div>
  );
}
