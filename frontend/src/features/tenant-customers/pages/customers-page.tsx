// Store registered customers page with fixed header and scrollable table view
import { PageHeader } from '@/components/page-header';
import { TenantCustomerTable } from '../components/tenant-customer-table';

export function CustomersPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <PageHeader title="Customers" description="View and manage customer profiles registered with your store." />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="md:rounded-2xl md:border md:border-slate-200/80 md:bg-white md:p-5 md:shadow-xs hover-card-glow md:overflow-hidden">
            <TenantCustomerTable />
          </div>
        </div>
      </div>
    </div>
  );
}
