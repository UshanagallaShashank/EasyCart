-- 011: online payment reference, rating photos and item stars, refunds, and platform settings (shop themes).
-- Additive only: new columns with safe defaults and new tables. No drops, no changes to existing rows.
-- Safe to run on the live database, and safe to run twice.

-- The payment company's id for an online payment, needed to send a refund back.
alter table orders add column if not exists payment_reference text;

-- Ratings can carry up to 3 photos, and stars for each product in the order ({ "product id": 1-5 }).
alter table order_ratings
  add column if not exists photo_urls jsonb not null default '[]'::jsonb,
  add column if not exists item_stars jsonb not null default '{}'::jsonb;

-- A customer's request for money back on an order, and what the store decided.
create table if not exists refunds (
  id text primary key,
  order_id text not null references orders(id) on delete cascade,
  tenant_id text not null references tenants(id),
  customer_id text not null references users(id),
  amount numeric not null check (amount > 0),
  reason text not null,
  photo_urls jsonb not null default '[]'::jsonb,
  -- requested -> refunded or rejected (or failed if the payment company refused the refund)
  status text not null default 'requested',
  -- online: sent back to the card or UPI; cash: handed back by the store
  method text,
  provider_refund_id text,
  decided_by text,
  decision_note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index if not exists refunds_tenant_idx on refunds (tenant_id, created_at desc);
create index if not exists refunds_customer_idx on refunds (customer_id, created_at desc);
-- At most one open request per order at a time.
create unique index if not exists refunds_one_open_per_order on refunds (order_id) where status = 'requested';

-- Small platform-wide settings the admin controls, such as which shop themes owners may pick.
create table if not exists platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
