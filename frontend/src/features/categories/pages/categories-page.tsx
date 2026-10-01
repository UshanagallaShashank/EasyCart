// Product categories page with fixed header and scrollable list view
import { PageHeader } from '@/components/page-header';
import { CreateCategoryDialog } from '../components/create-category-dialog';
import { CategoryList } from '../components/category-list';

export function CategoriesPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <PageHeader title="Categories" description="Organize your store catalogue into browseable product categories.">
        <CreateCategoryDialog />
      </PageHeader>
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 overflow-hidden">
            <CategoryList />
          </div>
        </div>
      </div>
    </div>
  );
}
