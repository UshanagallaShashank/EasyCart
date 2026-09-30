-- Phase 7 (Customers & Marketing): coupons + discount fields on orders.
-- Additive only — safe to run against the live database, no data loss.

create table if not exists coupons (
  id text primary key,
  tenant_id text not null references tenants(id),
  code text not null,
  discount_type text not null,
  discount_value numeric not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

alter table orders
  add column if not exists coupon_code text,
  add column if not exists discount_amount numeric not null default 0;
