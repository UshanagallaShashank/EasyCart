-- Phase 7 (Customers & Marketing): notifications table.
-- Additive only — safe to run against the live database, no data loss.

create table if not exists notifications (
  id text primary key,
  tenant_id text not null references tenants(id),
  type text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
