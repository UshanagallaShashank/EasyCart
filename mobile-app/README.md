# EasyCart mobile app

The EasyCart phone app (iOS, Android, and web for testing), built with Expo and React Native.
It talks to the **same backend and the same Supabase database** as the website, and uses the same sky-blue look.

One app, four roles. Signing in opens the right area:

| Role | What they can do |
|---|---|
| Customer | Browse a shop, search, sizes/options, cart, checkout (delivery with GPS pin, or pickup), coupons, orders, live delivery tracking with the secret delivery code, cancel |
| Delivery partner | Sign up, application (details, vehicle, GPS base location, documents by camera or gallery), go online, new-order offers with a buzz and countdown, pickup code, handover (customer code + door photo + exact cash), history, earnings, settle cash with stores |
| Store owner | Overview, orders (confirm, ready for pickup, cancel), send for delivery, pickup code, rider and proof photo, cash from riders, nearby partners, quick stock changes |
| Admin | Platform numbers, delivery partner review (documents, approve/reject/suspend), stores (suspend/reactivate), all deliveries |

Screens refresh by themselves: the app listens to the backend's live updates (the same stream the website uses),
refreshes when it comes back to the foreground, and every minute as a backup.

## Run it

1. Start the backend (`cd backend && npm run dev`). It must use Supabase with the migrations in `backend/migrations` applied.
2. Configure the app:
   ```bash
   cd mobile-app
   cp .env.example .env
   # EXPO_PUBLIC_API_URL: the backend address the PHONE can reach, e.g. http://192.168.1.20:5000 (not localhost)
   npm install
   ```
3. Start Expo and open it:
   ```bash
   npx expo start          # scan the QR code with Expo Go, or press a (Android) / i (iOS) / w (web)
   ```
   Camera, location and secure storage are standard Expo modules, so Expo Go works; no custom native build is needed.

Before shipping: `npx tsc --noEmit` (types), and `npx expo export --platform web` (checks the bundle builds).
Store builds go through EAS: `npx eas-cli@latest build`.

## Sample data

`seed/` creates a small, fixed data set in Supabase:
**1 shop** (Green Leaf Market, with its owner), **10 products**, **2 customers**, **2 delivery partners** (approved), **3 orders**
(one delivered, one out for delivery, one just placed).

```bash
cd mobile-app/seed
npm install
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed   # or put both in backend/.env
```

It only inserts rows that are not there yet (fixed ids, and it skips any email or username already taken),
so running it again never adds or changes anything. All sample accounts use the password `EasyCart@123`:

| Role | Email |
|---|---|
| Store owner | owner@greenleaf.easycart.app |
| Customer | asha@easycart.app, vikram@easycart.app |
| Delivery partner | ravi@easycart.app, priya@easycart.app |

Create an admin with the website's admin sign-up (needs `ADMIN_SIGNUP_PASSCODE`).

## Layout

```
src/app/          screens (Expo Router: every file is a route)
  login, register, rider-register
  shop/           customer      rider/   delivery partner
  owner/          store owner   admin/   platform admin
src/components/   shared UI (cards, buttons, inputs, badges, toasts, navigation)
src/features/     per-area data hooks and pieces
src/lib/          API client, session, live updates, formatting, phone camera/GPS
src/theme/        colours, spacing and text styles (the website's palette)
src/types/        data shapes, shared with the website
```
