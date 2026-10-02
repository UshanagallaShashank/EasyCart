// A small map where the customer taps or drags a pin to the exact delivery spot. Maps are from OpenStreetMap.
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentPosition, type Point } from '@/features/delivery/lib/use-current-position';

// Shown when nothing else is known: the middle of India.
const DEFAULT_CENTER: Point = { latitude: 20.5937, longitude: 78.9629 };
const PIN_ZOOM = 17;
const OVERVIEW_ZOOM = 5;

// The pin is drawn with plain HTML, so no image files are needed.
const PIN_ICON = L.divIcon({
  className: '',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  html: '<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.2 0 0 7 0 15.7 0 27 16 42 16 42s16-15 16-26.3C32 7 24.8 0 16 0z" fill="#0284C7"/><circle cx="16" cy="15.5" r="6" fill="white"/></svg>'
});

interface MapPinPickerProps {
  value: Point | null;
  onChange: (point: Point) => void;
  /** Where to open the map when there is no pin yet, for example the store's location. */
  fallbackCenter?: Point | null;
}

function toLatLng(point: Point): L.LatLngExpression {
  return [point.latitude, point.longitude];
}

export function MapPinPicker({ value, onChange, fallbackCenter = null }: MapPinPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const { locate, isLocating, error } = useCurrentPosition();

  // Always call the latest onChange, without rebuilding the map each time it changes.
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Build the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const start = value ?? fallbackCenter ?? DEFAULT_CENTER;
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView(toLatLng(start), value || fallbackCenter ? PIN_ZOOM : OVERVIEW_ZOOM);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Tapping anywhere on the map moves the pin there.
    map.on('click', (event: L.LeafletMouseEvent) => {
      onChangeRef.current({ latitude: Number(event.latlng.lat.toFixed(6)), longitude: Number(event.latlng.lng.toFixed(6)) });
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // The map is built once; later changes to the pin are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the pin on the map in step with the value.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (!markerRef.current) {
      const marker = L.marker(toLatLng(value), { icon: PIN_ICON, draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const spot = marker.getLatLng();
        onChangeRef.current({ latitude: Number(spot.lat.toFixed(6)), longitude: Number(spot.lng.toFixed(6)) });
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng(toLatLng(value));
    }
    map.setView(toLatLng(value), Math.max(map.getZoom(), PIN_ZOOM - 2));
  }, [value]);

  async function handleUseMyLocation() {
    const found = await locate();
    if (found) onChange(found);
  }

  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} className="z-0 h-56 w-full overflow-hidden rounded-xl border border-slate-200" role="application" aria-label="Map: tap or drag the pin to your delivery spot" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 text-[11px] text-slate-500">
          {value ? <>Pin set at <span className="font-mono">{value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}</span>. Drag it to adjust.</> : 'Tap the map to drop a pin, or use your location.'}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleUseMyLocation} disabled={isLocating}>
          <LocateFixed /> {isLocating ? 'Finding…' : 'Use my location'}
        </Button>
      </div>
      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}
