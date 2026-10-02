// Store settings: the address riders come to and the map pin used to find the nearest rider.
// Never invents a location: until the owner pins one, it says so.
import { toast } from 'sonner';
import { ExternalLink, LocateFixed, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentPosition } from '@/features/delivery/lib/use-current-position';
import { mapsLink } from '@/features/delivery/lib/delivery-labels';
import type { StoreSettingsPayload } from '../types/store-types';

interface Props {
  form: StoreSettingsPayload;
  onUpdate: (k: keyof StoreSettingsPayload, v: unknown) => void;
}

// Suggests the pincode for the pinned spot, so the owner does not have to look it up. Best effort only.
async function lookUpPincode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
    return (await res.json())?.address?.postcode ?? null;
  } catch {
    return null;
  }
}

export function StorePickupLocationCard({ form, onUpdate }: Props) {
  const { locate, isLocating, error } = useCurrentPosition();
  const pinned = form.latitude != null && form.longitude != null;
  const link = pinned ? mapsLink({ latitude: form.latitude!, longitude: form.longitude! }) : null;

  async function handlePin() {
    const point = await locate();
    if (!point) return;
    onUpdate('latitude', point.latitude);
    onUpdate('longitude', point.longitude);
    toast.success('Location pinned. Save changes to keep it.');
    if (!form.pincode) {
      const pincode = await lookUpPincode(point.latitude, point.longitude);
      if (pincode) onUpdate('pincode', pincode);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><MapPin className="size-4.5" /></span>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Pickup location</h2>
          <p className="text-xs text-slate-500">Stand inside your store and tap "Use my location". Delivery orders then go to the rider nearest to you.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="store_address" className="text-xs font-semibold text-slate-700">Store address for riders</Label>
          <Input id="store_address" value={form.address ?? ''} onChange={(e) => onUpdate('address', e.target.value)} placeholder="Shop no., street, landmark" maxLength={200} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="store_pincode" className="text-xs font-semibold text-slate-700">Pincode</Label>
          <Input id="store_pincode" value={form.pincode ?? ''} onChange={(e) => onUpdate('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="500016" />
        </div>
      </div>
      <div className="mt-4 flex flex-col items-start gap-3 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-sm">
          {pinned ? (
            <>
              <p className="font-semibold text-slate-900">Location pinned</p>
              <p className="font-mono text-xs text-slate-500">{form.latitude!.toFixed(5)}, {form.longitude!.toFixed(5)}</p>
              {link && <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:underline">Check on map <ExternalLink className="size-3" /></a>}
            </>
          ) : (
            <p className="text-slate-500">Not pinned yet. Until you pin it, any online rider may get your orders.</p>
          )}
          {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
        </div>
        <Button type="button" variant="outline" onClick={handlePin} disabled={isLocating} className="shrink-0"><LocateFixed /> {isLocating ? 'Finding…' : pinned ? 'Pin again' : 'Use my location'}</Button>
      </div>
    </section>
  );
}
