import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Store, Truck } from 'lucide-react';
import { SearchField } from '@/components/search-field';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { getOrderStatusTone, getPaymentStatusTone } from '@/lib/status-colors';
import { useOrders } from '../hooks/use-orders';
import { formatMoney, formatOrderDate, shortOrderId } from '../lib/order-rules';
import { OrderFilterTabs, type OrderFilter } from './order-filter-tabs';

export function OrderTable() {
  const { data: orders, isLoading } = useOrders();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [search, setSearch] = useState('');

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const allOrders = orders ?? [];
  const counts: Record<OrderFilter, number> = {
    all: allOrders.length,
    pending: allOrders.filter((o) => o.status === 'pending').length,
    confirmed: allOrders.filter((o) => o.status === 'confirmed').length,
    fulfilled: allOrders.filter((o) => o.status === 'fulfilled').length,
    cancelled: allOrders.filter((o) => o.status === 'cancelled').length
  };

  const searchText = search.trim().toLowerCase();
  const visibleOrders = allOrders
    .filter((order) => filter === 'all' || order.status === filter)
    .filter((order) => order.id.toLowerCase().includes(searchText));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <OrderFilterTabs value={filter} counts={counts} onChange={setFilter} />
        <SearchField value={search} onChange={setSearch} placeholder="Search order ID" />
      </div>

      {!visibleOrders.length ? (
        <EmptyState message={allOrders.length ? 'No orders match your filter.' : 'No orders yet.'} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead>Order</TableHead>
                <TableHead className="hidden sm:table-cell">Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Payment</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleOrders.map((order) => {
                const MethodIcon = order.fulfillment_method === 'delivery' ? Truck : Store;
                return (
                  <TableRow
                    key={order.id}
                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                    className="group cursor-pointer transition-colors hover:bg-sky-50/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                          <MethodIcon className="size-4" />
                        </span>
                        <span className="font-medium text-slate-800">{shortOrderId(order.id)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-slate-500 sm:table-cell">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                    <TableCell className="font-medium tabular-nums">{formatMoney(order.total)}</TableCell>
                    <TableCell><StatusBadge tone={getOrderStatusTone(order.status)} value={order.status} /></TableCell>
                    <TableCell className="hidden md:table-cell"><StatusBadge tone={getPaymentStatusTone(order.payment_status)} value={order.payment_status} /></TableCell>
                    <TableCell className="hidden text-slate-500 sm:table-cell">{formatOrderDate(order.created_at)}</TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-500" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
