// Customer profile: contact details, spend summary, and a clickable list of their orders.
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { StatusBadge } from '@/components/status-badge';
import { getOrderStatusTone, getPaymentStatusTone } from '@/lib/status-colors';
import { formatMoney, formatOrderDate, shortOrderId } from '@/features/orders/lib/order-rules';
import { useTenantCustomer } from '../hooks/use-tenant-customer';
import { CustomerAvatar } from '../components/customer-avatar';

const BACK_LINK = <Link to="/dashboard/customers" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="size-3.5" /> Customers</Link>;

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, isError } = useTenantCustomer(id!);

  if (isLoading) return <PageBody><Skeleton className="h-64 w-full rounded-2xl" /></PageBody>;
  if (isError || !customer) return <PageBody>{BACK_LINK}<p className="text-slate-500">Customer not found.</p></PageBody>;

  const name = customer.username ?? customer.email ?? customer.customer_id.slice(0, 8);
  const spend = customer.orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
  const stats = [{ label: 'Orders', value: String(customer.orders.length) }, { label: 'Total spend', value: formatMoney(spend) }, { label: 'Last order', value: customer.orders[0] ? formatOrderDate(customer.orders[0].created_at) : '—' }];

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader eyebrow={BACK_LINK} title={name} description="Customer profile and order history." />
      <PageBody>
        <section className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs md:flex-row md:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <CustomerAvatar id={customer.customer_id} name={name} />
            <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{name}</p><p className="flex items-center gap-1.5 truncate text-sm text-slate-500"><Mail className="size-3.5 shrink-0" /> {customer.email ?? '—'}</p></div>
          </div>
          <dl className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 md:ml-auto md:border-0 md:pt-0">
            {stats.map((s) => <div key={s.label}><dt className="text-xs text-slate-500">{s.label}</dt><dd className="mt-0.5 font-semibold text-slate-900 tabular-nums">{s.value}</dd></div>)}
          </dl>
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <h2 className="px-5 pt-5 pb-2 text-sm font-semibold text-slate-900">Orders</h2>
          <Table>
            <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-4 sm:pl-5">Order</TableHead><TableHead>Total</TableHead><TableHead className="hidden sm:table-cell">Status</TableHead><TableHead className="hidden sm:table-cell">Payment</TableHead><TableHead className="hidden sm:table-cell">Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {customer.orders.map((o) => (
                <TableRow key={o.id} onClick={() => navigate(`/dashboard/orders/${o.id}`)} className="cursor-pointer">
                  <TableCell className="pl-4 font-medium sm:pl-5"><Link to={`/dashboard/orders/${o.id}`} className="hover:text-sky-700">{shortOrderId(o.id)}</Link><div className="mt-1 sm:hidden"><StatusBadge tone={getOrderStatusTone(o.status)} value={o.status} /></div></TableCell>
                  <TableCell className="tabular-nums">{formatMoney(o.total)}</TableCell>
                  <TableCell className="hidden sm:table-cell"><StatusBadge tone={getOrderStatusTone(o.status)} value={o.status} /></TableCell>
                  <TableCell className="hidden sm:table-cell"><StatusBadge tone={getPaymentStatusTone(o.payment_status)} value={o.payment_status} /></TableCell>
                  <TableCell className="hidden text-slate-500 sm:table-cell">{formatOrderDate(o.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </PageBody>
    </div>
  );
}
