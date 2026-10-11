-- Customer favourites (saved products) and order ratings (store + delivery), for the mobile and web apps.
-- Additive only: new tables, no drops, no changes to existing rows. Safe to run on the live database, and safe to run twice.

-- A customer's saved products, one row per customer and product.
create table if not exists favourites (
  id text primary key,
  tenant_id text not null references tenants(id),
  customer_id text not null references users(id),
  product_id text not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

create index if not exists favourites_customer_idx on favourites (customer_id, tenant_id);

-- One rating per order from the customer: how the store and the delivery were, 1 to 5 stars.
create table if not exists order_ratings (
  id text primary key,
  order_id text unique not null references orders(id) on delete cascade,
  tenant_id text not null references tenants(id),
  customer_id text not null references users(id),
  rider_id text,
  store_stars integer check (store_stars between 1 and 5),
  delivery_stars integer check (delivery_stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists order_ratings_tenant_idx on order_ratings (tenant_id, created_at desc);
