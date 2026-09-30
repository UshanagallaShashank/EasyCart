import { TenantCustomerTable } from '../components/tenant-customer-table';

export function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Customers</h1>
      <TenantCustomerTable />
    </div>
  );
}
