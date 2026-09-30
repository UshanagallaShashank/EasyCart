// Store discount coupons page with fixed header and scrollable table view
import { PageHeader } from '@/components/page-header';
import { CreateCouponDialog } from '../components/create-coupon-dialog';
import { CouponTable } from '../components/coupon-table';

export function CouponsPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <PageHeader title="Coupons" description="Create promo codes, discounts, and customer savings.">
        <CreateCouponDialog />
      </PageHeader>
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover-card-glow p-5 overflow-hidden">
            <CouponTable />
          </div>
        </div>
      </div>
    </div>
  );
}
