# Badminton Bazaar

A self-contained badminton gear storefront demo with local catalog, account, cart, and admin controls.

## Run & Operate

- `pnpm --filter @workspace/badminton-bazaar run dev` — run the storefront (the managed workflow supplies `PORT` and `BASE_PATH`)
- `pnpm --filter @workspace/badminton-bazaar run typecheck` — typecheck the storefront
- `PORT=26050 BASE_PATH=/ pnpm --filter @workspace/badminton-bazaar run build` — build the storefront locally
- `pnpm run typecheck` — full typecheck across all packages
- The storefront persists demo catalog, accounts, cart, favorites, and preferences in browser localStorage.
- Demo admin login: `avilit9@gmail.com` / `admin` (intentionally browser-local demo credentials, not production authentication).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React + Vite, Tailwind CSS, lucide-react
- Browser-local demo state; no Shopify, payment provider, or external commerce dependency

## Where things live

- `artifacts/badminton-bazaar/src/App.tsx` — storefront, catalog state, auth, cart, account, and admin flows
- `artifacts/badminton-bazaar/src/index.css` — Badminton Bazaar visual theme and responsive layout
- `artifacts/badminton-bazaar/.replit-artifact/artifact.toml` — root web artifact and managed workflow

## Architecture decisions

- The first version is intentionally browser-local so the complete shopping/admin interaction can be explored without provisioning commerce services.
- Product image lookup is a curated local candidate picker rather than a live image API; it works without API keys and avoids silently copying third-party images.
- The seeded administrator is clearly presented as a demo account and should be replaced with server-backed authentication before handling real users or payments.

## Product

- Browse and search rackets and shoes with INR pricing, filters, sorting, favorites, product details, and a cart.
- Register/sign in, update account email/password, and pass an auth gate before checkout.
- Admins can manage users, product records, prices, product image candidates, and storefront background treatments.

## User preferences

- Keep the brand name Badminton Bazaar and the logo as the letter B for now.
- Do not use Shopify or another hosted commerce platform.

## Gotchas

- The Vite build config requires `PORT` and `BASE_PATH`; use the managed workflow or set both for manual builds.
- The demo admin password is intentionally simple at the user's request; do not treat this localStorage implementation as production auth.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
