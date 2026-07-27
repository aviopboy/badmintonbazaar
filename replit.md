# Badminton Bazaar

A dark, sporty badminton gear storefront inspired by racketrush.in — with catalog, accounts, cart, and a full admin panel. Catalog preferences remain browser-local (localStorage), while orders are synced through the shared PostgreSQL-backed API so account history is available across devices. Email notifications are sent through formsubmit.co when a customer submits payment proof at checkout.

## Run & Operate

- Workflow: **Badminton Bazaar** — `PORT=26050 BASE_PATH=/ pnpm --filter @workspace/badminton-bazaar run dev`
- Workflow: **API Server** — `PORT=8080 pnpm --filter @workspace/api-server run dev`
- `pnpm --filter @workspace/badminton-bazaar run typecheck` — typecheck the storefront
- `pnpm --filter @workspace/api-server run typecheck` — typecheck the API
- `pnpm run typecheck` — full workspace typecheck

## Accounts

- Admin access is intentionally not displayed in the public storefront.
- Any registered user email + password they chose at sign-up

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React + Vite, Tailwind CSS, lucide-react
- Browser-local state (localStorage) for catalog/preferences, plus an Express/PostgreSQL order service for shared account history
- No Shopify or other hosted commerce platform

## Where things live

- `artifacts/badminton-bazaar/src/App.tsx` — entire app: storefront, auth, cart, account, admin
- `artifacts/badminton-bazaar/src/index.css` — dark sporty theme (racketrush.in aesthetic)
- `artifacts/badminton-bazaar/.replit-artifact/artifact.toml` — artifact & workflow config

## Features

### Storefront
- Dark hero ("UNLEASH ABSOLUTE POWER") with optional admin-set background image
- Scrolling "100% ORIGINAL & VERIFIED PRODUCTS" ticker
- Category quick-links (Rackets, Shoes), New Arrivals / Top Picks section
- Full product grid with filters, sort, search, wishlist, and product badges

### Products
- **Rackets:** ASTROX 100 ZZ (Yonex ₹16,990), NANOFLARE 1000 Z (Yonex ₹15,490), AXFORCE CANON (Li-Ning ₹12,490), AXFORCE 100 (Li-Ning ₹10,990)
- **Shoes:** Power Cushion 65 Z3 (Yonex ₹9,990), Aerus Z2 (Yonex ₹8,490), Ranger Lite (Li-Ning ₹4,990), A970 (Victor ₹7,290)

### Accounts
- Sign in / Register modal with password show/hide toggle
- Account page: change email, change password
- Auth gate before checkout
- Order history is loaded by account email from the shared database, so it is available on mobile and PC

### Admin Panel
- **Products tab:** list, add, edit, delete; change price and compare-at price; badge label
- **Users tab:** list all users, add new user (with/without admin access), toggle admin, delete user
- **Settings tab:** set custom hero background image URL
- **Image picker in product editor:** verified official-brand racket images appear for mapped products; other products accept a real manufacturer or retailer image URL
- **Optional showcase media:** admins can add a YouTube video or second product image URL to any product
- **Category slots:** Rackets, Shoes, Shuttlecocks, Strings, Grips, Kit Bags, Apparel, Socks, Accessories, Wristbands, Injury Support, Training & Fitness, Court Equipment, Stringing Tools, Recovery & Nutrition

## Email notifications (EmailJS)

When a customer submits payment proof at checkout, an invoice email is automatically sent to the founder's email address through formsubmit.co. Customer status updates are CC'd to the customer.

Set `VITE_FOUNDER_EMAIL` in Replit Secrets and restart the Badminton Bazaar workflow after changing it. If it is not set, checkout still saves the shared order and logs a warning while skipping the notification.

### Files
- `artifacts/badminton-bazaar/src/lib/email.ts` — founder notification and customer status email mapping

## Shared orders

- Orders are stored in the `bb_orders` PostgreSQL table through `artifacts/api-server`.
- `GET /api/orders` returns the admin order list; `GET /api/orders?email=...` returns an account's order history.
- `POST /api/orders` creates an order and is idempotent by order ID, which imports existing browser-local orders once.
- `PATCH /api/orders/:id` stores admin approval/rejection status and review messages.
- The storefront refreshes shared orders every 15 seconds while signed in.

## Architecture decisions

- Browser-local catalog/preferences keep the storefront lightweight; orders use PostgreSQL so admin and customer histories stay synchronized across devices
- Racket imagery uses official Yonex and Li-Ning product image hosts where mapped; placeholders remain only as broken-image fallbacks
- Checkout stays blocked until a real payment provider is connected; it never claims a local/demo order was paid

## User preferences

- Keep the brand name **Badminton Bazaar** and logo letter **B**
- Do not use Shopify or any other hosted commerce platform
- Push to GitHub after every fix

## Gotchas

- Vite build requires `PORT` and `BASE_PATH` env vars — the workflow sets both
- localStorage is keyed `bb-products-v3` and `bb-users-v2` (v3 to avoid conflicts with old demo data)
- Admin u-admin cannot be deleted or have admin revoked from the UI
