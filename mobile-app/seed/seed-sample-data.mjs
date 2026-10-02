// Creates the EasyCart sample data in Supabase, and nothing more:
//   1 shop (with its owner), 10 products, 2 customers, 2 delivery partners, 3 orders.
// Every row has a fixed id. Rows that already exist are left alone, so running this again never adds or changes data.
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (read from the environment, or from ../../backend/.env).
import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

function loadBackendEnv() {
  const path = new URL('../../backend/.env', import.meta.url);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}

loadBackendEnv();
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or put them in backend/.env).');
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// One password for every sample account, meeting the app's rules (capital, number, symbol, 8-20 characters).
const PASSWORD = 'EasyCart@123';
const id = (n) => `00000000-0000-4000-a000-${String(n).padStart(12, '0')}`;
const now = new Date();
const ago = (minutes) => new Date(now.getTime() - minutes * 60_000).toISOString();

const STORE = { lat: 17.4375, lng: 78.4483 }; // Ameerpet, Hyderabad

const users = [
  { id: id(1), username: 'greenleaf_owner', email: 'owner@greenleaf.easycart.app', phone_number: '9000000001', role: 'tenant_owner', tenant_id: id(100) },
  { id: id(2), username: 'asha_rao', email: 'asha@easycart.app', phone_number: '9000000002', role: 'customer', tenant_id: null },
  { id: id(3), username: 'vikram_s', email: 'vikram@easycart.app', phone_number: '9000000003', role: 'customer', tenant_id: null },
  { id: id(4), username: 'ravi_rider', email: 'ravi@easycart.app', phone_number: '9000000004', role: 'delivery_partner', tenant_id: null },
  { id: id(5), username: 'priya_rider', email: 'priya@easycart.app', phone_number: '9000000005', role: 'delivery_partner', tenant_id: null }
];

const tenant = { id: id(100), name: 'Green Leaf Market', slug: 'green-leaf-market', owner_id: id(1), status: 'active' };
const store = {
  id: id(101), tenant_id: id(100), name: 'Green Leaf Market', slug: 'green-leaf-market', theme: 'default', delivery_fee: 40, is_published: true,
  promotion_banner_text: 'Free delivery on your first order this week', address: 'Shop 4, Lake View Complex, Ameerpet', pincode: '500016',
  max_delivery_radius_km: 8, latitude: STORE.lat, longitude: STORE.lng
};

const categories = [
  { id: id(200), tenant_id: id(100), name: 'Fruits & Vegetables' },
  { id: id(201), tenant_id: id(100), name: 'Dairy & Bakery' },
  { id: id(202), tenant_id: id(100), name: 'Snacks & Drinks' }
];

const product = (n, name, price, category, stock, extra = {}) => ({
  id: id(300 + n), tenant_id: id(100), category_id: id(category), name, price, sku: `GLM-${String(n).padStart(3, '0')}`,
  description: extra.description ?? `${name}, fresh from Green Leaf Market.`, images: [], variants: extra.variants ?? [],
  stock_quantity: stock, low_stock_threshold: 5, is_active: true
});
const products = [
  product(1, 'Bananas (1 dozen)', 60, 200, 40),
  product(2, 'Red Apples (1 kg)', 180, 200, 25),
  product(3, 'Tomatoes (1 kg)', 40, 200, 50),
  product(4, 'Fresh Milk (1 L)', 64, 201, 30),
  product(5, 'Brown Bread', 55, 201, 20),
  product(6, 'Paneer (200 g)', 95, 201, 4),
  product(7, 'Salted Potato Chips', 30, 202, 60),
  product(8, 'Orange Juice (1 L)', 120, 202, 15),
  product(9, 'Green Tea (25 bags)', 150, 202, 12),
  product(10, 'Basmati Rice', 0, 200, 0, { description: 'Long-grain basmati rice. Choose a pack size.', variants: [{ label: '1 kg', sku: 'GLM-010-1', price: 140, stock: 20 }, { label: '5 kg', sku: 'GLM-010-5', price: 650, stock: 8 }] })
];
products[9].price = 140;

const rider = (n, userId, name, phone, area, lat, lng, vehicle, plate) => ({
  id: id(400 + n), user_id: userId, full_name: name, email: users.find((u) => u.id === userId).email, phone_number: phone,
  date_of_birth: '1995-06-15', vehicle_type: vehicle, vehicle_number: plate, license_number: `TS09202000${n}234`, license_expiry: '2031-12-31',
  address_line: `${n}-2-15, Main Road`, area, city: 'Hyderabad', pincode: '500016', latitude: lat, longitude: lng, location_updated_at: ago(5),
  emergency_contact_name: 'Family contact', emergency_contact_phone: '9000000099', upi_id: `${name.split(' ')[0].toLowerCase()}@upi`,
  documents: {}, status: 'approved', submitted_at: ago(4320), reviewed_at: ago(4000), is_online: false, last_seen_at: ago(5)
});
const riders = [
  rider(1, id(4), 'Ravi Kumar', '9000000004', 'Ameerpet', 17.4401, 78.4512, 'bike', 'TS09AB1234'),
  rider(2, id(5), 'Priya Nair', '9000000005', 'Begumpet', 17.4447, 78.4664, 'scooter', 'TS10CD5678')
];

const line = (p, quantity, variant) => ({ product_id: p.id, name: p.name, price: variant ? p.variants.find((v) => v.label === variant).price : p.price, quantity, ...(variant ? { variant_label: variant } : {}) });
const total = (items, fee) => items.reduce((sum, item) => sum + item.price * item.quantity, 0) + fee;
const order1Items = [line(products[0], 1), line(products[3], 2), line(products[4], 1)];
const order2Items = [line(products[1], 1), line(products[9], 1, '1 kg')];
const order3Items = [line(products[6], 3), line(products[7], 1)];
const base = { tenant_id: id(100), payment_method: 'cash_on_delivery', fulfillment_method: 'delivery', delivery_fee: 40, coupon_code: null, discount_amount: 0, assigned_to: null };
const orders = [
  // 1. Delivered yesterday by Ravi, cash collected, not yet settled with the store.
  { ...base, id: id(500), customer_id: id(2), items: order1Items, total: total(order1Items, 40), status: 'fulfilled', payment_status: 'paid', fulfillment_status: 'delivered',
    delivery_address: 'Flat 302, Sai Residency, Road 3, Banjara Hills, Hyderabad 500034', delivery_latitude: 17.4126, delivery_longitude: 78.4482,
    rider_id: id(401), rider_offer_status: 'accepted', delivery_code: '481516', pickup_code: '2342', ready_at: ago(1500), accepted_at: ago(1495), picked_up_at: ago(1480), delivered_at: ago(1455),
    cash_collected: total(order1Items, 40), rider_earning: 40, created_at: ago(1520) },
  // 2. Out for delivery with Priya right now. Customer code: 271828.
  { ...base, id: id(501), customer_id: id(3), items: order2Items, total: total(order2Items, 40), status: 'confirmed', payment_status: 'unpaid', fulfillment_status: 'dispatched',
    delivery_address: '12-4, Lotus Apartments, Begumpet, Hyderabad 500016', delivery_latitude: 17.4436, delivery_longitude: 78.4720,
    rider_id: id(402), rider_offer_status: 'accepted', delivery_code: '271828', pickup_code: '3141', ready_at: ago(40), accepted_at: ago(38), picked_up_at: ago(20), created_at: ago(50) },
  // 3. Just placed, waiting for the store to pack it and send it for delivery.
  { ...base, id: id(502), customer_id: id(2), items: order3Items, total: total(order3Items, 40), status: 'pending', payment_status: 'unpaid', fulfillment_status: 'not_started',
    delivery_address: 'Flat 302, Sai Residency, Road 3, Banjara Hills, Hyderabad 500034', delivery_latitude: 17.4126, delivery_longitude: 78.4482,
    rider_id: null, rider_offer_status: null, delivery_code: '141421', pickup_code: null, created_at: ago(8) }
];

// Inserts only rows whose id is not there yet. Returns how many were added.
async function insertMissing(table, rows, { uniqueCheck } = {}) {
  const { data: existing, error } = await db.from(table).select('id').in('id', rows.map((row) => row.id));
  if (error) throw new Error(`${table}: ${error.message}${error.code === '42P01' || error.code === 'PGRST205' ? ' (run the migrations in backend/migrations first)' : ''}`);
  const have = new Set(existing.map((row) => row.id));
  let fresh = rows.filter((row) => !have.has(row.id));
  if (uniqueCheck) fresh = await uniqueCheck(fresh);
  if (fresh.length === 0) return 0;
  const { error: insertError } = await db.from(table).insert(fresh);
  if (insertError) throw new Error(`${table}: ${insertError.message}`);
  return fresh.length;
}

// Never create a second account for an email or username that is already taken.
async function skipTakenUsers(rows) {
  const keep = [];
  for (const row of rows) {
    const { data } = await db.from('users').select('id').or(`email.eq.${row.email},username.eq.${row.username}`).limit(1);
    if (data?.length) console.warn(`  skipped ${row.email}: email or username already used by another account`);
    else keep.push(row);
  }
  return keep;
}

async function main() {
  console.log('Seeding EasyCart sample data…');
  const password_hash = await bcrypt.hash(PASSWORD, 10);
  const userRows = users.map(({ tenant_id, ...user }) => ({ ...user, password_hash, tenant_id: null }));
  const counts = {};
  counts.users = await insertMissing('users', userRows, { uniqueCheck: skipTakenUsers });
  counts.tenants = await insertMissing('tenants', [tenant]);
  await db.from('users').update({ tenant_id: id(100) }).eq('id', id(1)).is('tenant_id', null);
  counts.stores = await insertMissing('stores', [store]);
  counts.categories = await insertMissing('categories', categories);
  counts.products = await insertMissing('products', products);
  counts.delivery_partners = await insertMissing('delivery_partners', riders);
  counts.orders = await insertMissing('orders', orders);

  console.log('Added:', counts);
  console.log(`\nSample accounts (password for all: ${PASSWORD})`);
  for (const user of users) console.log(`  ${user.role.padEnd(16)} ${user.email}`);
  console.log('\nShop code: green-leaf-market · Order out for delivery has customer code 271828 (pickup already done).');
}

main().catch((err) => {
  console.error('Seeding stopped:', err.message);
  process.exit(1);
});
