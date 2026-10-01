import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, ShoppingBag, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import { getOrderStatusTone, getPaymentStatusTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { useTenantCustomer } from '../hooks/use-tenant-customer';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading, isError } = useTenantCustomer(id!);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  if (isError || !customer) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <p className="text-slate-500">Customer not found.</p>
        </div>
      </div>
    );
  }

  const displayName = customer.username ?? customer.customer_id.slice(0, 8);
  const initial = displayName.charAt(0).toUpperCase();
  const orderCount = customer.orders.length;
  const lifetimeTotal = customer.orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            <Link
              to="/dashboard/customers"
              aria-label="Back to customers"
              className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="size-6" />
            </Link>
            {displayName}
          </span>
        }
        description="Customer profile and order history for your store."
      />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#0077C8]/10 text-lg font-semibold text-[#0077C8]">
                {initial}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold text-slate-900">{displayName}</p>
                <p className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Mail className="size-3.5" /> {customer.email ?? '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 sm:ml-auto">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Orders</p>
                  <p className="font-semibold text-slate-900 tabular-nums">{orderCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="size-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Lifetime total</p>
                  <p className="font-semibold text-slate-900 tabular-nums">Rs. {lifetimeTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-secondary/30">
                    <TableCell>
                      <Link to={`/dashboard/orders/${order.id}`} className="underline">{order.id.slice(0, 8)}</Link>
                    </TableCell>
                    <TableCell className="tabular-nums">Rs. {order.total.toFixed(2)}</TableCell>
                    <TableCell><Badge className={STATUS_TONE_CLASSNAME[getOrderStatusTone(order.status)]}>{order.status}</Badge></TableCell>
                    <TableCell><Badge className={STATUS_TONE_CLASSNAME[getPaymentStatusTone(order.payment_status)]}>{order.payment_status}</Badge></TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
