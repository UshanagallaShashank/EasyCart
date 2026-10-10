-- Phase 7 (Customers & Marketing): promotion banner field on stores.
-- Additive only — safe to run against the live database, no data loss.

alter table stores
  add column if not exists promotion_banner_text text;
