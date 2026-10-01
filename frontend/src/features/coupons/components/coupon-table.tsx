import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { useCoupons } from '../hooks/use-coupons';
import { useSetCouponActive } from '../hooks/use-set-coupon-active';
import { useDeleteCoupon } from '../hooks/use-delete-coupon';
import { ApiError } from '@/shared/api/api-error';
import type { Coupon } from '../types/coupon-types';

function describeCoupon(coupon: Coupon) {
  const isExpired = coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false;
  return {
    isExpired,
    status: isExpired ? 'expired' : coupon.is_active ? 'active' : 'inactive',
    tone: (isExpired ? 'danger' : coupon.is_active ? 'success' : 'neutral') as 'danger' | 'success' | 'neutral',
    discount: coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `Rs. ${coupon.discount_value.toFixed(2)}`
  };
}

function ExpiryText({ coupon, isExpired }: { coupon: Coupon; isExpired: boolean }) {
  if (!coupon.expires_at) return <span className="text-slate-400">No expiration</span>;
  const date = new Date(coupon.expires_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  return <span className={isExpired ? 'font-medium text-destructive' : ''}>{date}</span>;
}

export function CouponTable() {
  const { data: coupons, isLoading } = useCoupons();
  const setActive = useSetCouponActive();
  const remove = useDeleteCoupon();

  function handleToggle(coupon: Coupon) {
    setActive.mutate(
      { id: coupon.id, is_active: !coupon.is_active },
      { onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to update coupon') }
    );
  }

  function handleDelete(id: string) {
    remove.mutate(id, {
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to delete coupon')
    });
  }

  function renderActions(coupon: Coupon, isExpired: boolean) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          disabled={isExpired}
          title={isExpired ? 'Cannot activate an expired coupon' : undefined}
          onClick={() => handleToggle(coupon)}
        >
          {isExpired ? 'Expired' : coupon.is_active ? 'Deactivate' : 'Activate'}
        </Button>
        <Button variant="destructive" size="sm" onClick={() => handleDelete(coupon.id)}>
          Delete
        </Button>
      </>
    );
  }

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!coupons?.length) return <EmptyState message="No coupons yet." />;

  return (
    <>
      {/* Phones: one card per coupon */}
      <ul className="flex flex-col gap-3 md:hidden">
        {coupons.map((coupon) => {
          const info = describeCoupon(coupon);
          return (
            <li key={coupon.id} className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm font-semibold">{coupon.code}</span>
                <Badge className={STATUS_TONE_CLASSNAME[info.tone]}>{info.status}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                <span className="font-semibold tabular-nums">{info.discount} off</span>
                <span className="text-xs text-muted-foreground">
                  Expires: <ExpiryText coupon={coupon} isExpired={info.isExpired} />
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">{renderActions(coupon, info.isExpired)}</div>
            </li>
          );
        })}
      </ul>

      {/* Tablets and larger: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Expires on</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => {
              const info = describeCoupon(coupon);
              return (
                <TableRow key={coupon.id} className="hover:bg-secondary/30">
                  <TableCell className="font-mono text-sm font-medium">{coupon.code}</TableCell>
                  <TableCell className="font-semibold tabular-nums">{info.discount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <ExpiryText coupon={coupon} isExpired={info.isExpired} />
                  </TableCell>
                  <TableCell><Badge className={STATUS_TONE_CLASSNAME[info.tone]}>{info.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">{renderActions(coupon, info.isExpired)}</div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
