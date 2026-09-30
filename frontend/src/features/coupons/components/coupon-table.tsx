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

export function CouponTable() {
  const { data: coupons, isLoading } = useCoupons();
  const setActive = useSetCouponActive();
  const remove = useDeleteCoupon();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!coupons?.length) return <EmptyState message="No coupons yet." />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((coupon) => (
          <TableRow key={coupon.id} className="hover:bg-secondary/30">
            <TableCell className="font-medium">{coupon.code}</TableCell>
            <TableCell className="tabular-nums">
              {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `$${coupon.discount_value.toFixed(2)}`}
            </TableCell>
            <TableCell>
              <Badge className={STATUS_TONE_CLASSNAME[coupon.is_active ? 'success' : 'neutral']}>
                {coupon.is_active ? 'active' : 'inactive'}
              </Badge>
            </TableCell>
            <TableCell className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setActive.mutate(
                    { id: coupon.id, is_active: !coupon.is_active },
                    { onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to update coupon') }
                  )
                }
              >
                {coupon.is_active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  remove.mutate(coupon.id, {
                    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to delete coupon')
                  })
                }
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
