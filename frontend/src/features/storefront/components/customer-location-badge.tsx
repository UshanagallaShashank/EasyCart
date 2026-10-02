// Location selector badge & popup dialog for customer delivery pincode / address.
import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Check, AlertTriangle, LocateFixed, ExternalLink, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { extractPincodeFromAddress, checkStoreDeliveryEligibility } from '../lib/delivery-radius';
import type { PublicStore } from '../types/storefront-types';
import { toast } from 'sonner';

interface SavedAddress {
  id: string;
  label: string;
  street: string;
  cityStateZip?: string;
  zip?: string;
}

const DEFAULT_ADDRESSES: SavedAddress[] = [
  { id: '1', label: 'Home', street: '123 Main St, Cityville, NY 10001' },
  { id: '2', label: 'Work', street: '456 Market Ave, Suite 300, NY 10002' }
];

export function CustomerLocationBadge({ store }: { store?: PublicStore }) {
  const [open, setOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [addressList, setAddressList] = useState<SavedAddress[]>(() => {
    const raw = localStorage.getItem('customer_saved_addresses');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { /* ignore */ }
    }
    return DEFAULT_ADDRESSES;
  });

  const [activeId, setActiveId] = useState<string>(() => {
    return localStorage.getItem('customer_active_address_id') || '1';
  });

  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => {
    const raw = localStorage.getItem('customer_live_coords');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch { /* ignore */ }
    }
    return { lat: 17.836716, lng: 78.688552 };
  });

  const activeAddr = addressList.find((a) => a.id === activeId) || addressList[0];
  const activePincode = activeAddr?.zip || extractPincodeFromAddress(activeAddr?.cityStateZip) || extractPincodeFromAddress(activeAddr?.street) || '502278';

  const delivery = store ? checkStoreDeliveryEligibility(store, activePincode) : null;
  const isOutOfRange = delivery ? !delivery.isEligible : false;

  useEffect(() => {
    function sync() {
      const actId = localStorage.getItem('customer_active_address_id');
      if (actId) setActiveId(actId);
      const rawList = localStorage.getItem('customer_saved_addresses');
      if (rawList) {
        try {
          const parsed = JSON.parse(rawList);
          if (Array.isArray(parsed) && parsed.length > 0) setAddressList(parsed);
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('customer_address_changed', sync);
    return () => window.removeEventListener('customer_address_changed', sync);
  }, []);

  function handleSelectAddress(id: string, addr: SavedAddress) {
    setActiveId(id);
    localStorage.setItem('customer_active_address_id', id);
    const fullStr = [addr.street, addr.cityStateZip].filter(Boolean).join(', ');
    localStorage.setItem('customer_saved_address', fullStr || addr.street);
    const pin = addr.zip || extractPincodeFromAddress(addr.cityStateZip) || extractPincodeFromAddress(addr.street);
    if (pin) localStorage.setItem('customer_active_pincode', pin);
    window.dispatchEvent(new Event('customer_address_changed'));
    setOpen(false);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = Number(position.coords.latitude.toFixed(6));
        const newLng = Number(position.coords.longitude.toFixed(6));
        const newCoords = { lat: newLat, lng: newLng };

        setCoords(newCoords);
        localStorage.setItem('customer_live_coords', JSON.stringify(newCoords));

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.address) {
              const town = data.address.suburb || data.address.town || data.address.city || data.address.village || 'Gajwel';
              const pin = data.address.postcode || '502278';

              localStorage.setItem('customer_active_pincode', pin);
              const liveAddr = `Live Location, ${town}, ${pin}`;
              localStorage.setItem('customer_saved_address', liveAddr);
              window.dispatchEvent(new Event('customer_address_changed'));
            }
          })
          .catch(() => {
            localStorage.setItem('customer_active_pincode', '502278');
            window.dispatchEvent(new Event('customer_address_changed'));
          })
          .finally(() => {
            setIsLocating(false);
            toast.success(`Location pinned: ${newLat}, ${newLng}`);
            setOpen(false);
          });
      },
      () => {
        setIsLocating(false);
        const fallbackCoords = { lat: 17.836716, lng: 78.688552 };
        setCoords(fallbackCoords);
        localStorage.setItem('customer_live_coords', JSON.stringify(fallbackCoords));
        localStorage.setItem('customer_active_pincode', '502278');
        window.dispatchEvent(new Event('customer_address_changed'));
        toast.info('Pinned location: 17.836716, 78.688552');
        setOpen(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  const mapUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
          isOutOfRange
            ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
            : 'border-sky-200/80 bg-sky-50/80 text-sky-700 hover:bg-sky-100'
        }`}
        aria-label="Select delivery location"
      >
        {isOutOfRange ? <AlertTriangle className="size-3.5 text-amber-600" /> : <MapPin className="size-3.5 text-sky-500" />}
        <span className="max-w-[130px] truncate">{activeAddr?.label || 'Location'} ({activePincode})</span>
        {isOutOfRange && <span className="rounded-full bg-amber-200/80 px-1.5 py-0.2 text-[9px] font-bold text-amber-900 uppercase">Out of radius</span>}
        <ChevronDown className={`size-3 ${isOutOfRange ? 'text-amber-600' : 'text-sky-400'}`} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-extrabold text-slate-900">
              Select Delivery Location
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Stores and products will be filtered based on your delivery address & pincode radius
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold text-slate-700">Your Saved Addresses</p>
            {addressList.map((addr) => {
              const isSelected = addr.id === activeId;
              const pin = addr.zip || extractPincodeFromAddress(addr.cityStateZip) || extractPincodeFromAddress(addr.street);
              const addrDelivery = store && pin ? checkStoreDeliveryEligibility(store, pin) : null;
              const isAddrEligible = addrDelivery ? addrDelivery.isEligible : true;

              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelectAddress(addr.id, addr)}
                  className={`flex w-full items-start justify-between rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                    isSelected ? 'border-sky-300 bg-sky-50/80 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{addr.label}</span>
                      {pin && <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">PIN: {pin}</span>}
                      {store && (
                        <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                          isAddrEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isAddrEligible ? 'In Radius' : 'Out of Radius'}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{[addr.street, addr.cityStateZip].filter(Boolean).join(', ')}</p>
                  </div>
                  {isSelected && <Check className="size-4 text-sky-600 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Location Pinned Component matching reference image */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4 space-y-2.5">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Location pinned</h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {coords.lat}, {coords.lng}
                </p>
                <a
                  href={mapUrl}
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
                  onClick={handleUseMyLocation}
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
