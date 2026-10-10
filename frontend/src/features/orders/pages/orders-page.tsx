// Orders management page: filter pills, search and a clickable order list.
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { OrderTable } from '../components/order-table';

export function OrdersPage() {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title="Orders" description="Track orders, update their status, and manage deliveries." />
      <PageBody><OrderTable /></PageBody>
    </div>
  );
}
