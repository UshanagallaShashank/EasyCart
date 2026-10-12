// Made-up data for the screen tour: one small shop, a few products and orders, one delivery partner and an admin.
// It only lives inside the tests' fake server; nothing here is ever sent to a real backend.
import type { Answers } from './mock-api';

const now = Date.now();
const ago = (minutes: number) => new Date(now - minutes * 60_000).toISOString();
const day = (daysBack: number) => new Date(now - daysBack * 86_400_000).toISOString().slice(0, 10);

export const USERS = {
  customer: { id: 'u-cust', username: 'Asha', email: 'asha@example.test', phone_number: '9000000001', role: 'customer' },
  tenant_owner: { id: 'u-owner', username: 'Ravi', email: 'owner@example.test', phone_number: '9000000002', role: 'tenant_owner' },
  delivery_partner: { id: 'u-rider', username: 'Priya', email: 'priya@example.test', phone_number: '9000000003', role: 'delivery_partner' },
  platform_admin: { id: 'u-admin', username: 'Admin', email: 'admin@example.test', phone_number: '9000000004', role: 'platform_admin' }
} as const;

export type RoleName = keyof typeof USERS;

const STORE = {
  name: 'Green Leaf Market', slug: 'green-leaf-market', logo_url: null, banner_url: null, delivery_fee: 30, free_delivery_above: 499, max_delivery_radius_km: 8,
  pincode: '500001', address: '12 Market Road, Hyderabad', latitude: 17.385, longitude: 78.4867, promotion_banner_text: 'Free delivery over Rs. 499 this week', color_theme: 'emerald', is_published: true
};

const CATEGORIES = [{ id: 'c-fruit', name: 'Fruits' }, { id: 'c-dairy', name: 'Dairy' }, { id: 'c-snack', name: 'Snacks' }];

const product = (id: string, name: string, price: number, category_id: string, stock = 25) => ({
  id, name, price, category_id, stock_quantity: stock, low_stock_threshold: 5, is_active: true, images: [], variants: [],
  description: `Fresh ${name.toLowerCase()} from local farms, packed this morning.`
});

const PRODUCTS = [
  product('p-mango', 'Alphonso Mangoes 1kg', 249, 'c-fruit'),
  product('p-banana', 'Robusta Bananas 6 pcs', 48, 'c-fruit'),
  product('p-milk', 'Full Cream Milk 1L', 66, 'c-dairy', 3),
  product('p-curd', 'Fresh Curd 500g', 45, 'c-dairy'),
  product('p-chips', 'Masala Chips 150g', 35, 'c-snack', 0),
  product('p-namkeen', 'Mixture Namkeen 400g', 99, 'c-snack')
];

const order = (id: string, minutesAgo: number, status: string, fulfillment_status: string, total: number) => ({
  id, tenant_id: 't-1', customer_id: 'u-cust', total, status, payment_status: 'unpaid', payment_method: 'cash_on_delivery',
  fulfillment_method: 'delivery', delivery_address: '4-2 Lake View Colony, Hyderabad 500001', delivery_fee: 30,
  fulfillment_status, assigned_to: null, rider_id: null, rider_offer_status: null, delivery_code: fulfillment_status === 'dispatched' ? '4821' : null, pickup_code: '7310',
  delivered_at: status === 'fulfilled' ? ago(minutesAgo - 30) : null, cash_collected: null, coupon_code: null, discount_amount: 0,
  created_at: ago(minutesAgo), updated_at: ago(minutesAgo - 5),
  items: [{ product_id: 'p-mango', name: 'Alphonso Mangoes 1kg', price: 249, quantity: 1 }, { product_id: 'p-milk', name: 'Full Cream Milk 1L', price: 66, quantity: 2 }]
});

const ORDERS = [order('o-1001', 12, 'pending', 'not_started', 411), order('o-1002', 95, 'confirmed', 'dispatched', 411), order('o-1003', 60 * 26, 'fulfilled', 'delivered', 411)];

const totals = (orders: number) => ({ orders, items_value: orders * 380, commission: orders * 23, rider_pay: orders * 24, platform_earns: orders * 29, shop_keeps: orders * 357 });
const WEEK = [6, 5, 4, 3, 2, 1, 0].map((back, index) => ({ date: day(back), ...totals(index + 2) }));

const money = { deliveries: 42, deliveries_today: 3, deliveries_this_week: 17, earnings: 1008, earnings_today: 72, earnings_this_week: 408, cash_collected: 5200, cash_deposited: 4800, cash_in_hand: 400, paid_out: 900, payout_due: 108 };

const RIDER = {
  id: 'r-1', user_id: 'u-rider', email: 'priya@example.test', phone_number: '9000000003', latitude: 17.39, longitude: 78.49, location_updated_at: ago(2),
  status: 'approved', review_note: null, submitted_at: ago(60 * 24 * 10), reviewed_at: ago(60 * 24 * 9), is_online: true, last_seen_at: ago(1), created_at: ago(60 * 24 * 12),
  documents: [], photo_url: null, missing_steps: [], full_name: 'Priya Sharma', date_of_birth: '1998-04-12', vehicle_type: 'scooter', vehicle_number: 'TS09 AB 1234',
  license_number: 'TS0920190001234', license_expiry: '2031-04-12', address_line: '8 Park Lane', area: 'Banjara Hills', city: 'Hyderabad', pincode: '500034',
  emergency_contact_name: 'Kiran', emergency_contact_phone: '9000000099', upi_id: 'priya@upi'
};

const riderOrder = (id: string, stage: string) => ({
  id, stage, created_at: ago(20), ready_at: ago(10), offer_expires_at: new Date(now + 60_000).toISOString(),
  store: { name: STORE.name, address: STORE.address, latitude: 17.385, longitude: 78.4867, distance_km: 1.4 },
  customer: { name: 'Asha', phone_number: '9000000001' }, delivery_address: '4-2 Lake View Colony, Hyderabad 500001',
  items: [{ name: 'Alphonso Mangoes 1kg', quantity: 1, variant_label: null }, { name: 'Full Cream Milk 1L', quantity: 2, variant_label: null }],
  item_count: 3, subtotal: 381, discount_amount: 0, delivery_fee: 30, total: 411, cash_to_collect: 411, earning: 24,
  pickup_attempts_left: 5, delivery_attempts_left: 5, accepted_at: stage === 'offered' ? null : ago(8), picked_up_at: null, delivered_at: null,
  cash_collected: null, proof_photo_url: null, settlement: null
});

const DELIVERY = {
  order_id: 'o-1002', stage: 'dispatched', rider_offer_status: 'accepted', delivery_code: '4821', delivery_locked: false, cash_collected: null, proof_photo_url: null,
  rider: { id: 'r-1', full_name: 'Priya Sharma', vehicle_type: 'scooter', vehicle_number: 'TS09 AB 1234', phone_number: '9000000003', photo_url: null },
  timeline: { placed_at: ago(95), ready_at: ago(70), accepted_at: ago(65), picked_up_at: ago(20), delivered_at: null }, pickup_eta: null
};

const ALL_THEMES = { body: { catalog: ['sky', 'emerald', 'sunset', 'violet', 'rose', 'teal'], enabled: ['sky', 'emerald', 'sunset', 'violet', 'rose', 'teal'], default: 'sky' } };

const SHOP: Answers = {
  'GET /themes': ALL_THEMES,
  'GET /stores/*': { body: { store: STORE } },
  'GET /stores/*/products': { body: { products: PRODUCTS } },
  'GET /stores/*/products/*': { body: { product: PRODUCTS[0] } },
  'GET /stores/*/categories': { body: { categories: CATEGORIES } },
  'GET /stores/*/favourites': { body: { product_ids: ['p-mango'] } },
  'GET /stores/*/reviews': { body: { reviews: { average: 4.6, count: 38, recent: [{ store_stars: 5, comment: 'Always fresh and on time!', photo_urls: [], created_at: ago(300) }] } } },
  'GET /stores/*/product-ratings': { body: { ratings: { 'p-mango': { average: 4.8, count: 12 } } } },
  'GET /stores/nearby': { body: { stores: [{ ...STORE, distance_km: 1.4 }] } },
  'GET /my-stores': { body: { stores: [{ slug: STORE.slug, name: STORE.name, logo_url: null }] } },
  'GET /my-orders': { body: { orders: ORDERS } },
  'GET /my-orders/*': { body: { order: ORDERS[1] } },
  'GET /my-orders/*/delivery': { body: { delivery: DELIVERY } },
  'GET /my-orders/*/rating': { body: { rating: null } },
  'GET /my-orders/*/refunds': { body: { refunds: [] } },
  'GET /config': { body: { online_payments: false, payment_provider: null, razorpay_key_id: null } },
  'GET /addresses': { body: { addresses: [] } }
};

const OWNER: Answers = {
  'GET /themes': ALL_THEMES,
  'GET /stores/me': { body: { store: STORE } },
  'GET /orders': { body: { orders: ORDERS } },
  'GET /orders/*': { body: { order: ORDERS[0] } },
  'GET /orders/*/delivery': { body: { delivery: null } },
  'GET /products': { body: { products: PRODUCTS } },
  'GET /categories': { body: { categories: CATEGORIES } },
  'GET /customers': { body: { customers: [{ customer_id: 'u-cust', username: 'Asha', email: 'asha@example.test', order_count: 3, lifetime_total: 1233, last_order_at: ago(12) }] } },
  'GET /coupons': { body: { coupons: [{ id: 'cp-1', code: 'WELCOME50', discount_type: 'flat', discount_value: 50, is_active: true, expires_at: null }] } },
  'GET /earnings': { body: { earnings: { commission_percent: 6, all_time: totals(42), last_7_days: totals(17), by_day: WEEK } } },
  'GET /refunds': { body: { refunds: [] } },
  'GET /ratings/summary': { body: { summary: { count: 38, average_store: 4.6, average_delivery: 4.8, recent: [{ store_stars: 5, delivery_stars: 5, comment: 'Lovely mangoes', created_at: ago(300) }] } } },
  'GET /delivery/orders': { body: { deliveries: [] } },
  'GET /delivery/settlements': { body: { summary: { pending_cash_from_riders: 411, pending_rider_payouts: 24, settled_cash_total: 4800, settled_orders_count: 12, pending_orders_count: 1 }, orders: [] } },
  'GET /delivery/riders-nearby': { body: { riders: [{ id: 'r-1', full_name: 'Priya Sharma', vehicle_type: 'scooter', area: 'Banjara Hills', city: 'Hyderabad', distance_km: 1.2, is_available: true, active_orders: 0 }] } }
};

const RIDER_ANSWERS: Answers = {
  'GET /riders/me': { body: { rider: RIDER } },
  'GET /riders/me/home': { body: { rider: RIDER, offers: [riderOrder('o-2001', 'offered')], active: [riderOrder('o-2002', 'to_pickup')], passed: [], summary: money, at_order_limit: false, max_active_orders: 3 } },
  'GET /riders/me/orders/*': { body: { order: riderOrder('o-2002', 'to_pickup') } },
  'GET /riders/me/history': { body: { orders: [{ ...riderOrder('o-1990', 'delivered'), delivered_at: ago(200), cash_collected: 411 }] } },
  'GET /riders/me/earnings': { body: { summary: money, daily: WEEK.map((entry, index) => ({ date: entry.date, deliveries: index + 1, earnings: (index + 1) * 24 })), settlements: [] } },
  'GET /riders/me/settlements': { body: { summary: { pending_cash_to_stores: 400, pending_ride_earnings: 108, settled_cash_total: 4800, settled_orders_count: 30, pending_orders_count: 2 }, orders: [] } }
};

const ADMIN: Answers = {
  'GET /admin/stats': { body: { totals: { stores: 4, active_stores: 3, owners: 4, customers: 128, admins: 1, orders: 342, pending_orders: 6, gmv: 128450 }, daily_revenue: WEEK.map((entry) => ({ date: entry.date, revenue: entry.items_value, orders: entry.orders })), top_stores: [{ tenant_id: 't-1', name: STORE.name, revenue: 64000, orders: 180 }] } },
  'GET /admin/tenants': { body: { tenants: [{ id: 't-1', name: STORE.name, slug: STORE.slug, status: 'active', is_published: true, owner_email: 'owner@example.test', owner_username: 'Ravi', customer_count: 128, revenue: 64000, created_at: ago(60 * 24 * 30) }, { id: 't-2', name: 'Sunrise Bakery', slug: 'sunrise-bakery', status: 'pending', is_published: false, owner_email: 'bake@example.test', created_at: ago(60 * 5) }] } },
  'GET /admin/riders': { body: { riders: [], stores: [] } },
  'GET /admin/deliveries': { body: { deliveries: [] } },
  'GET /admin/earnings': { body: { earnings: { commission_percent: 6, rider_share_percent: 80, all_time: totals(342), last_7_days: totals(60), by_day: WEEK, per_store: [{ ...totals(180), tenant_id: 't-1', name: STORE.name, slug: STORE.slug }] } } },
  'GET /admin/refunds': { body: { refunds: [] } },
  'GET /admin/users': { body: { users: [] } }
};

export const ANSWERS_FOR: Record<RoleName, Answers> = { customer: SHOP, tenant_owner: OWNER, delivery_partner: RIDER_ANSWERS, platform_admin: ADMIN };
