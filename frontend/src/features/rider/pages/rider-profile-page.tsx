// The rider's account: status, contact and vehicle details, base location and documents.
import { BadgeCheck, FileCheck2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { DocumentGallery } from '@/features/delivery/components/document-gallery';
import { RiderAvatar } from '@/features/delivery/components/rider-avatar';
import { ToneBadge } from '@/features/delivery/components/tone-badge';
import { RIDER_STATUS, VEHICLE_LABELS } from '@/features/delivery/lib/delivery-labels';
import { useMyRider } from '../hooks/use-rider-queries';
import { ApplicationStatusCard } from '../components/application-status-card';
import { BaseLocationCard } from '../components/base-location-card';
import { RiderProfileForm } from '../components/rider-profile-form';
import { FormSection } from '../components/form-section';
import { OtherDocuments } from '../components/other-documents';

export function RiderProfilePage() {
  const { data: rider, isLoading } = useMyRider();
  if (isLoading || !rider) return <PageBody><Skeleton className="h-96 w-full rounded-2xl" /></PageBody>;
  const status = RIDER_STATUS[rider.status];

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title="Profile and documents" description="Keep your contact details and documents up to date." />
      <PageBody>
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center">
          <RiderAvatar name={rider.full_name} photoUrl={rider.photo_url} className="size-16" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-bold text-slate-900">{rider.full_name}</h2><ToneBadge tone={status.tone} label={status.label} /></div>
            <p className="truncate text-sm text-slate-500">{rider.email} · {rider.phone_number}</p>
            <p className="truncate text-xs text-slate-500">{rider.vehicle_type ? VEHICLE_LABELS[rider.vehicle_type] : 'Vehicle not set'}{rider.vehicle_number && ` · ${rider.vehicle_number}`}</p>
          </div>
          {rider.status === 'approved' && <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:self-center"><BadgeCheck className="size-4" /> Verified partner</span>}
        </section>
        {rider.status !== 'approved' && <ApplicationStatusCard rider={rider} showLink />}
        <BaseLocationCard rider={rider} />
        <FormSection icon={FileCheck2} title="Documents" description="Private. Only you and the EasyCart admin team can see them.">
          <div className="flex flex-col gap-4">
            <DocumentGallery documents={rider.documents.filter((doc) => doc.kind !== 'other')} />
            <div><p className="mb-2 text-xs font-semibold text-slate-700">Other documents (renewed licence, insurance, police verification)</p><OtherDocuments documents={rider.documents.filter((doc) => doc.kind === 'other')} canRemove={rider.status === 'draft' || rider.status === 'rejected'} /></div>
          </div>
        </FormSection>
        <RiderProfileForm rider={rider} />
      </PageBody>
    </div>
  );
}
