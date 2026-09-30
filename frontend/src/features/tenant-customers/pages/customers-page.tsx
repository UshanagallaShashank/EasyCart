// Store registered customers page with fixed header and scrollable table view
import { PageHeader } from '@/components/page-header';
import { TenantCustomerTable } from '../components/tenant-customer-table';

export function CustomersPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <PageHeader title="Customers" description="View and manage customer profiles registered with your store." />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 overflow-hidden">
            <TenantCustomerTable />
          </div>
        </div>
      </div>
    </div>
  );
}
