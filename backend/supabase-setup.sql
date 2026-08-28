-- Run this once in your Supabase project's SQL Editor, top to bottom.

-- 1. Users table
-- Drops any existing users table first: the old table's id column was an
-- integer, but the app now uses text UUIDs for every id, so the column
-- type itself needs to change, not just be added to. Safe to drop since
-- there is no real user data yet.
drop table if exists users cascade;

create table users (
  id text primary key,
  username text unique not null,
  email text unique not null,
  phone_number text not null,
  password_hash text not null,
  role text not null default 'tenant_owner',
  tenant_id text,
  created_at timestamptz not null default now()
);

-- 2. Tenants table
drop table if exists tenants cascade;
create table tenants (
  id text primary key,
  name text not null,
  slug text unique not null,
  owner_id text not null references users(id),
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- 3. Stores table
drop table if exists stores cascade;
create table stores (
  id text primary key,
  tenant_id text unique not null references tenants(id),
  name text not null,
  slug text unique not null,
  logo_url text,
  banner_url text,
  theme text not null default 'default',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Categories table
drop table if exists categories cascade;
create table categories (
  id text primary key,
  tenant_id text not null references tenants(id),
  name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

-- 5. Products table
drop table if exists products cascade;
create table products (
  id text primary key,
  tenant_id text not null references tenants(id),
  category_id text references categories(id),
  name text not null,
  description text,
  price numeric not null,
  sku text not null,
  images jsonb not null default '[]',
  variants jsonb not null default '[]',
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, sku)
);

-- 6. Orders table
drop table if exists orders cascade;
create table orders (
  id text primary key,
  tenant_id text not null references tenants(id),
  customer_id text not null references users(id),
  items jsonb not null default '[]',
  total numeric not null,
  status text not null default 'pending',
  payment_status text not null default 'unpaid',
  payment_method text not null default 'cash_on_delivery',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
