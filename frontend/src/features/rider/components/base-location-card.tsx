// Pins the rider's base location from the phone's GPS, so nearby stores' orders reach them first.
import { toast } from 'sonner';
import { LocateFixed, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/shared/api/api-error';
import { setBaseLocation } from '@/features/delivery/api/rider-api';
import { useCurrentPosition } from '@/features/delivery/lib/use-current-position';
import { formatDateTime, mapsLink } from '@/features/delivery/lib/delivery-labels';
import type { Rider } from '@/features/delivery/types/delivery-types';
import { useRiderProfileMutation } from '../hooks/use-rider-queries';
import { FormSection } from './form-section';

export function BaseLocationCard({ rider }: { rider: Rider }) {
  const { locate, isLocating, error } = useCurrentPosition();
  const save = useRiderProfileMutation(setBaseLocation);
  const pinned = rider.latitude !== null && rider.longitude !== null;
  const link = mapsLink(rider);

  async function handlePin() {
    const point = await locate();
    if (!point) return;
    save.mutate(point, {
      onSuccess: () => toast.success('Location pinned'),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not save your location')
    });
  }

  return (
    <FormSection icon={MapPin} title="Base location" description="Stand where you usually start your day, then tap the button. It updates again each time you go online.">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-sm">
          {pinned ? (
            <>
              <p className="font-semibold text-slate-900">Pinned near {rider.area || rider.city || 'your area'}</p>
              <p className="font-mono text-xs text-slate-500">{rider.latitude?.toFixed(5)}, {rider.longitude?.toFixed(5)} · {formatDateTime(rider.location_updated_at)}</p>
              {link && <a href={link} target="_blank" rel="noreferrer" className="text-xs font-semibold text-sky-600 hover:underline">Check on map</a>}
            </>
          ) : (
            <p className="text-slate-500">Not pinned yet. Without it, you are matched by city and pincode only.</p>
          )}
          {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
        </div>
        <Button type="button" onClick={handlePin} disabled={isLocating || save.isPending} className="shrink-0">
          <LocateFixed /> {isLocating ? 'Finding you…' : pinned ? 'Update location' : 'Use my location'}
        </Button>
      </div>
    </FormSection>
  );
}
