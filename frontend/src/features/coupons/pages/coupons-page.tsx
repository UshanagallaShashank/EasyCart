// Store discount coupons page with creation dialog and table view
import { PageHeader } from '@/components/page-header';
import { CreateCouponDialog } from '../components/create-coupon-dialog';
import { CouponTable } from '../components/coupon-table';

export function CouponsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Coupons" description="Create promo codes, discounts, and customer savings.">
        <CreateCouponDialog />
      </PageHeader>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 overflow-hidden">
        <CouponTable />
      </div>
    </div>
  );
}
