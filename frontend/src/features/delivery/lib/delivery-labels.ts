// Human labels and status colors for vehicles, rider statuses and delivery stages.
import type { StatusTone } from '@/lib/status-colors';
import type { DeliveryStage, DocumentKind, RiderOrderStage, RiderStatus, VehicleType } from '../types/delivery-types';

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  bike: 'Motorbike',
  scooter: 'Scooter',
  electric_bike: 'Electric bike',
  bicycle: 'Bicycle'
};

export const RIDER_STATUS: Record<RiderStatus, { label: string; tone: StatusTone; hint: string }> = {
  draft: { label: 'Not sent', tone: 'neutral', hint: 'Application still being filled in' },
  pending: { label: 'In review', tone: 'warning', hint: 'Waiting for an admin to check documents' },
  approved: { label: 'Approved', tone: 'success', hint: 'Can go online and deliver' },
  rejected: { label: 'Rejected', tone: 'danger', hint: 'Needs changes before applying again' },
  suspended: { label: 'Suspended', tone: 'danger', hint: 'Blocked from taking orders' }
};

export const DELIVERY_STAGE: Record<DeliveryStage, { label: string; tone: StatusTone }> = {
  not_started: { label: 'Preparing', tone: 'neutral' },
  ready_for_delivery: { label: 'Finding rider', tone: 'warning' },
  rider_assigned: { label: 'Rider on the way to store', tone: 'warning' },
  dispatched: { label: 'Out for delivery', tone: 'warning' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' }
};

// "rider_assigned" covers both an unanswered offer and an accepted one; the offer status tells them apart.
export function deliveryStageLabel(stage: DeliveryStage, offer: 'offered' | 'accepted' | null): { label: string; tone: StatusTone } {
  if (stage === 'rider_assigned' && offer === 'offered') return { label: 'Offered to a rider', tone: 'warning' };
  return DELIVERY_STAGE[stage] ?? { label: stage, tone: 'neutral' };
}

export const RIDER_ORDER_STAGE: Record<RiderOrderStage, { label: string; tone: StatusTone }> = {
  offered: { label: 'New offer', tone: 'warning' },
  to_pickup: { label: 'Go to store', tone: 'warning' },
  to_customer: { label: 'Deliver to customer', tone: 'warning' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  ready_for_delivery: { label: 'Released', tone: 'neutral' }
};

export const DOCUMENT_INFO: Record<DocumentKind, { title: string; hint: string; required: boolean; photoOnly?: boolean }> = {
  partner_photo: { title: 'Your photo', hint: 'Clear face photo, like a passport photo', required: true, photoOnly: true },
  vehicle_photo: { title: 'Vehicle photo', hint: 'Whole vehicle with the number plate visible', required: true, photoOnly: true },
  license_front: { title: 'Driving licence (front)', hint: 'For a bicycle, any photo ID is fine', required: true },
  license_back: { title: 'Driving licence (back)', hint: 'Optional', required: false },
  vehicle_rc: { title: 'Vehicle registration (RC)', hint: 'For a bicycle, a purchase bill or photo of the cycle', required: true },
  id_proof: { title: 'ID proof', hint: 'Aadhaar, PAN, passport or voter ID', required: true },
  insurance: { title: 'Vehicle insurance', hint: 'Optional', required: false },
  other: { title: 'Other document', hint: 'Optional, e.g. police verification', required: false }
};

export const REQUIRED_DOCUMENT_KINDS: DocumentKind[] = ['partner_photo', 'vehicle_photo', 'license_front', 'vehicle_rc', 'id_proof'];
export const OPTIONAL_DOCUMENT_KINDS: DocumentKind[] = ['license_back', 'insurance'];

export function formatDistance(km: number | null): string {
  if (km === null) return 'Distance unknown';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export function mapsLink(point: { latitude: number | null; longitude: number | null } | null, fallbackAddress?: string | null): string | null {
  if (point && point.latitude !== null && point.longitude !== null) return `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`;
  if (fallbackAddress) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress)}`;
  return null;
}

const WHOLE_RUPEES = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

// Short rupee amount for small tiles: "Rs. 2,450" (paise only shown when there are any).
export function formatRupeesShort(amount: number): string {
  return Number.isInteger(amount) ? `Rs. ${WHOLE_RUPEES.format(amount)}` : `Rs. ${amount.toFixed(2)}`;
}
