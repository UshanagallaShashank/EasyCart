// Store discount coupons page with the coupon list.
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { CreateCouponDialog } from '../components/create-coupon-dialog';
import { CouponTable } from '../components/coupon-table';

export function CouponsPage() {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title="Coupons" description="Create promo codes and discounts for your customers.">
        <CreateCouponDialog />
      </PageHeader>
      <PageBody><CouponTable /></PageBody>
    </div>
  );
}
