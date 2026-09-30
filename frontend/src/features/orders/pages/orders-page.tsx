// Orders management page with fixed header and scrollable table view
import { PageHeader } from '@/components/page-header';
import { OrderTable } from '../components/order-table';

export function OrdersPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <PageHeader title="Orders" description="Track customer orders, update fulfillment statuses, and manage deliveries." />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 overflow-hidden">
            <OrderTable />
          </div>
        </div>
      </div>
    </div>
  );
}
