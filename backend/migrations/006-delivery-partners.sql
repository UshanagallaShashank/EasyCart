-- Delivery partners (riders). Additive only: new tables, new nullable columns, a private bucket.
-- Safe to run against the live database; existing rows keep working unchanged.
-- Run once in the Supabase SQL editor.

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
  add column if not exists longitude double precision,
  add column if not exists address_line text;

-- 5. Private bucket for rider documents and delivery proof photos (no public read policy on purpose).
insert into storage.buckets (id, name, public, file_size_limit)
values ('delivery-partner-files', 'delivery-partner-files', false, 5242880)
on conflict (id) do update set public = false, file_size_limit = 5242880;
