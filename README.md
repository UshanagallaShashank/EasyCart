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

- Initialize `backend/` (Node.js, Express, TypeScript) and `frontend/` (React, TypeScript, Tailwind, React Router).
- Set up TypeScript configs, linting, and the layered folder structure from `skill.md`: `routes/ → middleware/ → controllers/ → services/ → repositories/ → db`.
- Set up MongoDB connection (Mongoose) with a separate test database for Vitest/Supertest.
- Set up environment variable loading; no secrets committed.
- Verify: backend boots, connects to MongoDB, health check route responds.

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

### 1.8 — Basic platform admin shell

- `/admin` route, authenticated, role-gated to platform admin.
- Lists tenants (name, slug, status, owner) — read-only for Phase 1.
- Verify: platform admin can view all tenants; a tenant owner cannot reach `/admin`.

### 1.9 — Phase 1 verification pass

- Full flow test: register owner → create tenant → login → reach dashboard; separately, platform admin logs in and sees the tenant list.
- Confirm tenant isolation holds under Supertest: cross-tenant reads/writes on any Phase 1 endpoint are rejected.
- Confirm no route collides with a reserved slug and no reserved slug is registrable.
- Only after this passes: move to Phase 2 (Store).

---

## Phases 2–11

Defined in `skill.md` under "Development Phases." Do not subphase-break these yet — each gets its own subphase breakdown in this README when Phase 1 is verified complete and that phase actually starts. Building the breakdown for a future phase before the current one is done is out of scope (see `skill.md`'s "Current Development Rule").

---

## For the AI agent picking up this repo

1. Read `skill.md` in full first — it is the source of truth for standards, architecture, and security rules.
2. Read this README for the current phase's subphase breakdown.
3. Work one subphase at a time, in order. Do not skip ahead.
4. Each subphase's "Verify" line is the exit criteria — do not mark it done without it passing.
5. When a phase completes, update this README: mark it done, and write the next phase's subphase breakdown before starting implementation.
