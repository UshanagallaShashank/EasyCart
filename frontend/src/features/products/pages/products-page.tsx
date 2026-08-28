import { Button } from '@/components/ui/button';
import { ProductFormDialog } from '../components/product-form-dialog';
import { ProductTable } from '../components/product-table';

export function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Products</h1>
        <ProductFormDialog trigger={<Button>New product</Button>} />
      </div>
      <ProductTable />
    </div>
  );
}
