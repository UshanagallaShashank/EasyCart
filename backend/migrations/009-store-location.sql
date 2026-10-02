-- Store address, pincode, delivery radius and map location, used by the storefront (who can order delivery)
-- and by rider dispatch (nearest rider to the store). Additive only.
-- Without these columns the app keeps the values in server memory, which is lost on every restart.
alter table stores
  add column if not exists address text,
  add column if not exists pincode text,
  add column if not exists max_delivery_radius_km numeric not null default 5,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

-- Copy the address from the earlier delivery migration, if it was run.
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'stores' and column_name = 'address_line') then
    update stores set address = address_line where address is null and address_line is not null;
  end if;
end $$;
