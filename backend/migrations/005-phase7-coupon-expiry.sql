-- Phase 7: Add expiry date to coupons table.
-- Additive only — safe to run against live database, no data loss.

alter table coupons
  add column if not exists expires_at timestamptz;
