// One delivery partner for the platform admin: identity and documents to verify, review actions, money and deliveries.
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle, ArrowLeft, Bike, CheckCircle2, FileCheck2, HandCoins, HeartPulse, IndianRupee, MapPin, PackageCheck, RotateCcw, ShieldOff, UserRound, Wallet, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/shared/api/api-error';
import { format_price } from '@/lib/format-price';
import { approveRider, reactivateRider, rejectRider, suspendRider } from '@/features/delivery/api/admin-rider-api';
import { DocumentGallery } from '@/features/delivery/components/document-gallery';
import { EarningsChart } from '@/features/delivery/components/earnings-chart';
import { SettlementList } from '@/features/delivery/components/settlement-list';
import { RiderAvatar } from '@/features/delivery/components/rider-avatar';
import { ToneBadge } from '@/features/delivery/components/tone-badge';
import { DOCUMENT_INFO, REQUIRED_DOCUMENT_KINDS, RIDER_STATUS, VEHICLE_LABELS, formatDateTime, mapsLink } from '@/features/delivery/lib/delivery-labels';
import type { Rider } from '@/features/delivery/types/delivery-types';
import { FormSection } from '@/features/rider/components/form-section';
import { StatTile } from '@/features/rider/components/stat-tile';
import { useAdminRider, useAdminRiderAction } from '../hooks/use-admin-riders';
import { NoteDialog } from '../components/note-dialog';
import { SettlementForm } from '../components/settlement-form';

function Row({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className={`min-w-0 truncate text-right font-medium text-slate-900 ${mono ? 'font-mono' : ''}`} title={value ?? ''}>{value || '—'}</span>
    </div>
  );
}

function licenceWarning(rider: Rider): string | null {
  if (!rider.license_expiry) return null;
  const days = Math.round((new Date(rider.license_expiry).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return 'Driving licence has expired';
  if (days < 30) return `Driving licence expires in ${days} days`;
  return null;
}

function ReviewActions({ rider }: { rider: Rider }) {
  const fail = (fallback: string) => (err: unknown) => { toast.error(err instanceof ApiError ? err.message : fallback); throw err; };
  const approve = useAdminRiderAction(rider.id, () => approveRider(rider.id));
  const reject = useAdminRiderAction(rider.id, (note: string) => rejectRider(rider.id, note));
  const suspend = useAdminRiderAction(rider.id, (note: string) => suspendRider(rider.id, note));
  const reactivate = useAdminRiderAction(rider.id, () => reactivateRider(rider.id));
  const missingRequired = REQUIRED_DOCUMENT_KINDS.filter((kind) => !rider.documents.some((doc) => doc.kind === kind));

  return (
    <div className="flex flex-wrap gap-2">
      {(rider.status === 'pending' || rider.status === 'rejected') && (
        <Button onClick={() => approve.mutate(undefined, { onSuccess: () => toast.success(`${rider.full_name} can now deliver`), onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not approve') })}
          disabled={approve.isPending || missingRequired.length > 0} title={missingRequired.length ? `Missing: ${missingRequired.map((k) => DOCUMENT_INFO[k].title).join(', ')}` : undefined}
          className="bg-emerald-600 text-white hover:bg-emerald-700"><CheckCircle2 /> Approve</Button>
      )}
      {rider.status === 'pending' && (
        <NoteDialog trigger={<Button variant="outline" className="text-rose-600 hover:text-rose-700"><XCircle /> Reject</Button>} title="Reject application" description="The rider sees this note and can fix the problem and apply again."
          confirmLabel="Reject" placeholder="e.g. Licence photo is blurry, please upload a clear one" isPending={reject.isPending}
          onConfirm={(note) => reject.mutateAsync(note).then(() => toast.success('Application rejected')).catch(fail('Could not reject'))} />
      )}
      {rider.status === 'approved' && (
        <NoteDialog trigger={<Button variant="outline" className="text-rose-600 hover:text-rose-700"><ShieldOff /> Suspend</Button>} title="Suspend partner" description="They go offline at once and stop getting orders. Orders they already carry stay with them."
          confirmLabel="Suspend" placeholder="Reason, e.g. customer complaint #123" isPending={suspend.isPending}
          onConfirm={(note) => suspend.mutateAsync(note).then(() => toast.success('Partner suspended')).catch(fail('Could not suspend'))} />
      )}
      {rider.status === 'suspended' && (
        <Button onClick={() => reactivate.mutate(undefined, { onSuccess: () => toast.success('Partner reactivated'), onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not reactivate') })} disabled={reactivate.isPending}><RotateCcw /> Reactivate</Button>
      )}
    </div>
  );
}

export function RiderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useAdminRider(id!);
  const back = <Link to="/admin/riders" className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"><ArrowLeft className="size-3.5" /> All partners</Link>;

  if (isLoading) return <div className="flex flex-col gap-4">{back}<Skeleton className="h-40 w-full rounded-2xl" /><Skeleton className="h-96 w-full rounded-2xl" /></div>;
  if (isError || !data) return <div className="flex flex-col gap-4">{back}<p className="text-sm text-slate-500">Delivery partner not found.</p></div>;

  const { rider, summary } = data;
  const status = RIDER_STATUS[rider.status];
  const warning = licenceWarning(rider);
  const missing = REQUIRED_DOCUMENT_KINDS.filter((kind) => !rider.documents.some((doc) => doc.kind === kind));
  const link = mapsLink(rider);

  return (
    <div className="flex flex-col gap-6">
      {back}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs md:flex-row md:items-center">
        <RiderAvatar name={rider.full_name} photoUrl={rider.photo_url} className="size-16" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h1 className="truncate font-heading text-2xl font-bold text-slate-900">{rider.full_name}</h1><ToneBadge tone={status.tone} label={status.label} />{rider.status === 'approved' && <ToneBadge tone={rider.is_online ? 'success' : 'neutral'} label={rider.is_online ? 'Online' : 'Offline'} />}</div>
          <p className="truncate text-sm text-slate-500">{rider.email} · {rider.phone_number}</p>
          <p className="text-xs text-slate-400">Joined {formatDateTime(rider.created_at)}{rider.submitted_at && ` · applied ${formatDateTime(rider.submitted_at)}`}{rider.reviewed_at && ` · reviewed ${formatDateTime(rider.reviewed_at)}`}</p>
        </div>
        <ReviewActions rider={rider} />
      </section>

      {rider.review_note && <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"><strong>Last review note:</strong> {rider.review_note}</p>}
      {(warning || missing.length > 0) && (
        <div className="flex flex-col gap-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {warning && <p className="flex items-center gap-2"><AlertTriangle className="size-4 shrink-0" /> {warning}</p>}
          {missing.length > 0 && <p className="flex items-center gap-2"><AlertTriangle className="size-4 shrink-0" /> Missing: {missing.map((kind) => DOCUMENT_INFO[kind].title).join(', ')}</p>}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <FormSection icon={UserRound} title="Identity">
          <Row label="Full name" value={rider.full_name} />
          <Row label="Date of birth" value={rider.date_of_birth} />
          <Row label="Mobile" value={rider.phone_number} />
          <Row label="UPI" value={rider.upi_id} mono />
        </FormSection>
        <FormSection icon={Bike} title="Vehicle and licence">
          <Row label="Vehicle" value={rider.vehicle_type ? VEHICLE_LABELS[rider.vehicle_type] : null} />
          <Row label="Number plate" value={rider.vehicle_number} mono />
          <Row label="Licence no." value={rider.license_number} mono />
          <Row label="Licence valid until" value={rider.license_expiry} />
        </FormSection>
        <FormSection icon={MapPin} title="Location and emergency">
          <Row label="Address" value={rider.address_line} />
          <Row label="Area" value={[rider.area, rider.city, rider.pincode].filter(Boolean).join(', ')} />
          <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm"><span className="text-slate-500">GPS pin</span>{link ? <a href={link} target="_blank" rel="noreferrer" className="font-semibold text-sky-600 hover:underline">Open map</a> : <span className="text-slate-400">Not pinned</span>}</div>
          <div className="flex items-start gap-2 pt-2 text-sm"><HeartPulse className="mt-0.5 size-4 shrink-0 text-rose-400" /><span className="min-w-0 truncate text-slate-700">{rider.emergency_contact_name || '—'} · {rider.emergency_contact_phone || '—'}</span></div>
        </FormSection>
      </div>

      <FormSection icon={FileCheck2} title="Documents" description="Compare the photo, name and numbers with the details above before approving. Links expire in an hour.">
        <DocumentGallery documents={rider.documents} emptyMessage="The rider has not uploaded any documents yet." />
      </FormSection>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={PackageCheck} label="Deliveries" value={String(summary.deliveries)} hint={`${summary.deliveries_this_week} in 7 days`} />
        <StatTile icon={IndianRupee} label="Earned" value={format_price(summary.earnings)} />
        <StatTile icon={Wallet} label="Cash in hand" value={format_price(summary.cash_in_hand)} hint={`${format_price(summary.cash_collected)} collected in total`} />
        <StatTile icon={HandCoins} label="Payout due" value={format_price(summary.payout_due)} hint={`${format_price(summary.paid_out)} paid so far`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <EarningsChart daily={data.daily} />
        <FormSection icon={HandCoins} title="Cash and payouts" description="Record cash the rider hands in and payouts you send them.">
          <div className="flex flex-col gap-5"><SettlementForm riderId={rider.id} summary={summary} /><SettlementList settlements={data.settlements} /></div>
        </FormSection>
      </div>

      <FormSection icon={PackageCheck} title="Orders handled" description={`${data.orders.length} total`}>
        {data.orders.length === 0 ? <p className="py-6 text-center text-xs text-slate-500">No orders yet.</p> : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {data.orders.slice(0, 30).map((order) => (
              <li key={order.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{order.store_name} <span className="font-mono text-xs text-slate-400">#{order.id.slice(0, 8)}</span></p>
                  <p className="truncate text-xs text-slate-500">{order.status === 'cancelled' ? 'Cancelled' : order.fulfillment_status.replaceAll('_', ' ')} · {formatDateTime(order.delivered_at ?? order.created_at)}</p>
                </div>
                <div className="shrink-0 text-right text-xs tabular-nums">
                  <p className="font-semibold text-slate-900">{format_price(Number(order.total))}</p>
                  {order.cash_collected !== null && <p className="text-slate-500">cash {format_price(Number(order.cash_collected))}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </FormSection>
    </div>
  );
}
