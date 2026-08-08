# EasyCart Coding Standards

Tool-agnostic reference for anyone (human or AI) contributing to this repo. Applies to `backend/`, `frontend/`, and `eval/`. This file is the source of truth for EasyCart.

## File rules

- Max ~30 lines per file (code lines, not counting blank lines)
- Max ~15 lines per function
- One responsibility per file
- No two files share a filename anywhere in the repo
- No two functions share a name anywhere in the repo
- Shared/reused logic goes in a `utils/` folder local to its layer (`app/core/utils/`, `app/db/utils/`, etc.) — not duplicated across files
- Exactly one comment per file, placed at the top, stating what the file does — no docstrings, no inline comments, no per-function comments

## Naming

- JS/TS: kebab-case files, PascalCase components
- Functions: verb_noun (`get_user`, `create_order`)
- Constants: UPPER_SNAKE_CASE

## Git workflow

- Never push directly to `main`
- Branch naming: `feature/*`, `fix/*`, `refactor/*`, `docs/*`, `test/*`
- Conventional commits: `type(scope): description` (`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`)
- Keep commits atomic and focused

## Testing

- pytest for backend, Vitest for frontend
- Write tests for business logic, not framework glue

## Security

- Validate all inputs at the API boundary
- Secrets via environment variables only, never committed
- Tenant API keys Fernet-encrypted before touching the database
- HTTPS required in production


## Project

EasyCart is a multi-tenant SaaS platform that lets small businesses create and operate their own online stores without writing code.

Target businesses include:

* Boutiques
* Grocery stores
* Electronics shops
* Restaurants
* Local retailers

Each business gets an isolated store with its own products, customers, orders, inventory, payments, delivery, and analytics.

The long-term goal is to evolve EasyCart from an **online store builder** into a **small-business operating system**.

---

## Tech Stack

### Backend

* Node.js
* Express
* JavaScript (ES Modules)
* Database is provider-agnostic: MongoDB (Mongoose) or Supabase, selected at runtime via `DB_PROVIDER` in `.env`
* REST API
* JWT authentication
* Zod validation

### Frontend

* React
* TypeScript
* Tailwind CSS
* React Router
* TanStack Query when required

### AI

AI providers must remain configurable.

Supported providers may include:

* OpenAI
* Anthropic
* Gemini
* Mistral

Never hardcode the application to a single AI provider.

### Testing

* Vitest
* React Testing Library
* Supertest
* Tests run against a real (dev/test) database via `DB_PROVIDER` — MongoDB or Supabase

---

## Architecture

Use a simple layered architecture.

```text
Request
   ↓
Route
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Database (MongoDB or Supabase, via DB_PROVIDER)
```

* Routes define endpoints.
* Middleware handles authentication, authorization, validation, and tenant resolution.
* Controllers handle HTTP concerns only.
* Services contain business logic.
* Repositories contain database operations.
* Utils contain genuinely shared logic.

Frontend business logic belongs in hooks/services, not large React components.

---

## Multi-Tenancy

Multi-tenancy is a core requirement.

Every business is a tenant.

```text
EasyCart
 ├── Tenant A
 │    ├── Products
 │    ├── Customers
 │    ├── Orders
 │    └── Inventory
 │
 ├── Tenant B
 │    ├── Products
 │    ├── Customers
 │    ├── Orders
 │    └── Inventory
 │
 └── Tenant C
      ├── Products
      ├── Customers
      ├── Orders
      └── Inventory
```

Every tenant-owned document must contain `tenantId`.

Tenant identity must come from authenticated server-side context.

Never trust a client-supplied `tenantId`.

Every read, update, and delete operation must enforce tenant isolation.

---

## Coding Rules

* Max ~30 lines per file, excluding blank lines.
* Max ~15 lines per function.
* One responsibility per file.
* No duplicated business logic.
* Shared logic belongs in local `utils/`.
* One comment per file at the top describing its purpose.
* No inline comments or docstrings.
* TypeScript types required for function signatures.
* Functions use verb-noun naming.
* Constants use `UPPER_SNAKE_CASE`.
* React components use PascalCase.
* Files use kebab-case.
* Do not introduce unnecessary dependencies.
* Do not rewrite unrelated code.

---

## Backend Rules

* Async Express handlers.
* Zod validation at API boundaries.
* JWT authentication.
* Role-based authorization.
* Centralized error handling that distinguishes known errors (4xx) from unexpected ones (5xx), and logs the real error server-side either way.
* Specific error types only.
* Database access through repositories.
* Business logic through services.
* Never expose database errors to clients.
* Never access tenant data without tenant authorization.

---

## Frontend Rules

* Functional React components only.
* One component per file.
* Keep components focused on UI.
* Extract business logic into custom hooks.
* Use a centralized typed API client.
* No scattered `fetch` or Axios calls.
* Never expose private secrets in frontend code.

---

## Security

* Validate all inputs.
* Secrets only through environment variables or approved secret storage.
* Never commit `.env` files or secrets.
* Passwords must be securely hashed.
* Tenant API keys must be encrypted before database storage.
* HTTPS required in production.
* Configure CORS explicitly.
* Apply rate limiting to sensitive endpoints.
* Prevent NoSQL injection.
* Never expose tokens, credentials, or stack traces.

---

# Development Phases

Build EasyCart incrementally. Do not implement future phases unless explicitly requested.

## Phase 1 — Foundation

Build:

* Authentication
* Users
* Roles
* Tenant creation
* Tenant isolation
* Basic owner dashboard
* Basic platform admin

Goal:

> Multiple businesses can safely use the same application.

---

## Phase 2 — Store

Build:

* Store creation
* Store name
* Logo
* Banner
* Theme
* Store settings
* Store slug
* Publish/unpublish
* Store preview

Goal:

> A business owner can create and publish an online store without coding.

---

## Phase 3 — Products

Build:

* Products
* Categories
* Product images
* Pricing
* Variants
* SKU
* Inventory
* Stock adjustments
* Low-stock tracking

Goal:

> A business can manage its catalog and inventory.

---

## Phase 4 — Shopping

Build:

* Storefront
* Product search
* Categories
* Product details
* Cart
* Customer accounts
* Checkout

Goal:

> Customers can browse and purchase products.

---

## Phase 5 — Orders & Payments

Build:

* Orders
* Order status
* Payment abstraction
* Payment status
* Cash on delivery
* Inventory updates
* Order history

Goal:

> Complete the purchase lifecycle.

---

## Phase 6 — Delivery

Build:

* Customer pickup
* Shop delivery
* Delivery address
* Delivery fee
* Delivery status
* Delivery assignment
* Delivery tracking

Later support third-party delivery integrations.

Goal:

> A shop can manage fulfillment after receiving an order.

---

## Phase 7 — Customers & Marketing

Build:

* Customer management
* Customer history
* Coupons
* Discounts
* Promotions
* Notifications
* Abandoned carts

Goal:

> Help businesses retain and understand customers.

---

## Phase 8 — Analytics

Build:

* Sales analytics
* Order analytics
* Product performance
* Customer analytics
* Inventory insights

Goal:

> Give owners simple, useful business information.

---

## Phase 9 — AI

Build AI features only after the underlying business data is reliable.

Potential features:

* AI product descriptions
* AI product creation from images
* AI business insights
* AI inventory assistant
* AI recommendations

AI must use authorized tenant data and must not invent business metrics.

---

## Phase 10 — Conversational Commerce

Potential features:

* WhatsApp commerce
* AI product search
* AI customer support
* Conversational ordering
* AI-assisted product creation

Goal:

> Allow customers and owners to interact with their store conversationally.

---

## Phase 11 — SaaS

Build:

* Subscription plans
* Billing
* Usage limits
* Custom domains
* Platform analytics
* Tenant management

Goal:

> Turn EasyCart into a production SaaS platform.

---

# MVP

The MVP consists of:

```text
Phase 1 → Foundation
Phase 2 → Store
Phase 3 → Products
Phase 4 → Shopping
Phase 5 → Orders & Payments
```

The MVP must support:

```text
Owner registers
      ↓
Creates store
      ↓
Adds products
      ↓
Publishes store
      ↓
Customer visits
      ↓
Customer adds product
      ↓
Checkout
      ↓
Payment
      ↓
Order created
      ↓
Owner receives order
      ↓
Inventory updated
```

Do not build delivery, marketing, analytics, or AI before this flow is stable.

---

# Feature Development Process

Before implementing a feature:

1. Understand the requirement.
2. Identify affected entities.
3. Check tenant/security boundaries.
4. Inspect existing code.
5. Reuse existing abstractions.
6. Design the API.
7. Implement backend logic.
8. Add tests.
9. Implement frontend integration.
10. Test the complete flow.

Do not implement a feature only at the UI level.

---

# AI Coding Agent Rules

When modifying the repository:

* Inspect existing code before creating files.
* Follow the current architecture.
* Reuse existing utilities and services.
* Preserve tenant isolation.
* Do not implement future phases without being asked.
* Keep changes focused.
* Do not introduce unnecessary dependencies.
* Add tests for meaningful business logic.
* Never bypass authentication or authorization.
* Never expose secrets.
* If a requirement conflicts with security or tenant isolation, stop and report the conflict.

---

# Git Workflow

* Never push directly to `main`.
* Branches: `feature/*`, `fix/*`, `refactor/*`, `docs/*`, `test/*`.
* Use conventional commits.
* Keep commits atomic and focused.
* Never commit secrets.
* Push commits as `ushanagallashashank@gmail.com`.

---

# Definition of Done

A feature is complete when:

```text
Business logic
      +
API
      +
Validation
      +
Authorization
      +
Tenant isolation
      +
Database handling
      +
Frontend
      +
Tests
      +
Error handling
```

AI features additionally require evaluation fixtures and measurable evaluation results.

---

# Current Development Rule

Always work on the **current phase only**.

Do not build the entire roadmap upfront.

When starting a new phase:

```text
Understand
   ↓
Design
   ↓
Implement
   ↓
Test
   ↓
Verify
   ↓
Move to next phase
```

The architecture should remain simple enough to evolve from an online store builder into a complete small-business operating system.
