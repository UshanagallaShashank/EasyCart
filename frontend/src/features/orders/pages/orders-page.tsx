import { OrderTable } from '../components/order-table';

export function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Orders</h1>
      <OrderTable />
    </div>
  );
}
