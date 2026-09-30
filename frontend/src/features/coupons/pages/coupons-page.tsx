import { CreateCouponDialog } from '../components/create-coupon-dialog';
import { CouponTable } from '../components/coupon-table';

export function CouponsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Coupons</h1>
        <CreateCouponDialog />
      </div>
      <CouponTable />
    </div>
  );
}
