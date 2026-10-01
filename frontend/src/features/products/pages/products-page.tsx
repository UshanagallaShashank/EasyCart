// Products catalog page with fixed header action and scrollable inventory table
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ProductFormDialog } from '../components/product-form-dialog';
import { ProductTable } from '../components/product-table';

export function ProductsPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <PageHeader title="Products" description="Manage your store inventory, pricing, and stock levels.">
        <ProductFormDialog trigger={
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0077C8] hover:bg-[#0064AA] hover:-translate-y-0.5 hover:shadow-md hover:shadow-sky-500/20 active:translate-y-0 text-white text-xs font-semibold shadow-xs transition-all duration-200">
            <Plus className="w-3.5 h-3.5" />
            <span>New product</span>
          </button>
        } />
      </PageHeader>
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="md:rounded-2xl md:border md:border-slate-200/80 md:bg-white md:p-5 md:shadow-xs hover-card-glow md:overflow-hidden">
            <ProductTable />
          </div>
        </div>
      </div>
    </div>
  );
}
