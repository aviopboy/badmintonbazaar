---
name: Email provider
description: Badminton Bazaar uses formsubmit.co (not EmailJS) for all email sending.
---

## Rule
All email sending uses formsubmit.co via fetch to `https://formsubmit.co/ajax/{email}`.
Do NOT add EmailJS back. The `@emailjs/browser` package can be removed if cleaning up.

## Only env var needed
`VITE_FOUNDER_EMAIL` — the founder/admin Gmail or email that receives order notifications.
Set in Replit Secrets panel.

## How it works
- New order → POST to VITE_FOUNDER_EMAIL, `_replyto: customerEmail` (founder can reply to customer)
- Status update (approve/reject) → POST to VITE_FOUNDER_EMAIL, `_cc: customerEmail` (both receive it)

**Why:** formsubmit.co requires only one-time activation per email address. Using _cc for customer
avoids needing activation for every unique customer email. EmailJS was replaced because it required
three separate API key secrets that the user hadn't configured.

## First-time setup
The very first order triggers a formsubmit.co activation email to VITE_FOUNDER_EMAIL.
Founder must click the link in that email. All subsequent emails deliver automatically.
