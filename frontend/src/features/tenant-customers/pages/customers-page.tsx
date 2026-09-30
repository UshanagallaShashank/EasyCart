// Store registered customers page with table view
import { PageHeader } from '@/components/page-header';
import { TenantCustomerTable } from '../components/tenant-customer-table';

export function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customers" description="View and manage customer profiles registered with your store." />
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 overflow-hidden">
        <TenantCustomerTable />
      </div>
    </div>
  );
}
