// Storefront and owner details for one store, side by side on wide screens.
import { Mail, Phone, User, Globe, Truck, Megaphone, MapPin } from 'lucide-react';
import { formatMoney } from '@/features/orders/lib/order-rules';
import type { AdminTenantDetail } from '../types/admin-types';

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <div className="min-w-0"><p className="text-xs text-slate-500">{label}</p><p className="text-sm break-words text-slate-900">{value}</p></div>
    </div>
  );
}

export function TenantInfoCards({ detail }: { detail: AdminTenantDetail }) {
  const { store, owner, tenant, business_address } = detail;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <h2 className="mb-1 text-sm font-semibold text-slate-900">Storefront</h2>
        <InfoRow icon={Globe} label="Link" value={`${window.location.host}/${tenant.slug} · ${store?.is_published ? 'Published' : 'Not published'}`} />
        <InfoRow icon={Truck} label="Delivery fee" value={store ? formatMoney(store.delivery_fee) : '—'} />
        <InfoRow icon={Megaphone} label="Announcement" value={store?.promotion_banner_text || 'None'} />
      </section>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <h2 className="mb-1 text-sm font-semibold text-slate-900">Owner</h2>
        <InfoRow icon={User} label="Name" value={owner?.username ?? 'Unknown'} />
        <InfoRow icon={Mail} label="Email" value={owner?.email ?? '—'} />
        <InfoRow icon={Phone} label="Phone" value={owner?.phone_number ?? '—'} />
        {business_address && <InfoRow icon={MapPin} label="Business address" value={business_address} />}
      </section>
    </div>
  );
}
