---
title: 'Remove superseded ui-showcase route and fix root-shell test'
type: 'chore'
created: '2026-06-13'
status: 'done'
context: []
route: 'one-shot'
---

# Remove superseded ui-showcase route and fix root-shell test

## Intent

**Problem:** The `/ui-showcase` route and its `UiShowcase` component were a temporary verification page for spartan-ng primitives, now superseded since D1 registered the real `/`, `/editor`, and `**` routes and those primitives are exercised by real pages. Separately, `app.spec.ts`'s "should render title" test was already broken pre-D1 (asserted on an `<h1>` that never matched) and broke harder once D1 stripped `app.html` down to a bare `<router-outlet />`.

**Approach:** Delete `frontend-angular/src/app/ui-showcase/{ui-showcase.ts,ui-showcase.html}` and remove its import/route entry from `app.routes.ts`. Replace the stale "should render title" test with one that asserts the root `App` component renders its `<router-outlet />`.

## Suggested Review Order

**Route table cleanup**

- `/ui-showcase` route and its `UiShowcase` import removed; the route table now only gates on `/`, `/editor`, and `**`.
  [`app.routes.ts:6`](../../frontend-angular/src/app/app.routes.ts#L6)

- The deleted `frontend-angular/src/app/ui-showcase/{ui-showcase.ts,ui-showcase.html}` had no other references in `frontend-angular/src` (confirmed via grep) -- a clean removal with zero blast radius.

**Root-shell test fix**

- "should render title" replaced with an assertion on `<router-outlet>`, matching the post-D1 `App` template (`<router-outlet />` only).
  [`app.spec.ts:17`](../../frontend-angular/src/app/app.spec.ts#L17)

## Verification

**Commands:**
- `cd frontend-angular && npm test` -- 15/15 tests pass (was 14/15 before this change)
- `cd frontend-angular && npm run build` -- exits 0, no TS errors, bundle size dropped (776.48 kB vs prior 837.34 kB) since `UiShowcase` and its spartan-ng select/switch/textarea/tooltip/toaster imports are no longer bundled
