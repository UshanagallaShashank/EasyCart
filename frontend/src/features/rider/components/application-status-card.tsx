// Where the rider's application stands, with the admin's note when it was rejected or suspended.
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock3, PencilLine, ShieldAlert, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/features/delivery/lib/delivery-labels';
import type { Rider } from '@/features/delivery/types/delivery-types';

const LOOK = {
  draft: { icon: PencilLine, title: 'Finish your application', text: 'Add your details, location and documents, then send it for review.', className: 'border-sky-200 bg-sky-50 text-sky-900', iconClass: 'text-sky-600' },
  pending: { icon: Clock3, title: 'Application in review', text: 'An admin is checking your documents. This usually takes a day. You will be able to go online as soon as you are approved.', className: 'border-amber-200 bg-amber-50 text-amber-900', iconClass: 'text-amber-600' },
  approved: { icon: CheckCircle2, title: 'You are approved', text: 'Go online from the home screen to start getting orders near you.', className: 'border-emerald-200 bg-emerald-50 text-emerald-900', iconClass: 'text-emerald-600' },
  rejected: { icon: XCircle, title: 'Changes needed', text: 'Fix what the admin asked for below, then send your application again.', className: 'border-rose-200 bg-rose-50 text-rose-900', iconClass: 'text-rose-600' },
  suspended: { icon: ShieldAlert, title: 'Account suspended', text: 'You cannot take orders right now. Contact support if you think this is a mistake.', className: 'border-rose-200 bg-rose-50 text-rose-900', iconClass: 'text-rose-600' }
} as const;

export function ApplicationStatusCard({ rider, showLink }: { rider: Rider; showLink?: boolean }) {
  const look = LOOK[rider.status];
  const Icon = look.icon;
  return (
    <div className={cn('flex items-start gap-3 rounded-2xl border p-4', look.className)}>
      <Icon className={cn('mt-0.5 size-5 shrink-0', look.iconClass)} />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">{look.title}</p>
        <p className="mt-0.5 text-xs opacity-80">{look.text}</p>
        {rider.review_note && (rider.status === 'rejected' || rider.status === 'suspended') && <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs"><strong>Admin note:</strong> {rider.review_note}</p>}
        {rider.status === 'pending' && rider.submitted_at && <p className="mt-1 text-[11px] opacity-70">Sent {formatDateTime(rider.submitted_at)}</p>}
        {showLink && (rider.status === 'draft' || rider.status === 'rejected') && <Link to="/rider/onboarding" className="mt-2 inline-block text-xs font-semibold underline">Continue application</Link>}
      </div>
    </div>
  );
}
