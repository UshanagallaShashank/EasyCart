-- Settling a delivered cash order between rider and store is now saved on the order itself,
-- and each ledger row in rider_settlements points at its order. Additive only.
alter table orders
  add column if not exists settled_at timestamptz,
  add column if not exists settled_by text,          -- store_owner | rider
  add column if not exists settlement_method text,   -- cash | upi | bank_transfer
  add column if not exists settlement_note text;

alter table rider_settlements
  add column if not exists order_id text;
create index if not exists rider_settlements_order_idx on rider_settlements (order_id);

-- Carry over settlements made before this change, which kept the order id inside the note as "[order:<id>|...|mode:<method>]".
update rider_settlements
set order_id = substring(note from '\[order:([A-Za-z0-9_-]+)')
where order_id is null and note like '%[order:%';

update orders o
set settled_at = s.created_at,
    settled_by = case when s.note ilike '%rider%' then 'rider' else 'store_owner' end,
    settlement_method = coalesce(substring(s.note from '\|mode:([A-Za-z0-9_-]+)\]'), 'cash')
from (
  select distinct on (order_id) order_id, created_at, note
  from rider_settlements
  where order_id is not null
  order by order_id, created_at
) s
where o.id = s.order_id and o.settled_at is null;
