-- Lets a shop waive its delivery fee above an order amount it chooses ("Free delivery over Rs. 499").
-- Additive and safe: one new, empty, optional column. Nothing existing changes; until an owner sets an amount,
-- every order keeps paying the normal delivery fee. Safe to run more than once.
alter table stores add column if not exists free_delivery_above numeric;

-- An amount, when set, must not be negative.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stores_free_delivery_above_not_negative') then
    alter table stores add constraint stores_free_delivery_above_not_negative check (free_delivery_above is null or free_delivery_above >= 0);
  end if;
end $$;
