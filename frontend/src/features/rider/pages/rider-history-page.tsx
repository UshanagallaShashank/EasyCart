// Every order the rider has delivered, newest first, with what they earned and the proof photo.
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { EmptyState } from '@/components/empty-state';
import { usePagination } from '@/components/pagination/use-pagination';
import { PaginationBar } from '@/components/pagination/pagination-bar';
import { format_price } from '@/lib/format-price';
import { formatDateTime } from '@/features/delivery/lib/delivery-labels';
import { useRiderHistory } from '../hooks/use-rider-queries';

export function RiderHistoryPage() {
  const { data: orders, isLoading } = useRiderHistory();
  const list = orders ?? [];
  const { page, setPage, pageSize, setPageSize, totalPages, start, end, pageItems } = usePagination(list, 'history');

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title="Delivery history" description="Orders you have delivered." />
      <PageBody>
        {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : list.length === 0 ? <EmptyState message="No deliveries yet. Your completed orders will show here." /> : (
          <>
            <ul className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              {pageItems.map((order) => (
                <li key={order.id}>
                  <Link to={`/rider/orders/${order.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{order.store.name} → {order.customer?.name ?? 'Customer'}</p>
                      <p className="truncate text-xs text-slate-500">{formatDateTime(order.delivered_at)} · #{order.id.slice(0, 8)} · cash {format_price(order.cash_collected ?? 0)}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-emerald-700 tabular-nums">+{format_price(order.earning)}</span>
                    <ChevronRight className="size-4 shrink-0 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
            <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} start={start} end={end} total={list.length} noun="deliveries" onPageChange={setPage} onPageSizeChange={setPageSize} />
          </>
        )}
      </PageBody>
    </div>
  );
}
