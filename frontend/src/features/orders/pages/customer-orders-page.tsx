import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/empty-state';
import { toast } from 'sonner';
import { useCustomerAuth } from '@/shared/customer-auth/customer-auth-context';
import type { Order } from '../types/order-types';
import { useMyOrders } from '../hooks/use-my-orders';
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
  const { logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<OrderFilter>('all');
  // Read the last visited store slug so we can offer a "Go to Store" link
  const lastSlug = sessionStorage.getItem('last_store_slug');

  const visibleOrders = (orders ?? []).filter((order) => matchesFilter(order, filter));

  function handleLogout() {
    logout();
    toast.success('Logged out successfully');
    navigate(lastSlug ? `/${lastSlug}` : '/customer/login');
  }

  const actions = (
    <div className="flex items-center gap-2">
      {lastSlug && (
        <Link
          to={`/${lastSlug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
        >
          <Home className="size-4" /> Go to Store
        </Link>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-slate-500 hover:text-red-600 hover:bg-red-50 gap-1.5 text-xs sm:text-sm cursor-pointer"
      >
        <LogOut className="size-4" /> Log out
      </Button>
    </div>
  );

  return (
    <CustomerPageShell title="My orders" description="Track, review or cancel your orders" actions={actions}>

      <div className="flex flex-col gap-5">
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
