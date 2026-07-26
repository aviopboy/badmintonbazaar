# Badminton Bazaar

A dark, sporty badminton gear storefront inspired by racketrush.in — with catalog, accounts, cart, and a full admin panel. All data is browser-local (localStorage); no external commerce services or API keys needed.

## Run & Operate

- Workflow: **Badminton Bazaar** — `PORT=26050 BASE_PATH=/ pnpm --filter @workspace/badminton-bazaar run dev`
- `pnpm --filter @workspace/badminton-bazaar run typecheck` — typecheck the storefront
- `pnpm run typecheck` — full workspace typecheck

## Accounts

- Admin access is intentionally not displayed in the public storefront.
- Any registered user email + password they chose at sign-up

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React + Vite, Tailwind CSS, lucide-react
- Browser-local state (localStorage) — no backend, no DB, no Shopify

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

### Admin Panel
- **Products tab:** list, add, edit, delete; change price and compare-at price; badge label
- **Users tab:** list all users, add new user (with/without admin access), toggle admin, delete user
- **Settings tab:** set custom hero background image URL
- **Image picker in product editor:** verified official-brand racket images appear for mapped products; other products accept a real manufacturer or retailer image URL
- **Optional showcase media:** admins can add a YouTube video or second product image URL to any product
- **Category slots:** Rackets, Shoes, Shuttlecocks, Strings, Grips, Kit Bags, Apparel, Socks, Accessories, Wristbands, Injury Support, Training & Fitness, Court Equipment, Stringing Tools, Recovery & Nutrition

## Architecture decisions

- Fully browser-local so the complete shopping/admin interaction works without provisioning services
- Racket imagery uses official Yonex and Li-Ning product image hosts where mapped; placeholders remain only as broken-image fallbacks
- Checkout stays blocked until a real payment provider is connected; it never claims a local/demo order was paid

## User preferences

- Keep the brand name **Badminton Bazaar** and logo letter **B**
- Do not use Shopify or any other hosted commerce platform

## Gotchas

- Vite build requires `PORT` and `BASE_PATH` env vars — the workflow sets both
- localStorage is keyed `bb-products-v3` and `bb-users-v2` (v3 to avoid conflicts with old demo data)
- Admin u-admin cannot be deleted or have admin revoked from the UI
