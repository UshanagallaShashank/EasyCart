// Downloads the given stores as a CSV file for spreadsheets.
import { download_csv } from '@/lib/download-csv';
import type { AdminTenant } from '../types/admin-types';

export function export_tenants_csv(tenants: AdminTenant[]): void {
  const header = ['Store', 'Link', 'Status', 'Published', 'Owner', 'Owner email', 'Customers', 'Revenue', 'Created'];
  const rows = tenants.map((t) => [
    t.name,
    `/${t.slug}`,
    t.status,
    t.is_published ? 'yes' : 'no',
    t.owner_username ?? '',
    t.owner_email ?? '',
    t.customer_count ?? 0,
    t.revenue ?? 0,
    new Date(t.created_at).toISOString().slice(0, 10)
  ]);
  download_csv(`easycart-stores-${new Date().toISOString().slice(0, 10)}.csv`, header, rows);
}
