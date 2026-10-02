-- A customer can drop a pin on the map for their delivery address.
-- Additive only: both columns are optional, so existing orders and orders placed without a pin are unaffected.
alter table orders
  add column if not exists delivery_latitude numeric,
  add column if not exists delivery_longitude numeric;
