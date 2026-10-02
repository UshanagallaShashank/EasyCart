// The big on/off switch for taking orders. Going online shares the phone's location so nearby orders come first.
import { toast } from 'sonner';
import { Power, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiError } from '@/shared/api/api-error';
import { setOnline } from '@/features/delivery/api/rider-api';
import { readCurrentPosition } from '@/features/delivery/lib/use-current-position';
import type { Rider } from '@/features/delivery/types/delivery-types';
import { useRiderProfileMutation } from '../hooks/use-rider-queries';
import { useLocationHeartbeat } from '../hooks/use-location-heartbeat';

export function OnlineToggleCard({ rider }: { rider: Rider }) {
  const toggle = useRiderProfileMutation(setOnline);
  useLocationHeartbeat(rider.is_online);

  async function handleToggle() {
    const next = !rider.is_online;
    let point: { latitude: number; longitude: number } | null = null;
    if (next) {
      try {
        point = await readCurrentPosition();
      } catch (err) {
        toast.warning(err instanceof Error ? `${err.message} Orders will be matched by your saved location.` : 'Location not shared');
      }
    }
    toggle.mutate({ is_online: next, ...(point ?? {}) }, {
      onSuccess: () => toast.success(next ? 'You are online. New orders will appear here.' : 'You are offline.'),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not change your status')
    });
  }

  return (
    <section className={cn('relative overflow-hidden rounded-2xl p-5 shadow-xs transition-colors', rider.is_online ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' : 'border border-slate-200/80 bg-white')}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className={cn('text-xs font-semibold tracking-wider uppercase', rider.is_online ? 'text-emerald-100' : 'text-slate-400')}>Status</p>
          <p className={cn('text-2xl font-bold tracking-tight', rider.is_online ? 'text-white' : 'text-slate-900')}>{rider.is_online ? 'You are online' : 'You are offline'}</p>
          <p className={cn('mt-0.5 flex items-center gap-1 text-xs', rider.is_online ? 'text-emerald-50' : 'text-slate-500')}>
            <MapPin className="size-3.5" />
            {rider.is_online ? 'Nearby orders are offered to you first' : 'Go online to start getting orders'}
          </p>
        </div>
        <button type="button" role="switch" aria-checked={rider.is_online} aria-label={rider.is_online ? 'Go offline' : 'Go online'} onClick={handleToggle} disabled={toggle.isPending}
          className={cn('flex size-16 shrink-0 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-60',
            rider.is_online ? 'bg-white text-emerald-600' : 'bg-sky-600 text-white hover:bg-sky-700')}>
          <Power className={cn('size-7', toggle.isPending && 'animate-pulse')} />
        </button>
      </div>
    </section>
  );
}
