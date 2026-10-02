// Under a delivery address: a link to the customer's map pin, or a note that they did not drop one.
import { mapsLink } from '../lib/delivery-labels';

export function DeliveryPinLink({ latitude, longitude }: { latitude?: number | null; longitude?: number | null }) {
  const link = mapsLink({ latitude: latitude ?? null, longitude: longitude ?? null });

  if (!link) return <span className="mt-1 block text-[11px] font-medium text-amber-700">No map pin for this address</span>;
  return (
    <span className="mt-1 block text-[11px] font-semibold">
      <span className="text-emerald-700">Map pin set</span> · <a href={link} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">View on map</a>
    </span>
  );
}
