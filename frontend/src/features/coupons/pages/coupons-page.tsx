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
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="md:rounded-2xl md:border md:border-slate-200/80 md:bg-white md:p-5 md:shadow-xs hover-card-glow md:overflow-hidden">
            <CouponTable />
          </div>
        </div>
      </div>
    </div>
  );
}
