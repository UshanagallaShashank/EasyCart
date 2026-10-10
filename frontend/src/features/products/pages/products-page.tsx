// Products catalog page: header with "New product", then filters, search, and the inventory list.
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { ProductFormDialog } from '../components/product-form-dialog';
import { ProductList } from '../components/product-list';

export function ProductsPage() {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title="Products" description="Manage your catalog, pricing, and stock levels.">
        <ProductFormDialog trigger={<Button size="lg"><Plus /> New product</Button>} />
      </PageHeader>
      <PageBody><ProductList /></PageBody>
    </div>
  );
}
