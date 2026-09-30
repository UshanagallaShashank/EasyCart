# EasyCart

Multi-tenant SaaS platform that lets small businesses create and operate their own online stores without writing code.

This README is the build entrypoint. `skill.md` defines coding standards, architecture, and phase goals — this file breaks Phase 1 down into subphases an AI agent can execute one at a time, in order, without additional planning. Do not start a subphase until the previous one is verified working.

---

## Routing model (decided — do not revisit without explicit request)

The app runs on a **single domain**. There are no per-merchant subdomains and no custom domains until Phase 11. All routing is path-based.

```text
yourapp.com/{slug}/...        → public storefront for tenant with this slug
yourapp.com/dashboard/...     → authenticated owner/merchant dashboard
yourapp.com/admin/...         → authenticated platform admin
yourapp.com/api/...           → REST API
yourapp.com/login             → auth
yourapp.com/register          → auth
```

### Reserved slugs

Merchant store slugs are user-chosen and must never collide with platform routes. Maintain a single reserved-slug list (`RESERVED_SLUGS`) in one shared constants file and validate every slug against it at creation time (registration, slug change) — not just at the router level.

Minimum reserved list to start: `admin`, `api`, `dashboard`, `login`, `logout`, `register`, `docs`, `static`, `assets`, `about`, `pricing`, `support`, `health`, `favicon.ico`.

This list must be extendable without a migration — it's a constant, not stored per-tenant.

### Tenant resolution

Two different resolution paths, because the URL slug is public and must never be trusted for privileged actions:

- **Public storefront routes** (`/{slug}/...`): a tenant-resolution middleware reads the `:slug` param, looks up the tenant by slug, attaches `req.tenant` (id, name, theme, status). If the tenant doesn't exist or is unpublished, 404 — don't leak existence.
- **Authenticated dashboard/admin routes** (`/dashboard/...`, `/admin/...`, and any authenticated API route): `tenantId` comes from the JWT claims attached at login, never from the URL or request body. This is already a hard rule in `skill.md` — the router layer must not weaken it by trusting a slug param on these routes.

### Routing implication for the API

`/api/...` is shared across all tenants. Public API endpoints that serve storefront data take `slug` in the path (`/api/stores/{slug}/products`) and resolve tenant the same way as the storefront. Authenticated API endpoints take no tenant identifier in the path — tenant comes from the JWT.

---

## Phase 1 — Foundation

Goal: multiple businesses can safely use the same application.

Do not build store creation, products, or anything from Phase 2+ inside this phase.

### 1.1 — Project scaffolding

- Initialize `backend/` (Node.js, Express, JavaScript ES Modules) and `frontend/` (React, TypeScript, Tailwind, React Router).
- Set up JS/TS configs, linting, and the layered folder structure from `skill.md`: `routes/ → middleware/ → controllers/ → services/ → db` (add `repositories/` once a feature actually needs one).
- Set up the database connection (`DB_PROVIDER=mongodb` or `DB_PROVIDER=supabase` in `.env`, see `.env.example`).
- Set up environment variable loading; no secrets committed.
- Verify: backend boots, connects to the configured database, health check route responds and returns 503 if the database is unreachable.

### 1.2 — Reserved slugs & shared constants

- Create the `RESERVED_SLUGS` constant in a shared backend location (`app/core/utils/` or equivalent per `skill.md`'s utils convention).
- Create a slug validator (format rules + reserved-list check) usable by both registration and any future slug-change flow.
- Verify: unit tests cover format rejection and reserved-word rejection.

### 1.3 — User model & authentication

- User schema: email, hashed password, role, tenantId (nullable for platform admins), timestamps.
- Register, login, JWT issuance (access token; refuse to over-build refresh-token rotation until it's actually needed).
- Password hashing per `skill.md` security rules.
- Zod validation at the API boundary for all auth endpoints.
- Verify: register → login → receive valid JWT, tested end to end with Supertest.

### 1.4 — Roles & authorization

- Define roles: platform admin, tenant owner (extend later if needed — don't pre-build staff/employee roles yet, that's not in Phase 1's scope per `skill.md`).
- Role-based authorization middleware, applied per-route.
- Verify: protected route rejects wrong-role and unauthenticated requests; accepts correct role.

### 1.5 — Tenant model & creation

- Tenant schema: name, slug (unique, validated via 1.2), owner userId, status (active/suspended), timestamps.
- Tenant creation flow tied to owner registration (an owner registers and creates exactly one tenant in Phase 1 — multi-store-per-owner is not in scope yet).
- Every tenant-owned collection going forward must carry `tenantId` per `skill.md`.
- Verify: creating a tenant with a reserved or duplicate slug fails; valid creation succeeds and links to the owner.

### 1.6 — Tenant resolution middleware

- Implement the two resolution paths described above: slug-based (public) and JWT-based (authenticated).
- Attach `req.tenant` / `req.tenantId` consistently so downstream controllers never re-derive it.
- Verify: a request to another tenant's authenticated route with a mismatched JWT is rejected; public slug lookup returns 404 for unknown/unpublished tenants.

### 1.7 — Basic owner dashboard shell

- `/dashboard` route (frontend), authenticated, role-gated to tenant owner.
- Shows tenant name and a placeholder "no store yet" state — no store-building features here, that's Phase 2.
- Centralized typed API client on the frontend per `skill.md` (no scattered fetch calls) — build it now since every later phase depends on it.
- Verify: logging in as an owner reaches the dashboard; logging in as a different tenant's owner cannot see this tenant's data.

### 1.8 — Basic platform admin shell (done, 2026-08-29 — extended beyond read-only)

- `/admin` route, authenticated, role-gated to platform admin (`RequireAdmin` guard; `/login` branches to `/admin` vs `/dashboard` by role after auth).
- Lists tenants (name, slug, status, owner email/username, published state, created date).
- Extended beyond the original read-only scope: admin can suspend/reactivate a tenant (`POST /api/admin/tenants/:id/suspend|reactivate`). Suspending sets `Tenant.status = 'suspended'`, which now overrides the owner's own publish toggle — both `get_public_store_by_slug` and the `resolve_public_tenant` middleware 404 a suspended tenant's storefront and checkout routes, same as an unpublished one.
- No admin self-registration UI exists on purpose. The first (and any) admin account is created via `backend/scripts/seed-admin.js`, run manually — see that file's header comment for usage.
- Verify: platform admin can view all tenants and cannot be routed to `/dashboard`; a tenant owner cannot reach `/admin`; suspending a tenant immediately hides its storefront from customers; reactivating restores it. Covered by `backend/tests/modules/admin/admin-tenants.test.js`.

### 1.9 — Phase 1 verification pass

- Full flow test: register owner → create tenant → login → reach dashboard; separately, platform admin logs in and sees the tenant list.
- Confirm tenant isolation holds under Supertest: cross-tenant reads/writes on any Phase 1 endpoint are rejected.
- Confirm no route collides with a reserved slug and no reserved slug is registrable.
- Only after this passes: move to Phase 2 (Store).

---

## Phase 4-5 — Shopping, Orders & Payments

Goal: customers can browse, purchase, and track orders; owners can fulfill them. Combined per `skill.md`'s Current Development Rule since they form one inseparable purchase lifecycle.

### 4.1 — Customer/role middleware fix

- Add `require_any_role`, `resolve_public_tenant` middleware alongside (not replacing) `require_role`/`resolve_tenant`.
- Verify: public storefront routes resolve tenant from slug without auth; customer-role routes reject tenant_owner tokens and vice versa.

### 4.2 — Customer accounts

- Customer registration/login reusing the users table with `role='customer'`, `tenant_id` always null.
- Verify: customer JWT is rejected by every tenant_owner-only route; customer login rejects a tenant_owner's credentials.

### 4.3 — Storefront product search, categories, product details

- Public GET endpoints under `/api/stores/:slug/...` returning only active products of published stores.
- Verify: unpublished/missing store 404s identically; inactive products never appear publicly.

### 4.4 — Checkout

- `POST /api/stores/:slug/checkout` takes cart items + payment_method, validates stock, creates an order.
- Verify: insufficient stock rejects before any mutation; cross-tenant product references rejected.

### 4.5 — Orders, order status, payment status

- Orders table/model with embedded snapshot line items; owner status/payment-status endpoints; customer order history across tenants.
- Verify: full MVP flow (register → store → product → publish → customer → checkout → order → status update → payment update → stock decremented) passes end to end in one test.

### 4.6 — Phase 4-5 verification pass

- Confirm tenant isolation on every new owner-facing order/product/category endpoint.
- Confirm a customer's order history correctly spans multiple tenants.
- Only after this passes: move to Phase 6 (Delivery).

---

## Phase 6 — Delivery

Goal: a shop can manage fulfillment after receiving an order.

Delivery data lives on the existing `Order` (no new top-level resource) — fulfillment is a property of an order, not a separate lifecycle. A new `fulfillment_status` field tracks delivery progress independently of the existing `status` (pending/confirmed/fulfilled/cancelled), since an order can be `confirmed` while its delivery is still `pending` dispatch.

### 6.1 — Fulfillment method & delivery address at checkout (done, 2026-09-14)

- Extended `checkout_schema`: `fulfillment_method: z.enum(['pickup', 'delivery']).default('pickup')` — defaults rather than being strictly required, so pre-Phase-6 clients that omit it still work (this was a real regression caught by the existing test suite and fixed before landing: making it required broke every pre-existing checkout test). `delivery_address` required only when `fulfillment_method === 'delivery'` via `.refine`.
- Both fields persisted on the order at creation (`Order` model + Supabase `orders` table `fulfillment_method`, `delivery_address` columns via `backend/migrations/001-phase6-delivery.sql`, additive-only, run against the live DB).
- Verified live (curl) and via `backend/tests/modules/orders/delivery-fulfillment.test.js`: pickup succeeds with no address; delivery with no address rejected 400; delivery with a valid address stores it verbatim.

### 6.2 — Delivery fee (done, 2026-09-14)

- Store settings extended with flat `delivery_fee` (numeric, owner-configurable via the store settings form, defaults to 0).
- Checkout adds the store's `delivery_fee` to `total` only when `fulfillment_method === 'delivery'`; the fee is snapshotted onto the order at checkout time, not read live, so later fee changes never retroactively affect existing orders.
- Verified live and in tests: delivery order total includes the fee; pickup order total does not.

### 6.3 — Delivery status & fulfillment lifecycle (done, 2026-09-14)

- `fulfillment_status` field on `Order`, two small per-method enums enforced server-side: `not_started → ready_for_pickup → picked_up` (pickup) or `not_started → dispatched → delivered` (delivery) — a pickup order can never receive a delivery-only status and vice versa.
- `PATCH /api/orders/:id/fulfillment-status`, owner-only, mirrors the existing status/payment-status endpoint pattern exactly.
- Verified live and in tests: valid transitions succeed; cross-method status rejected 400; cross-tenant update rejected 404 (same as existing order endpoints).

### 6.4 — Delivery assignment (done, 2026-09-14)

- `assigned_to` (free-text, nullable) on the order. No staff/employee accounts or roles — matches Phase 1's explicit deferral of that scope.
- `PATCH /api/orders/:id/assignment`, owner-only, independent of fulfillment status.
- Verified live and in tests: set/clear works; has no side effect on `fulfillment_status`; cross-tenant update rejected 404.

### 6.5 — Delivery tracking (customer-facing) (done, 2026-09-14)

- No new endpoint — `GET /my-orders/:id` already returns the full order including all Phase 6 fields.
- Frontend: owner order-detail page (`OrderStatusControls` extended with a per-method fulfillment-status select, new `OrderAssignmentField`) and checkout page (fulfillment-method picker, conditional delivery-address textarea, live fee breakdown) and customer order-detail page (read-only fulfillment badge + delivery/pickup summary) all built and type-checked.
- Live browser verification (Playwright) pending as part of 6.6.

### 6.6 — Phase 6 verification pass (done, 2026-09-14)

- Full flow verified via `delivery-fulfillment.test.js` and a real-browser Playwright walkthrough: checkout with delivery (address + fee) → owner dispatches → owner marks delivered → customer sees `delivered` on their order, with the correct address and fee. Separately covered in tests: checkout with pickup → owner marks ready → owner marks picked up.
- Tenant isolation confirmed on every new endpoint (fulfillment-status, assignment) — same 404-not-403 pattern as Phase 4-5.
- Full suite: 90/90 passing across 27 files, including all pre-existing Phase 1-5 tests unmodified.
- **Two real bugs found only by the live browser pass (not caught by unit tests) and fixed as part of this phase**, since they'd have silently broken exactly this feature for real users:
  1. `store_settings_schema`'s `logo_url`/`banner_url` used `z.string().url().optional()`, which rejects an empty string as an invalid URL. The settings form always sends `''` for an unset field, so saving *any* store setting — including the new delivery fee — failed with a 400 whenever logo/banner were blank, which is the common case. Fixed with `z.union([z.string().url(), z.literal('')]).optional()`.
  2. `get_public_store_by_slug` (used by the storefront and checkout) never returned `delivery_fee`, so checkout always computed a $0 delivery fee regardless of what the owner configured. Added `delivery_fee` to the public response and to the frontend's `PublicStore` type.
- Both fixes have regression tests (`store-settings.test.js`, `store-publish.test.js`).
- Phase 6 complete.

---

## Phase 7 — Customers & Marketing

Goal: help businesses retain and understand customers.

Three scoping decisions made up front (confirmed): (1) "a tenant's customers" are derived from order history — no new customer-tenant relationship table, since `orders` already links `customer_id` to `tenant_id` and a derived view can never drift out of sync; (2) coupons are a single flat-or-percent code per store with no expiry/usage-limit/product-restriction rules yet; (3) notifications and abandoned-cart detection are in-app only — no email/SMS provider integration in this phase.

### 7.1 — Customer management & history (owner-facing) (done, 2026-09-14)

- New module `tenant-customers` (mirrors `admin`'s shape — a service that reads across other tables without owning any, in its own module rather than overloading the existing `customers` auth module, which is a different concern: self-service registration/login). `GET /api/customers` derives the tenant's customers from `find_orders_by_tenant`, grouped in JS by `customer_id` (order count, lifetime total), joined to `users` for display fields via the existing `find_users_by_ids` batch lookup (no N+1, same pattern as the admin tenant list). `GET /api/customers/:id` reuses a new `find_orders_by_customer_and_tenant` repository function.
- Frontend: `/dashboard/customers` list page + `/dashboard/customers/:id` detail page, new "Customers" sidebar nav item, mirroring the existing products/orders pattern exactly.
- Verified in `tenant-customer-route.test.js` (6 tests): a tenant only sees customers who ordered from them; the same customer shows independently-computed stats across two tenants; empty list (not an error) with zero orders; cross-tenant customer lookup 404s; customer-role tokens rejected 403.

### 7.2 — Coupons (done, 2026-09-14)

- New `coupons` table/model: `id`, `tenant_id`, `code` (unique per tenant via a composite index, not globally — `unique(tenant_id, code)`), `discount_type` (`'flat' | 'percent'`), `discount_value`, `is_active`, `created_at`. Codes are stored uppercased and matched case-insensitively at checkout. Owner-only CRUD (`POST/GET/PATCH/DELETE /api/coupons`), same layered pattern as categories. Percent discounts over 100 are rejected at the schema level.
- Live migration `backend/migrations/002-phase7-coupons.sql` (additive, run against the production Supabase project) adds the `coupons` table and `coupon_code`/`discount_amount` columns on `orders`.
- Frontend: `/dashboard/coupons` page with a create dialog (code, flat/percent, value) and a table with activate/deactivate/delete actions, new "Coupons" sidebar nav item.
- Verified in `coupon-route.test.js` (4 tests): duplicate code within a tenant rejected 409; a different tenant can reuse the same code; deactivating/deleting is tenant-isolated (404 for a different tenant); percent > 100 rejected.

### 7.3 — Discounts at checkout (done, 2026-09-14)

- Checkout accepts an optional `coupon_code`. If present, resolves an active coupon for that tenant, computes the discount against the pre-delivery-fee subtotal (discount applies to goods, not the delivery fee), capped so a flat discount can never make the total negative, and stores `coupon_code`/`discount_amount` on the order (snapshotted — a coupon changed or deactivated later never alters an existing order's stored total, same principle as Phase 6's `delivery_fee`).
- An invalid/inactive/unknown/wrong-tenant code is a clean 400 before any order is created — no partial order, no silent no-op.
- Frontend: checkout page has an optional coupon-code field; owner and customer order-detail pages show the applied discount (`Coupon CODE: -$X.XX`) when present.
- Verified in `checkout-coupon.test.js` (7 tests): percent and flat discounts compute correctly; flat discount capped at zero; discount applied before delivery fee, not after; invalid/deactivated/cross-tenant codes rejected; checkout without a coupon still works, storing `null`/`0`.
- **A real bug was found and fixed during this step, unrelated to coupons themselves but exposed by testing at the database's current scale (230+ tenants accumulated from this session's testing)**: `find_stores_by_tenant_ids` and `find_users_by_ids` (added in Phase 1.8 and reused by 7.1's customer list) built a single Supabase `.in(...)` query with every id in the URL query string. Past roughly 200+ UUIDs this exceeds the ~16KB HTTP header limit and Supabase's client throws `HeadersOverflowError`, which surfaced as a 500 on `GET /api/admin/tenants` and would have hit `GET /api/customers` identically at scale. Fixed with a new `chunk_array` utility (`platform/shared/chunk-array.js`, unit-tested) that batches both queries into chunks of 100 ids, run in parallel and merged. This was not a coupons regression — it was a latent bug that any of this session's ID-batching code could have hit once the dataset grew large enough, and it happened to be caught here.

### 7.4 — Promotions (storefront-facing announcements)

- Smallest real version: a single optional `promotion_banner_text` field on the store (shown at the top of the storefront home page when set), owner-editable from store settings — not a separate scheduled-campaigns system. This directly reuses the Phase 6 pattern of "one flat field on the store, no new resource" rather than over-building.
- Verify: setting the banner text shows it on the public storefront; clearing it removes the banner; it has no effect on checkout or pricing (purely informational).

### 7.5 — Notifications (in-app)

- New `notifications` table/model: `id`, `tenant_id`, `type` (`'order_placed' | 'cart_abandoned'`), `message`, `is_read`, `created_at`. A notification row is created server-side whenever an order is placed for a tenant (hook into the existing `create_order`) — no new customer-facing behavior, purely owner-side.
- Owner endpoints: `GET /api/notifications` (list, most recent first), `PATCH /api/notifications/:id/read`.
- Frontend: a notification bell/list in the dashboard header, badge count for unread.
- Verify: placing an order creates exactly one notification for the correct tenant; marking read doesn't affect other tenants' notifications; a customer's own actions never create a notification visible to a different tenant.

### 7.6 — Abandoned carts (in-app detection)

- No new customer-facing tracking beyond what the cart already does client-side (Phase 4-5's `CartProvider`/`localStorage`). Detection is owner-side only: since there's no server-side cart state to inspect, "abandoned cart" in this phase means a registered customer who has browsed/added items but has zero orders in the last N days — a coarse proxy, explicitly not real cart-abandonment tracking (that would require persisting server-side cart state, which is out of scope here and would be a bigger, separate feature).
- One endpoint or scheduled query owners can view: customers-with-no-recent-orders, surfaced as a `cart_abandoned` notification type from 7.5's table, generated by a periodic check (a simple script run on a schedule, not a full job-queue system).
- Verify: a customer with a recent order is never flagged; a customer with no orders at all is never flagged (they were never a customer of this tenant to begin with, consistent with 7.1's derivation rule).

### 7.7 — Phase 7 verification pass

- Full flow test: customer orders from a store with an active coupon → discount applied correctly → owner sees the customer in their customer list with correct stats → owner sees an order-placed notification → coupon reused after deactivation is rejected.
- Confirm tenant isolation on every new endpoint (customers, coupons, notifications) — same pattern as every prior phase.
- Confirm existing Phase 1-6 tests still pass unmodified.
- Only after this passes: move to Phase 8 (Analytics).

---

## Phases 8–11

Defined in `skill.md` under "Development Phases." Do not subphase-break these yet — each gets its own subphase breakdown in this README when Phase 7 is verified complete and that phase actually starts. Building the breakdown for a future phase before the current one is done is out of scope (see `skill.md`'s "Current Development Rule").

---

## For the AI agent picking up this repo

1. Read `skill.md` in full first — it is the source of truth for standards, architecture, and security rules.
2. Read this README for the current phase's subphase breakdown.
3. Work one subphase at a time, in order. Do not skip ahead.
4. Each subphase's "Verify" line is the exit criteria — do not mark it done without it passing.
5. When a phase completes, update this README: mark it done, and write the next phase's subphase breakdown before starting implementation.
