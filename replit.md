# Badminton Bazaar

A dark, sporty badminton gear storefront inspired by racketrush.in — with catalog, accounts, cart, and a full admin panel. Catalog preferences remain browser-local (localStorage), while orders are synced through the shared PostgreSQL-backed API so account history is available across devices. Email notifications are sent through formsubmit.co when a customer submits payment proof at checkout.

## Run & Operate

- Workflow: **Badminton Bazaar** — `PORT=26050 BASE_PATH=/ pnpm --filter @workspace/badminton-bazaar run dev`
- Workflow: **API Server** — `PORT=8080 pnpm --filter @workspace/api-server run dev`
- `pnpm --filter @workspace/badminton-bazaar run typecheck` — typecheck the storefront
- `pnpm --filter @workspace/api-server run typecheck` — typecheck the API
- `pnpm run typecheck` — full workspace typecheck

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- React + Vite, Tailwind CSS, lucide-react
- Browser-local state (localStorage) for catalog/preferences, plus an Express/PostgreSQL order service for shared account history
- Drizzle ORM with `@workspace/db` shared library
- No Shopify or other hosted commerce platform

## Where things live

- `artifacts/badminton-bazaar/src/App.tsx` — entire app: storefront, auth, cart, account, admin
- `artifacts/badminton-bazaar/src/index.css` — dark sporty theme
- `artifacts/api-server/src/routes/` — API routes (orders, users, health)
- `lib/db/` — shared Drizzle schema + PostgreSQL connection
- `lib/api-spec/` — OpenAPI spec
- `lib/api-zod/` — generated Zod validators
- `lib/api-client-react/` — generated React Query hooks

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required for API server; already set)
- `SESSION_SECRET` — session signing secret (already set)
- `VITE_FOUNDER_EMAIL` — founder email for order notifications via formsubmit.co (optional; checkout works without it but skips email)

## Accounts

- Admin access is intentionally not displayed in the public storefront
- Any registered user email + password they chose at sign-up

## User preferences

- Keep the brand name **Badminton Bazaar** and logo letter **B**
- Do not use Shopify or any other hosted commerce platform
- Push to GitHub after every fix
