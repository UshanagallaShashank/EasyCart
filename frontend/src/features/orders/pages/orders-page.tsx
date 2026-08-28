import { OrderTable } from '../components/order-table';

export function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-medium">Orders</h1>
      <OrderTable />
    </div>
  );
}
