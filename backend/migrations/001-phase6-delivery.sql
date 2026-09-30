-- Phase 6 (Delivery): additive columns only. Safe to run against the live
-- database — no drops, no data loss. Existing rows get sane defaults
-- (pickup / not_started) so old orders remain valid under the new schema.

alter table stores
  add column if not exists delivery_fee numeric not null default 0;

alter table orders
  add column if not exists fulfillment_method text not null default 'pickup',
  add column if not exists delivery_address text,
  add column if not exists delivery_fee numeric not null default 0,
  add column if not exists fulfillment_status text not null default 'not_started',
  add column if not exists assigned_to text;
