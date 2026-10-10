import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Store, Sparkles, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/empty-state';
import type { Order } from '../types/order-types';
import { useMyOrders } from '../hooks/use-my-orders';
import { useMyStoreRequest } from '@/features/customer-store-request/hooks/use-customer-store-request';
import { customerStoreRequestPath, getLastStoreSlug } from '@/features/storefront/lib/customer-paths';
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
  const { slug: routeSlug } = useParams<{ slug: string }>();
  // Link to the store request page inside the storefront (with its menus) whenever we know which store.
  const requestSlug = routeSlug ?? getLastStoreSlug();
  const storeRequestPath = requestSlug ? customerStoreRequestPath(requestSlug) : '/';
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  // Sort orders descending by creation date so the latest order is always at the top
  const sortedOrders = [...(orders ?? [])].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Extract unique years from customer's orders
  const availableYears = Array.from(
    new Set(
      sortedOrders
        .map((order) => {
          const date = new Date(order.created_at);
          return isNaN(date.getTime()) ? null : date.getFullYear().toString();
        })
        .filter((y): y is string => y !== null)
    )
  ).sort((a, b) => b.localeCompare(a));

  // Filter orders by status and year
  const visibleOrders = sortedOrders.filter((order) => {
    const matchesStatus = matchesFilter(order, filter);
    const matchesYear = yearFilter === 'all' || new Date(order.created_at).getFullYear().toString() === yearFilter;
    return matchesStatus && matchesYear;
  });

  const storeRequestLabel =
    storeRequest?.status === 'pending' ? 'Store request pending' : storeRequest?.status === 'active' ? 'My Store' : 'Open a store';

  const storeRequestLink = (
    <Link
      to={storeRequestPath}
      className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50/80 px-3 py-1.5 text-xs font-semibold text-sky-700 shadow-2xs transition-colors hover:bg-sky-100"
    >
      <Store className="size-3.5" />
      {storeRequestLabel}
    </Link>
  );

  return (
    <CustomerPageShell title="My Orders" description="Track, review or cancel your store orders" actions={storeRequestLink}>

      <div className="flex flex-col gap-5">
        {!storeRequest && (
          <div className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-linear-to-r from-sky-50 via-white to-sky-50/40 p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-xs">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Want to sell your own products on EasyCart?</p>
                <p className="text-xs text-slate-500">Submit a quick store creation request to the platform admin.</p>
              </div>
            </div>
            <Link
              to={storeRequestPath}
              className="shrink-0 rounded-xl bg-sky-600 px-3.5 py-1.5 text-center text-xs font-semibold text-white shadow-xs transition-colors hover:bg-sky-700"
            >
              Request a Store
            </Link>
          </div>
        )}

        {/* Filter Controls: Status Tabs & Year Filter Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 p-2.5 rounded-2xl border border-slate-100">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as OrderFilter)}>
            <TabsList className="bg-white/80">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Year Filter Option */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-sky-500" /> Filter Year:
              </span>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-32 h-9 text-xs font-bold rounded-xl bg-white border-slate-200 shadow-2xs">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Dedicated Scrollable Container for Orders */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : !visibleOrders.length ? (
          <EmptyState message={filter === 'all' && yearFilter === 'all' ? 'No orders yet.' : `No matching orders found.`} />
        ) : (
          <div className="max-h-[calc(100vh-320px)] min-h-[300px] overflow-y-auto pr-1.5 space-y-3 rounded-2xl scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
            {visibleOrders.map((order) => (
              <CustomerOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </CustomerPageShell>
  );
}
