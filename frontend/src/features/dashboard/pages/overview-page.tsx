// Dashboard home: greeting, headline numbers, recent orders and low-stock alerts.
import { motion } from 'motion/react';
import { IndianRupee, ShoppingBag, Clock, Users } from 'lucide-react';
import { StaggerList, StaggerItem } from '@/components/motion/reveal';
import { useAuth } from '@/shared/auth/auth-context';
import { useOwnStore } from '@/features/stores/hooks/use-own-store';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { useProducts } from '@/features/products/hooks/use-products';
import { useTenantCustomers } from '@/features/tenant-customers/hooks/use-tenant-customers';
import { StatCard } from '../components/stat-card';
import { RecentOrdersCard } from '../components/recent-orders-card';
import { LowStockCard } from '../components/low-stock-card';
import { QuickActions } from '../components/quick-actions';
import { getGreeting, getLowStockProducts, getPendingCount, getRevenue } from '../lib/dashboard-stats';

export function OverviewPage() {
  const { user } = useAuth();
  const { data: store } = useOwnStore();
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: customers } = useTenantCustomers();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 p-6 shadow-lg shadow-sky-500/20 md:p-8"
        >
          <motion.div
            className="absolute -right-10 -top-16 size-64 rounded-full bg-white/15 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative">
            <p className="text-sm text-sky-100">{getGreeting()}, {user?.username}</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-white md:text-3xl">{store?.name ?? 'Your store'} at a glance</h1>
            <div className="mt-5">
              <QuickActions />
            </div>
          </div>
        </motion.div>

        <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StaggerItem>
            <StatCard label="Revenue" value={orders && getRevenue(orders)} decimals={2} prefix="Rs. " icon={IndianRupee} tone="bg-emerald-100 text-emerald-600" hint="Excludes cancelled orders" />
          </StaggerItem>
          <StaggerItem>
            <StatCard label="Total orders" value={orders?.length} icon={ShoppingBag} tone="bg-sky-100 text-sky-600" />
          </StaggerItem>
          <StaggerItem>
            <StatCard label="Awaiting action" value={orders && getPendingCount(orders)} icon={Clock} tone="bg-amber-100 text-amber-600" hint="Pending orders" />
          </StaggerItem>
          <StaggerItem>
            <StatCard label="Customers" value={customers?.length} icon={Users} tone="bg-violet-100 text-violet-600" />
          </StaggerItem>
        </StaggerList>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentOrdersCard orders={orders} />
          </div>
          <LowStockCard products={products ? getLowStockProducts(products) : []} />
        </div>
      </div>
    </div>
  );
}
