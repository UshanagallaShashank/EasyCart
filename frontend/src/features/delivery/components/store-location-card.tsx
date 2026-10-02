// Where riders collect the store's orders. Set from the owner's phone/laptop location while at the store.
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LocateFixed, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/shared/api/api-error';
import { useOwnStore } from '@/features/stores/hooks/use-own-store';
import { useUpdateStore } from '@/features/stores/hooks/use-update-store';
import { useCurrentPosition, type Point } from '../lib/use-current-position';
import { mapsLink } from '../lib/delivery-labels';

export function StoreLocationCard() {
  const { data: store } = useOwnStore();
  const update = useUpdateStore();
  const { locate, isLocating, error } = useCurrentPosition();
  const [address, setAddress] = useState('');
  const [point, setPoint] = useState<Point | null>(null);

  useEffect(() => {
    if (!store) return;
    setAddress(store.address_line ?? '');
    setPoint(store.latitude !== null && store.latitude !== undefined && store.longitude !== null && store.longitude !== undefined ? { latitude: store.latitude, longitude: store.longitude } : null);
  }, [store]);

  async function handleLocate() {
    const found = await locate();
    if (found) setPoint(found);
  }

  function handleSave() {
    if (!point) return toast.error('Pin the location first');
    if (address.trim().length < 3) return toast.error('Add the store address riders should come to');
    update.mutate({ latitude: point.latitude, longitude: point.longitude, address_line: address.trim() }, {
      onSuccess: () => toast.success('Pickup location saved'),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not save the location')
    });
  }

  const link = mapsLink(point);
  const changed = !store || address !== (store.address_line ?? '') || point?.latitude !== store.latitude || point?.longitude !== store.longitude;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><MapPin className="size-4.5" /></span>
        <div><h2 className="text-sm font-semibold text-slate-900">Pickup location</h2><p className="text-xs text-slate-500">Stand inside your store and tap "Use my location". Orders then go to the rider nearest to you.</p></div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="store-address" className="text-xs font-semibold text-slate-700">Store address for riders</Label>
          <Input id="store-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shop no., street, landmark" maxLength={200} />
        </div>
        <div className="flex flex-col items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <div className="min-w-0 text-sm">
            {point ? <><p className="font-semibold text-slate-900">Location pinned</p><p className="font-mono text-xs text-slate-500">{point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}</p>{link && <a href={link} target="_blank" rel="noreferrer" className="text-xs font-semibold text-sky-600 hover:underline">Check on map</a>}</> : <p className="text-slate-500">Not pinned yet</p>}
            {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
          </div>
          <Button type="button" variant="outline" onClick={handleLocate} disabled={isLocating} className="shrink-0"><LocateFixed /> {isLocating ? 'Finding…' : 'Use my location'}</Button>
        </div>
        <div className="flex justify-end"><Button type="button" onClick={handleSave} disabled={!changed || update.isPending} className="w-full sm:w-auto">{update.isPending ? 'Saving…' : 'Save pickup location'}</Button></div>
      </div>
    </section>
  );
}
