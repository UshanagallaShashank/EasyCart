// Products catalog page with header action and inventory table
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ProductFormDialog } from '../components/product-form-dialog';
import { ProductTable } from '../components/product-table';

export function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Products" description="Manage your store inventory, pricing, and stock levels.">
        <ProductFormDialog trigger={
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0077C8] hover:bg-[#0064AA] hover:-translate-y-0.5 hover:shadow-md hover:shadow-sky-500/20 active:translate-y-0 text-white text-xs font-semibold shadow-xs transition-all duration-200">
            <Plus className="w-3.5 h-3.5" />
            <span>New product</span>
          </button>
        } />
      </PageHeader>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 overflow-hidden">
        <ProductTable />
      </div>
    </div>
  );
}
