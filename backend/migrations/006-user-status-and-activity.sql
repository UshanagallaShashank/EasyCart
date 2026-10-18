-- Add status and last_active_at to users table.
-- Additive only — safe to run against live database, no data loss.

alter table users
  add column if not exists status text not null default 'active',
  add column if not exists last_active_at timestamptz default now();
