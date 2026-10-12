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

## Look and feel

Clean and airy: white pages, soft grey-filled cards with no borders or heavy shadows, pill-shaped buttons,
the **Plus Jakarta Sans** font, quiet headers (just the page name), and a dark floating tab bar where a bubble in the
area's colours slides to the active tab. All tokens live in `src/theme/theme.ts`.

Each area has its own colours, so you always know where you are: customers and store owners see their shop's theme,
delivery partners see **Electric** (indigo to cyan) and admins see **Cosmos** (violet to pink to amber).
Every theme has a multi-colour gradient (`mesh` in `src/theme/brands.ts`) used on banners, main buttons and the tab bubble.
Products without a photo show a soft tile with their initials. Buttons, tabs and toasts give a small buzz on phones
(`src/lib/feedback.ts`); toasts on phones use **sonner-native**.

## Downtime, logs and optional features

Everything here is free (no trials, no card) and switched off until you set it.

| Feature | How to switch it on |
|---|---|
| **Downtime banner** | Always on. When the server stops answering, a banner shows "away 0:42" with Retry, then "Back online". |
| **System status** (admin → More) | Always on. Server uptime, answer time, outages this phone has seen, which features are on. |
| **Outage history while nobody is using the app** | Add a free monitor for `https://<your-backend>/api/health` on Better Stack Uptime or UptimeRobot. |
| **Outside logs** | Create two "Logs" sources on Better Stack's free plan: one for the backend (`LOG_INGEST_URL` / `LOG_INGEST_TOKEN` in `backend/.env`), one for this app (`EXPO_PUBLIC_LOG_INGEST_URL` / `EXPO_PUBLIC_LOG_INGEST_TOKEN`). Entries carry `app: backend` or `app: mobile`. Only warnings, errors and slow requests are sent; never passwords, tokens or bodies. |
| **Offline copy (SQLite)** | `EXPO_PUBLIC_OFFLINE_CACHE=true`. Phones only. Needs a development build (`npx expo run:ios`), not Expo Go. |
| **AI product descriptions** | Backend: `AI_ENABLED=true`, `GEMINI_API_KEY=...` (free Google AI Studio key). The "Write with AI" button then appears on the owner's product page. |

## UX and responsiveness tests (Playwright)

The tests run the web build of the app at phone, small-phone, tablet and desktop sizes. Every server call is answered by a fake
(`e2e/mock-api.ts`), so they never touch the real backend or database.

```bash
npm run e2e:build     # build the web version against the fake server address
npm run e2e           # run the tests (first time: npx playwright install chromium)
npm run e2e:report    # open the HTML report
# The screen tour also saves a screenshot of every screen to e2e/.screens/<size>/ for review.
```

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
