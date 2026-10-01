import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Store, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/empty-state';
import type { Order } from '../types/order-types';
import { useMyOrders } from '../hooks/use-my-orders';
import { useMyStoreRequest } from '@/features/customer-store-request/hooks/use-customer-store-request';
import { CustomerPageShell } from '../components/customer-page-shell';
import { CustomerOrderCard } from '../components/customer-order-card';

type OrderFilter = 'all' | 'active' | 'completed' | 'cancelled';

function matchesFilter(order: Order, filter: OrderFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'active') return order.status === 'pending' || order.status === 'confirmed';
  if (filter === 'completed') return order.status === 'fulfilled';
  return order.status === 'cancelled';
}

export function CustomerOrdersPage() {
  const { data: orders, isLoading } = useMyOrders();
  const { data: storeRequest } = useMyStoreRequest();
  const [filter, setFilter] = useState<OrderFilter>('all');
  // Read the last visited store slug so we can offer a "Go to Store" link
  const lastSlug = sessionStorage.getItem('last_store_slug');

  const visibleOrders = (orders ?? []).filter((order) => matchesFilter(order, filter));

  const pageActions = (
    <div className="flex items-center gap-3">
      <Link
        to="/customer/store-request"
        className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50/80 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition-colors shadow-2xs"
      >
        <Store className="size-3.5" />
        {storeRequest?.status === 'pending'
          ? 'Store request pending'
          : storeRequest?.status === 'active'
          ? 'My Store'
          : 'Open a store'}
      </Link>
      {lastSlug && (
        <Link
          to={`/${lastSlug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <Home className="size-4" /> Go to Store
        </Link>
      )}
    </div>
  );

  return (
    <CustomerPageShell title="My orders" description="Track, review or cancel your orders" actions={pageActions}>
      <div className="flex flex-col gap-5">
        {!storeRequest && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-linear-to-r from-sky-50 via-white to-sky-50/40 p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-xs">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Want to sell your own products on EasyCart?</p>
                <p className="text-xs text-slate-500">Submit a quick store creation request to the platform admin.</p>
              </div>
            </div>
            <Link
              to="/customer/store-request"
              className="shrink-0 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 transition-colors"
            >
              Request a Store
            </Link>
          </div>
        )}

        <Tabs value={filter} onValueChange={(value) => setFilter(value as OrderFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : !visibleOrders.length ? (
          <EmptyState message={filter === 'all' ? 'No orders yet.' : `No ${filter} orders.`} />
        ) : (
          <div className="flex flex-col gap-3">
            {visibleOrders.map((order) => (
              <CustomerOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </CustomerPageShell>
  );
}
