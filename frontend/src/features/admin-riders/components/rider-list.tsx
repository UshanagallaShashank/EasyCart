// Riders as cards on phones and tablets and as a table on wide screens, so the page never scrolls sideways.
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format_price } from '@/lib/format-price';
import { ToneBadge } from '@/features/delivery/components/tone-badge';
import { RiderAvatar } from '@/features/delivery/components/rider-avatar';
import { RIDER_STATUS, VEHICLE_LABELS, formatDistance } from '@/features/delivery/lib/delivery-labels';
import type { AdminRiderRow } from '@/features/delivery/types/delivery-types';

function OnlineDot({ rider }: { rider: AdminRiderRow }) {
  if (rider.status !== 'approved') return null;
  return <span className={`inline-flex items-center gap-1 text-xs font-medium ${rider.is_online ? 'text-emerald-600' : 'text-slate-400'}`}><span className={`size-2 rounded-full ${rider.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`} />{rider.is_online ? 'Online' : 'Offline'}</span>;
}

function place(rider: AdminRiderRow) {
  return [rider.area, rider.city].filter(Boolean).join(', ') || 'Area not set';
}

export function RiderList({ riders, showDistance }: { riders: AdminRiderRow[]; showDistance: boolean }) {
  return (
    <>
      <ul className="flex flex-col gap-3 xl:hidden">
        {riders.map((rider) => {
          const status = RIDER_STATUS[rider.status];
          return (
            <li key={rider.id}>
              <Link to={`/admin/riders/${rider.id}`} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-colors hover:border-sky-300">
                <RiderAvatar name={rider.full_name} photoUrl={null} className="size-10" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-slate-900">{rider.full_name}</p><ToneBadge tone={status.tone} label={status.label} /><OnlineDot rider={rider} /></div>
                  <p className="truncate text-xs text-slate-500">{place(rider)}{rider.pincode && ` · ${rider.pincode}`}{showDistance && ` · ${formatDistance(rider.distance_km)}`}</p>
                  <p className="truncate text-xs text-slate-500">{rider.vehicle_type ? VEHICLE_LABELS[rider.vehicle_type] : 'No vehicle yet'}{rider.vehicle_number && ` · ${rider.vehicle_number}`} · {rider.deliveries} deliveries</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-slate-300" />
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Area</TableHead>
              {showDistance && <TableHead className="text-right">Distance</TableHead>}
              <TableHead>Vehicle</TableHead>
              <TableHead className="text-right">Deliveries</TableHead>
              <TableHead className="text-right">Cash in hand</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riders.map((rider) => {
              const status = RIDER_STATUS[rider.status];
              return (
                <TableRow key={rider.id} className="cursor-pointer">
                  <TableCell className="max-w-56">
                    <Link to={`/admin/riders/${rider.id}`} className="flex items-center gap-3">
                      <RiderAvatar name={rider.full_name} photoUrl={null} className="size-9 text-xs" />
                      <span className="min-w-0"><span className="block truncate font-semibold text-slate-900 hover:text-sky-700">{rider.full_name}</span><span className="block truncate text-xs text-slate-500" title={rider.email}>{rider.phone_number}</span></span>
                    </Link>
                  </TableCell>
                  <TableCell><div className="flex flex-col items-start gap-1"><ToneBadge tone={status.tone} label={status.label} /><OnlineDot rider={rider} /></div></TableCell>
                  <TableCell className="max-w-48"><span className="block truncate text-sm text-slate-700">{place(rider)}</span><span className="text-xs text-slate-400">{rider.pincode ?? '—'}{!rider.has_location && ' · no GPS pin'}</span></TableCell>
                  {showDistance && <TableCell className="text-right font-medium tabular-nums">{formatDistance(rider.distance_km)}</TableCell>}
                  <TableCell className="max-w-40"><span className="block truncate text-sm">{rider.vehicle_type ? VEHICLE_LABELS[rider.vehicle_type] : '—'}</span><span className="block truncate font-mono text-xs text-slate-500">{rider.vehicle_number ?? ''}</span></TableCell>
                  <TableCell className="text-right tabular-nums">{rider.deliveries}{rider.active_orders > 0 && <span className="block text-xs text-sky-600">{rider.active_orders} active</span>}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{format_price(rider.cash_in_hand)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
