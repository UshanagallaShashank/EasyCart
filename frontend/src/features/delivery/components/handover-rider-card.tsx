// Who is bringing the order: photo, name, vehicle and number plate, and a call button while the order is open.
import { Phone } from 'lucide-react';
import { RiderAvatar } from './rider-avatar';
import { VEHICLE_LABELS } from '../lib/delivery-labels';
import type { HandoverRider } from '../types/delivery-types';

export function HandoverRiderCard({ rider, caption }: { rider: HandoverRider; caption: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
      <RiderAvatar name={rider.full_name} photoUrl={rider.photo_url} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{caption}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{rider.full_name}</p>
        <p className="truncate text-xs text-slate-500">
          {rider.vehicle_type ? VEHICLE_LABELS[rider.vehicle_type] : 'Vehicle'}
          {rider.vehicle_number && <> · <span className="font-mono font-semibold text-slate-700">{rider.vehicle_number}</span></>}
        </p>
      </div>
      {rider.phone_number && (
        <a href={`tel:${rider.phone_number}`} aria-label={`Call ${rider.full_name}`} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100">
          <Phone className="size-4" />
        </a>
      )}
    </div>
  );
}
