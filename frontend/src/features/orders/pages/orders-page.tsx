// Orders management page with status monitoring and table view
import { PageHeader } from '@/components/page-header';
import { OrderTable } from '../components/order-table';

export function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Orders" description="Track customer orders, update fulfillment statuses, and manage deliveries." />
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 overflow-hidden">
        <OrderTable />
      </div>
    </div>
  );
}
