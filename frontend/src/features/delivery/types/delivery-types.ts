// Types mirroring the backend delivery partner (rider) wire format exactly.
export type VehicleType = 'bike' | 'scooter' | 'electric_bike' | 'bicycle';
export type RiderStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
export type DocumentKind = 'partner_photo' | 'vehicle_photo' | 'license_front' | 'license_back' | 'vehicle_rc' | 'id_proof' | 'insurance' | 'other';
export type DeliveryStage = 'not_started' | 'ready_for_delivery' | 'rider_assigned' | 'dispatched' | 'delivered' | 'cancelled';

export interface RiderDocument {
  kind: DocumentKind;
  index?: number;
  title: string;
  file_name: string;
  type: 'pdf' | 'image';
  url: string | null;
}

export interface RiderProfileFields {
  full_name: string;
  date_of_birth: string;
  vehicle_type: VehicleType | '';
  vehicle_number: string;
  license_number: string;
  license_expiry: string;
  address_line: string;
  area: string;
  city: string;
  pincode: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  upi_id: string;
}

export interface Rider extends RiderProfileFields {
  id: string;
  user_id: string;
  email: string;
  phone_number: string;
  latitude: number | null;
  longitude: number | null;
  location_updated_at: string | null;
  status: RiderStatus;
  review_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  is_online: boolean;
  last_seen_at: string | null;
  created_at: string;
  documents: RiderDocument[];
  photo_url: string | null;
  missing_steps: string[];
}

export interface RiderMoney {
  deliveries: number;
  deliveries_today: number;
  deliveries_this_week: number;
  earnings: number;
  earnings_today: number;
  earnings_this_week: number;
  cash_collected: number;
  cash_deposited: number;
  cash_in_hand: number;
  paid_out: number;
  payout_due: number;
}

export interface DailyPoint {
  date: string;
  deliveries: number;
  earnings: number;
}

export interface Settlement {
  id: string;
  rider_id: string;
  kind: 'cash_deposit' | 'payout';
  amount: number;
  note: string | null;
  created_at: string;
}

export type RiderOrderStage = 'offered' | 'to_pickup' | 'to_customer' | 'delivered' | 'cancelled' | 'ready_for_delivery';

export interface RiderOrder {
  id: string;
  stage: RiderOrderStage;
  created_at: string;
  offer_expires_at: string | null;
  store: { name: string; address: string | null; latitude: number | null; longitude: number | null; distance_km: number | null };
  customer: { name: string; phone_number: string | null } | null;
  delivery_address: string | null;
  /** The pin the customer dropped for this address, or null (shown once the rider has accepted). */
  delivery_point: { latitude: number; longitude: number } | null;
  items: { name: string; quantity: number; variant_label: string | null }[];
  item_count: number;
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  total: number;
  cash_to_collect: number;
  earning: number;
  pickup_attempts_left: number;
  delivery_attempts_left: number;
  accepted_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  cash_collected: number | null;
  proof_photo_url: string | null;
  settlement?: OrderSettlementInfo | null;
}

export interface RiderHome {
  rider: Rider;
  offers: RiderOrder[];
  active: RiderOrder[];
  summary: RiderMoney;
}

export interface HandoverRider {
  id: string;
  full_name: string;
  vehicle_type: VehicleType | null;
  vehicle_number: string | null;
  phone_number: string | null;
  photo_url: string | null;
}

export interface DeliveryTimeline {
  placed_at: string;
  ready_at: string | null;
  accepted_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
}

// Shared by the store and customer views of one order's delivery.
export interface OrderDelivery {
  order_id: string;
  stage: DeliveryStage;
  rider_offer_status: 'offered' | 'accepted' | null;
  rider: HandoverRider | null;
  timeline: DeliveryTimeline;
  /** How far the rider is from the store and roughly how long they need, while they head there. */
  pickup_eta: { distance_km: number; minutes: number; updated_at: string } | null;
  /** The same for the last leg, from the rider to the customer's pin (only when the customer dropped one). */
  dropoff_eta: { distance_km: number; minutes: number; updated_at: string } | null;
  cash_collected: number | null;
  proof_photo_url: string | null;
  delivery_locked: boolean;
  settlement?: OrderSettlementInfo | null;
}

export interface StoreOrderDelivery extends OrderDelivery {
  pickup_code: string | null;
  pickup_locked: boolean;
  store_has_location: boolean;
  declined_count?: number;
}

export interface CustomerOrderDelivery extends OrderDelivery {
  delivery_code: string | null;
}

export interface NearbyRider {
  id: string;
  full_name: string;
  vehicle_type: VehicleType | null;
  area: string | null;
  city: string | null;
  distance_km: number | null;
  is_available: boolean;
  active_orders: number;
}

export interface StoreDeliveryRow {
  id: string;
  stage: DeliveryStage;
  rider_offer_status: 'offered' | 'accepted' | null;
  rider_name: string | null;
  delivery_address: string | null;
  total: number;
  created_at: string;
  delivered_at: string | null;
  settlement?: OrderSettlementInfo | null;
}

export interface OrderSettlementInfo {
  order_id: string;
  cash_collected: number;
  rider_earning: number;
  store_amount: number;
  net_to_store: number;
  is_cod: boolean;
  is_settled: boolean;
  settled_at: string | null;
  settled_by: string | null;
  method: 'cash' | 'upi' | string | null;
  note: string | null;
}

export interface StoreSettlementSummary {
  summary: {
    pending_cash_from_riders: number;
    pending_rider_payouts: number;
    settled_cash_total: number;
    settled_orders_count: number;
    pending_orders_count: number;
  };
  orders: {
    order_id: string;
    created_at: string;
    delivered_at: string | null;
    rider_id: string | null;
    rider_name: string | null;
    rider_phone: string | null;
    total: number;
    cash_collected: number;
    rider_earning: number;
    store_amount: number;
    net_to_store: number;
    is_cod: boolean;
    is_settled: boolean;
    settled_at: string | null;
    settled_by: string | null;
    method: string | null;
    note: string | null;
  }[];
}

export interface RiderSettlementSummary {
  summary: {
    pending_cash_to_stores: number;
    pending_ride_earnings: number;
    settled_cash_total: number;
    settled_store_cash?: number;
    settled_orders_count: number;
    pending_orders_count: number;
    total_orders_count?: number;
  };
  orders: {
    order_id: string;
    store_id: string;
    store_name: string;
    store_address: string | null;
    created_at: string;
    delivered_at: string | null;
    total: number;
    cash_collected: number;
    rider_earning: number;
    store_amount: number;
    net_to_store: number;
    is_cod: boolean;
    is_settled: boolean;
    settled_at: string | null;
    settled_by: string | null;
    method: string | null;
    note: string | null;
    has_cash_deposit?: boolean;
    has_payout?: boolean;
  }[];
}

export interface AdminRiderRow {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  vehicle_type: VehicleType | null;
  vehicle_number: string | null;
  area: string | null;
  city: string | null;
  pincode: string | null;
  status: RiderStatus;
  is_online: boolean;
  has_location: boolean;
  distance_km: number | null;
  active_orders: number;
  deliveries: number;
  cash_in_hand: number;
  payout_due: number;
  submitted_at: string | null;
  created_at: string;
}

export interface AdminRiderList {
  riders: AdminRiderRow[];
  stores: { tenant_id: string; name: string; has_location: boolean }[];
}

export interface AdminRiderOrder {
  id: string;
  store_name: string;
  total: number;
  delivery_fee: number;
  fulfillment_status: string;
  status: string;
  rider_offer_status: string | null;
  delivery_address: string | null;
  cash_collected: number | null;
  rider_earning: number | null;
  created_at: string;
  delivered_at: string | null;
}

export interface AdminRiderDetail {
  rider: Rider;
  summary: RiderMoney;
  daily: DailyPoint[];
  settlements: Settlement[];
  orders: AdminRiderOrder[];
}

export interface AdminDeliveryRow {
  id: string;
  store_name: string;
  tenant_id: string;
  rider_id: string | null;
  rider_name: string | null;
  stage: DeliveryStage;
  rider_offer_status: 'offered' | 'accepted' | null;
  delivery_address: string | null;
  total: number;
  delivery_fee: number;
  cash_collected: number | null;
  created_at: string;
  delivered_at: string | null;
}
