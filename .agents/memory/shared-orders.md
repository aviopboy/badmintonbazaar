---
name: Shared order history
description: Cross-device order persistence and identity considerations for Badminton Bazaar
---

Orders must be persisted in the shared PostgreSQL-backed API rather than treated as browser-local history. Existing local order records should be imported idempotently when a signed-in session first syncs.

**Why:** Browser localStorage created separate mobile and desktop admin histories, so the admin could not reliably review every order.

**How to apply:** Keep order creation, review status changes, and account history reads routed through the shared order service. If authentication is later moved server-side, preserve the existing order IDs and ownership mapping during migration.