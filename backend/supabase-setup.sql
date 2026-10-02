-- Run this once in your Supabase project's SQL Editor, top to bottom.

-- 1. Users table
-- Drops any existing users table first: the old table's id column was an
-- integer, but the app now uses text UUIDs for every id, so the column
-- type itself needs to change, not just be added to. Safe to drop since
-- there is no real user data yet.
drop table if exists users cascade;

create table users (
  id text primary key,
  username text unique not null,
  email text unique not null,
  phone_number text not null,
  password_hash text not null,
  role text not null default 'tenant_owner',
  tenant_id text,
  created_at timestamptz not null default now()
);

-- 2. Tenants table
drop table if exists tenants cascade;
create table tenants (
  id text primary key,
  name text not null,
  slug text unique not null,
  owner_id text not null references users(id),
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- 3. Stores table
drop table if exists stores cascade;
create table stores (
  id text primary key,
  tenant_id text unique not null references tenants(id),
  name text not null,
  slug text unique not null,
  logo_url text,
  banner_url text,
  theme text not null default 'default',
  delivery_fee numeric not null default 0,
  promotion_banner_text text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Categories table
drop table if exists categories cascade;
create table categories (
  id text primary key,
  tenant_id text not null references tenants(id),
  name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

-- 5. Products table
drop table if exists products cascade;
create table products (
  id text primary key,
  tenant_id text not null references tenants(id),
  category_id text references categories(id),
  name text not null,
  description text,
  price numeric not null,
  sku text not null,
  images jsonb not null default '[]',
  variants jsonb not null default '[]',
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, sku)
);

-- 6. Orders table
drop table if exists orders cascade;
create table orders (
  id text primary key,
  tenant_id text not null references tenants(id),
  customer_id text not null references users(id),
  items jsonb not null default '[]',
  total numeric not null,
  status text not null default 'pending',
  payment_status text not null default 'unpaid',
  payment_method text not null default 'cash_on_delivery',
  fulfillment_method text not null default 'pickup',
  delivery_address text,
  delivery_latitude numeric,
  delivery_longitude numeric,
  delivery_fee numeric not null default 0,
  fulfillment_status text not null default 'not_started',
  assigned_to text,
  coupon_code text,
  discount_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Coupons table
drop table if exists coupons cascade;
create table coupons (
  id text primary key,
  tenant_id text not null references tenants(id),
  code text not null,
  discount_type text not null,
  discount_value numeric not null,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

-- 8. Notifications table
drop table if exists notifications cascade;
create table notifications (
  id text primary key,
  tenant_id text not null references tenants(id),
  type text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 9. Storage bucket for store assets (logos and banners stored under user ID)
insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true)
on conflict (id) do update set public = true;

-- Policy to allow public read access to store assets
create policy "Public Access to Store Assets"
on storage.objects for select
using (bucket_id = 'store-assets');


-- 10. Private storage bucket for store request documents (ID proof, business proof and a small details file).
-- Private on purpose: there is no public read policy, so files can only be reached by the backend,
-- which gives the platform admin short-lived signed links. Only a bucket is created, no tables or columns change.
insert into storage.buckets (id, name, public, file_size_limit)
values ('store-request-docs', 'store-request-docs', false, 3145728)
on conflict (id) do update set public = false, file_size_limit = 3145728;


-- 11. Delivery partners (same as migrations/006-delivery-partners.sql)
-- 1. Riders. One row per delivery partner account (users.role = 'delivery_partner').
create table if not exists delivery_partners (
  id text primary key,
  user_id text unique not null references users(id),
  full_name text not null,
  email text not null,
  phone_number text not null,
  date_of_birth text,
  vehicle_type text,
  vehicle_number text,
  license_number text,
  license_expiry text,
  address_line text,
  area text,
  city text,
  pincode text,
  latitude double precision,
  longitude double precision,
  location_updated_at timestamptz,
  emergency_contact_name text,
  emergency_contact_phone text,
  upi_id text,
  documents jsonb not null default '{}',
  status text not null default 'draft',          -- draft | pending | approved | rejected | suspended
  review_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  is_online boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists delivery_partners_status_idx on delivery_partners (status);

-- 2. Cash a rider handed in and payouts made to them, recorded by a platform admin.
create table if not exists rider_settlements (
  id text primary key,
  rider_id text not null references delivery_partners(id),
  kind text not null,                             -- cash_deposit | payout
  amount numeric not null,
  note text,
  recorded_by text,
  created_at timestamptz not null default now()
);
create index if not exists rider_settlements_rider_idx on rider_settlements (rider_id);

-- 3. Delivery details on orders.
alter table orders
  add column if not exists rider_id text references delivery_partners(id),
  add column if not exists rider_offer_status text,          -- offered | accepted
  add column if not exists rider_offer_expires_at timestamptz,
  add column if not exists declined_rider_ids jsonb not null default '[]',
  add column if not exists delivery_code text,               -- 6 digits, shown only to the customer
  add column if not exists delivery_code_attempts integer not null default 0,
  add column if not exists pickup_code text,                 -- 4 digits, shown only to the store
  add column if not exists pickup_code_attempts integer not null default 0,
  add column if not exists ready_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists picked_up_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists delivery_photo_path text,
  add column if not exists cash_collected numeric,
  add column if not exists rider_earning numeric;
create index if not exists orders_rider_idx on orders (rider_id);
create index if not exists orders_fulfillment_status_idx on orders (fulfillment_status);

-- 4. Store pickup location, so each delivery goes to the nearest rider.
alter table stores
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

-- 5. Private bucket for rider documents and delivery proof photos (no public read policy on purpose).
insert into storage.buckets (id, name, public, file_size_limit)
values ('delivery-partner-files', 'delivery-partner-files', false, 5242880)
on conflict (id) do update set public = false, file_size_limit = 5242880;

-- 12. Order settlement (same as migrations/008-order-settlement.sql, without the carry-over)
alter table orders
  add column if not exists settled_at timestamptz,
  add column if not exists settled_by text,          -- store_owner | rider
  add column if not exists settlement_method text,   -- cash | upi | bank_transfer
  add column if not exists settlement_note text;

alter table rider_settlements
  add column if not exists order_id text;
create index if not exists rider_settlements_order_idx on rider_settlements (order_id);

-- 13. Store location (same as migrations/009-store-location.sql)
alter table stores
  add column if not exists address text,
  add column if not exists pincode text,
  add column if not exists max_delivery_radius_km numeric not null default 5,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;
