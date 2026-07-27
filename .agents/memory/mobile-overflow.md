---
name: Mobile overflow fix
description: How the horizontal swipe black screen on mobile was fixed.
---

## Rule
Always set `overflow-x: hidden` AND `overscroll-behavior-x: none` on both `html` and `body`.
Without these, any element that briefly overflows (animated ticker, absolute-positioned dropdowns,
hero racket art with right: -20px) causes the entire page to be horizontally scrollable, showing
the black body background when the user swipes.

## What was fixed
- Added `overflow-x: hidden; max-width: 100%; overscroll-behavior-x: none` to html and body
- Changed `.nav-search-dropdown` from `position: absolute; width: 340px` to `position: fixed; left: 0; right: 0; width: 100%` — prevents it from overflowing on narrow screens
- Changed `.hero-racket-art` to `display: none` below 900px (was using `right: -20px` which leaked outside viewport)
- Added `* { max-width: 100% }` inside the 720px media query as a safety net
