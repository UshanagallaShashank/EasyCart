// Dashboard home: greeting, headline numbers, 7-day sales chart, recent orders and low-stock alerts.
import { IndianRupee, ShoppingBag, Clock, Users } from 'lucide-react';
import { StaggerList, StaggerItem } from '@/components/motion/reveal';
import { PageBody } from '@/components/page-body';
import { useAuth } from '@/shared/auth/auth-context';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { useProducts } from '@/features/products/hooks/use-products';
import { useTenantCustomers } from '@/features/tenant-customers/hooks/use-tenant-customers';
import { StatCard } from '../components/stat-card';
import { SalesChart } from '../components/sales-chart';
import { RecentOrdersCard } from '../components/recent-orders-card';
import { LowStockCard } from '../components/low-stock-card';
import { QuickActions } from '../components/quick-actions';
import { getGreeting, getLowStockProducts, getPendingCount, getRevenue } from '../lib/dashboard-stats';

export function OverviewPage() {
  const { user } = useAuth();
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: customers } = useTenantCustomers();

  return (
    <PageBody>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{getGreeting()}, {user?.username}</h1>
          <p className="mt-1 text-sm text-slate-500">Here's how your store is doing.</p>
        </div>
        <QuickActions />
      </div>
      <StaggerList className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StaggerItem><StatCard label="Revenue" value={orders && getRevenue(orders)} decimals={0} prefix="Rs. " icon={IndianRupee} tone="bg-emerald-50 text-emerald-600" hint="Excludes cancelled" /></StaggerItem>
        <StaggerItem><StatCard label="Orders" value={orders?.length} icon={ShoppingBag} tone="bg-sky-50 text-sky-600" hint="All time" /></StaggerItem>
        <StaggerItem><StatCard label="Need action" value={orders && getPendingCount(orders)} icon={Clock} tone="bg-amber-50 text-amber-600" hint="Pending orders" /></StaggerItem>
        <StaggerItem><StatCard label="Customers" value={customers?.length} icon={Users} tone="bg-violet-50 text-violet-600" hint="Registered" /></StaggerItem>
      </StaggerList>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><SalesChart orders={orders} /></div>
        <LowStockCard products={products ? getLowStockProducts(products) : []} />
      </div>
      <RecentOrdersCard orders={orders} />
    </PageBody>
  );
}
