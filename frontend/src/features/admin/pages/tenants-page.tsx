import { TenantTable } from '../components/tenant-table';

export function TenantsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Tenants</h1>
      <TenantTable />
    </div>
  );
}
