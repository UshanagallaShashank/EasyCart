// Store registered customers page with a searchable customer list.
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { TenantCustomerTable } from '../components/tenant-customer-table';

export function CustomersPage() {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title="Customers" description="People who have signed up or ordered from your store." />
      <PageBody><TenantCustomerTable /></PageBody>
    </div>
  );
}
