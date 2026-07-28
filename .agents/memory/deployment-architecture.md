---
name: Deployment Architecture
description: How Badminton Bazaar is hosted — Vercel API, Vercel/Cloudflare frontend, Neon DB, and what to do for schema or env changes.
---

# Deployment Architecture

## Services

| Layer | URL | Notes |
|---|---|---|
| API (Vercel Project 1) | https://badmintonbazaar-api-server.vercel.app | `DATABASE_URL` = Neon, set in Vercel env |
| Frontend (Vercel Project 2) | https://badmintonbazaar-api-frontend.vercel.app | `VITE_API_URL` = Vercel API URL, set in Vercel env |
| Production storefront | https://badmintonbazaar.shop | Cloudflare Pages, custom domain |
| Dev database | Replit local PostgreSQL (`DATABASE_URL`) | Only used in this Replit workspace |
| Production database | Neon PostgreSQL (`NEON_DATABASE_URL`) | Shared by Vercel and optionally Replit |

## Rules

**Schema changes:** Run `DATABASE_URL=$NEON_DATABASE_URL pnpm --filter db push` to push schema to Neon. Then tell the user to redeploy Vercel Project 1.

**New VITE_ env vars:** Must be added to Vercel Project 2 env vars AND redeployed — they are baked in at build time, not runtime.

**New API env vars:** Add to Vercel Project 1 env vars, redeploy Project 1.

**Why:** User manages Vercel/Cloudflare deployments manually; agent only handles code and schema. Agent should never construct Vercel/Cloudflare deploy commands — just tell the user what env var to set and which project to redeploy.
