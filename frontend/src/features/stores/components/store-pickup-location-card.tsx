// Pickup location card with live geolocation pinning and map check.
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, LocateFixed, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { StoreSettingsPayload } from '../types/store-types';

interface Props {
  form: StoreSettingsPayload;
  onUpdate: (k: keyof StoreSettingsPayload, v: unknown) => void;
  onSave?: () => void;
}

export function StorePickupLocationCard({ form, onUpdate, onSave }: Props) {
  const [isLocating, setIsLocating] = useState(false);

  const lat = form.latitude ?? 17.83672;
  const lng = form.longitude ?? 78.68855;
  const address = form.address ?? 'gajwel';

  function handleGetLocation() {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = Number(position.coords.latitude.toFixed(5));
        const newLng = Number(position.coords.longitude.toFixed(5));

        onUpdate('latitude', newLat);
        onUpdate('longitude', newLng);

        // Fetch reverse geocoding to suggest address & pincode if available
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.address) {
              const addrStr = data.address.suburb || data.address.town || data.address.city || data.address.village || 'Gajwel';
              if (data.address.postcode) {
                onUpdate('pincode', data.address.postcode);
              }
              if (!form.address || form.address === 'gajwel') {
                onUpdate('address', addrStr.toLowerCase());
              }
            }
          })
          .catch(() => { /* ignore fallback */ })
          .finally(() => {
            setIsLocating(false);
            toast.success(`Location pinned: ${newLat}, ${newLng}`);
          });
      },
      (error) => {
        setIsLocating(false);
        // Default fallback to Gajwel coordinates if location permission denied/unavailable
        onUpdate('latitude', 17.83672);
        onUpdate('longitude', 78.68855);
        toast.info('Using Gajwel store coordinates (17.83672, 78.68855)');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-xs bg-white p-6">
      <CardContent className="p-0 space-y-5">
        {/* Header with circular icon */}
        <div className="flex items-start gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-500 shadow-2xs">
            <MapPin className="size-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900 leading-snug">Pickup location</h3>
            <p className="mt-0.5 text-xs text-slate-500 max-w-md leading-relaxed font-medium">
              Stand inside your store and tap &quot;Use my location&quot;. Orders then go to the rider nearest to you.
            </p>
          </div>
        </div>

        {/* Address Input */}
        <div className="space-y-1.5">
          <Label htmlFor="store_address" className="text-xs font-bold text-slate-800">
            Store address for riders
          </Label>
          <Input
            id="store_address"
            type="text"
            placeholder="e.g. gajwel"
            value={address}
            onChange={(e) => onUpdate('address', e.target.value)}
            className="h-11 rounded-xl text-xs border-slate-200 focus-visible:ring-sky-500 bg-white"
          />
        </div>

        {/* Pinned Location Box */}
        <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4 space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Location pinned</h4>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {lat}, {lng}
            </p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline mt-1"
            >
              Check on map <ExternalLink className="size-3" />
            </a>
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="rounded-full border-sky-300/90 bg-white text-sky-600 hover:bg-sky-50 hover:border-sky-400 font-bold px-4 py-2 text-xs transition-all shadow-2xs cursor-pointer gap-2 h-9"
            >
              {isLocating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-sky-600" />
                  Locating…
                </>
              ) : (
                <>
                  <LocateFixed className="size-3.5 text-sky-600" />
                  Use my location
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Bottom Save Pickup Location Button */}
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            onClick={onSave}
            className="rounded-full bg-[#0088CC] hover:bg-[#0077BB] text-white font-bold px-6 py-2.5 text-sm shadow-sm cursor-pointer transition-all h-10"
          >
            Save pickup location
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
