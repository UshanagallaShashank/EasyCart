// Product categories page with a grid of category cards.
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { CreateCategoryDialog } from '../components/create-category-dialog';
import { CategoryList } from '../components/category-list';

export function CategoriesPage() {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title="Categories" description="Group products so customers can browse your store.">
        <CreateCategoryDialog />
      </PageHeader>
      <PageBody><CategoryList /></PageBody>
    </div>
  );
}
