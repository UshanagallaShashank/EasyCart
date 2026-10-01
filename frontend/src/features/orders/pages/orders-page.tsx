// Orders management page: filter pills, search and a clickable order list.
import { PageHeader } from '@/components/page-header';
import { OrderTable } from '../components/order-table';

export function OrdersPage() {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title="Orders" description="Track customer orders, update fulfillment statuses, and manage deliveries." />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <OrderTable />
        </div>
      </div>
    </div>
  );
}
