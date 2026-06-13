---
title: 'Port TenantSelector + NotFound and wire up root routing shell'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: '7556b8076d61f311a31b8324356ed605fd827b55'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `frontend-angular`'s root routing is still a placeholder (only `ui-showcase` and `workflow-canvas`, both added "for verification"), `app.html` shows a leftover scaffold heading, and there is no tenant-gate landing page or 404 page.

**Approach:** Port `TenantSelector.tsx` (cosmetic tenant-name gate -> navigates onward) and `NotFound.tsx` (404 + return-home link) as new standalone Angular components, add them to `app.routes.ts` as `/` and `**`, and rename the existing `/workflow-canvas` route to `/editor`. Strip the placeholder heading from `app.html`/`app.ts` so the new full-screen pages render cleanly.

## Boundaries & Constraints

**Always:**
- Create `TenantSelectorComponent` (standalone, `ChangeDetectionStrategy.OnPush`) at `frontend-angular/src/app/tenant-selector/tenant-selector.ts` (+ `.html`), porting `TenantSelector.tsx`: a `tenant` signal bound to an `hlmInput`/`hlmLabel` pair, a Building2 (`lucideBuilding2`) icon header, and an `hlmBtn` "Apply" button disabled when `tenant().trim()` is empty. Clicking "Apply" or pressing Enter in the input, when non-empty, calls `Router.navigate(['/editor'])`.
- Create `NotFoundComponent` (standalone, OnPush) at `frontend-angular/src/app/not-found/not-found.ts` (+ `.html`), porting `NotFound.tsx`: centered "404 / Oops! Page not found" message with a `routerLink="/"` "Return to Home" link; constructor logs `console.error('404 Error: User attempted to access non-existent route:', <attempted path>)` using the injected `Router`'s current URL, mirroring the React `useEffect`+`useLocation` side effect.
- Update `frontend-angular/src/app/app.routes.ts`: add `{ path: '', component: TenantSelectorComponent }` and `{ path: '**', component: NotFoundComponent }`, and rename the existing `{ path: 'workflow-canvas', component: WorkflowCanvasComponent }` entry to `{ path: 'editor', component: WorkflowCanvasComponent }`. Leave the `ui-showcase` entry untouched.
- Update `frontend-angular/src/app/app.ts` and `app.html`: remove the placeholder `title` signal and `<h1>{{ title() }}</h1>` heading so the root template is just `<router-outlet />` — required so the new full-screen `/` and `**` pages aren't rendered underneath a leftover heading.

**Ask First:**
- If removing the `title` signal/heading causes `app.spec.ts`'s existing "should render title" test to fail in a *new* way (it already fails today, asserting on `<h1>` text that has never matched `app.html`), leave it as-is — its fix is already tracked separately in `deferred-work.md` (D1-cleanup). Do not expand this spec to fix it.

**Never:**
- No work on D2 (the WorkflowSelector landing page, or `/editor/new` / `/editor/:id` route params) — deferred, tracked in `deferred-work.md`.
- No work on D1-cleanup (`/ui-showcase` route/component removal, `app.spec.ts` fix) — deferred, tracked in `deferred-work.md`.
- No changes to `WorkflowCanvasComponent`'s internal behavior/logic — it simply becomes reachable at `/editor` instead of `/workflow-canvas`.
- Do not add a `/workflow-canvas` -> `/editor` redirect or port `frontend/src/components/NavLink.tsx` — `/workflow-canvas` was an explicitly temporary verification route with no external links, and `NavLink.tsx` is confirmed dead code (same precedent as Goal B's toast/toaster).
- No backend/auth integration for "tenant" — `TenantSelectorComponent` stays purely cosmetic, matching the React reference (the typed value is never persisted or sent anywhere).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Empty tenant field | App loads at `/`, input is empty | "Apply" button is disabled; pressing Enter does nothing | N/A |
| Whitespace-only tenant | User types `"   "` | "Apply" stays disabled (`.trim()` check) | N/A |
| Valid tenant, click Apply | User types `"acme-corp"`, clicks "Apply" | Router navigates to `/editor`; `WorkflowCanvasComponent` renders | N/A |
| Valid tenant, Enter key | User types `"acme-corp"`, presses Enter in the input | Same as above — navigates to `/editor` | N/A |
| Unknown route | User navigates to e.g. `/foo` | `NotFoundComponent` renders "404 / Oops! Page not found"; `console.error` logs the attempted path | N/A |
| Return to Home from 404 | User clicks "Return to Home" on the 404 page | Router navigates to `/`; `TenantSelectorComponent` renders | N/A |

</frozen-after-approval>

## Code Map

- `frontend/src/pages/TenantSelector.tsx` -- reference: structure/Tailwind classes/copy to port for `TenantSelectorComponent`
- `frontend/src/pages/NotFound.tsx` -- reference: structure/copy to port for `NotFoundComponent`
- `frontend-angular/src/app/app.routes.ts` -- target: add `''` and `'**'` entries, rename `workflow-canvas` -> `editor`
- `frontend-angular/src/app/app.ts` / `app.html` -- target: strip placeholder title signal/heading
- `frontend-angular/src/app/workflow/node-properties/node-properties.html` -- reference: `hlmBtn`/`hlmInput`/`hlmLabel`/`<ng-icon>` usage syntax to mirror in the new components
- `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` -- target: no code change, just becomes reachable at the new `/editor` path

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/src/app/tenant-selector/tenant-selector.ts` + `.html` -- create standalone `TenantSelectorComponent` (OnPush) with a `tenant` signal, `handleApply()` (trim-check + `Router.navigate(['/editor'])`), Building2 icon header, `hlmLabel`+`hlmInput` "Select Tenant" field (Enter-to-submit), and an `hlmBtn` "Apply" button disabled when empty -- ports `TenantSelector.tsx`
- [x] `frontend-angular/src/app/not-found/not-found.ts` + `.html` -- create standalone `NotFoundComponent` (OnPush) that logs the unmatched path via `console.error` (using injected `Router`) and renders the "404 / Oops! Page not found" message plus a `routerLink="/"` "Return to Home" link -- ports `NotFound.tsx`
- [x] `frontend-angular/src/app/app.routes.ts` -- add `{ path: '', component: TenantSelectorComponent }` and `{ path: '**', component: NotFoundComponent }`, rename `workflow-canvas` -> `editor` -- establishes the root routing shell
- [x] `frontend-angular/src/app/app.ts`, `app.html` -- remove the `title` signal and `<h1>` heading, leaving `<router-outlet />` as the sole template content -- root component becomes a pure router host

**Acceptance Criteria:**
- Given the app loads at `/`, when it renders, then `TenantSelectorComponent` shows the "Workflow Engine" tenant-gate card with a disabled "Apply" button, with no leftover heading above it.
- Given a non-empty tenant value, when the user clicks "Apply" or presses Enter in the tenant input, then the router navigates to `/editor` and `WorkflowCanvasComponent` (the existing workflow editor) renders.
- Given the user navigates to an unregistered path (e.g. `/foo`), when the route resolves, then `NotFoundComponent` renders with a "Return to Home" link, and clicking it navigates back to `/`.
- Given `npm run build` in `frontend-angular/`, when it runs, then it exits 0 with zero TypeScript errors.
- Given the previously-registered `/workflow-canvas` path, when navigated to, then it resolves via the `**` wildcard to `NotFoundComponent` (renamed to `/editor`, no longer separately registered).

## Spec Change Log

## Design Notes

`TenantSelectorComponent` and `NotFoundComponent` follow the same standalone/OnPush/signal pattern as the rest of `frontend-angular` (e.g. `workflow-node.ts`), and reuse the spartan-ng `Hlm*Imports` primitives already established in Goal B rather than introducing new styling. `/workflow-canvas` is renamed (not redirected) to `/editor` — it was always documented as a temporary verification path with no external references, so a clean rename has zero blast radius.

## Verification

**Commands:**
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors

**Manual checks (if no CLI):**
- `npm start`, navigate to `/`: TenantSelector renders full-screen with no stray heading; "Apply" is disabled until you type a tenant name, then Enter/Apply navigates to `/editor` and the workflow canvas editor renders.
- Navigate to `/some-bad-path`: 404 page renders with "Return to Home"; clicking it returns to `/`.

## Suggested Review Order

**Routing shell**

- Entry point: root route now gates on `TenantSelectorComponent` before reaching the editor.
  [`app.routes.ts:8`](../../frontend-angular/src/app/app.routes.ts#L8)

- `/workflow-canvas` renamed to `/editor` -- no redirect added, old path now falls through.
  [`app.routes.ts:10`](../../frontend-angular/src/app/app.routes.ts#L10)

- Wildcard catches the renamed-away old path and any unknown URL.
  [`app.routes.ts:11`](../../frontend-angular/src/app/app.routes.ts#L11)

**Tenant gate page**

- Core behavior: trim-check guard, then navigate to `/editor` -- purely cosmetic, no persistence.
  [`tenant-selector.ts:26`](../../frontend-angular/src/app/tenant-selector/tenant-selector.ts#L26)

- Enter-to-submit input bound to the `tenant` signal via manual `(input)` handler.
  [`tenant-selector.html:14`](../../frontend-angular/src/app/tenant-selector/tenant-selector.html#L14)

- "Apply" button disabled while `tenant().trim()` is empty, mirroring the handler's guard.
  [`tenant-selector.html:24`](../../frontend-angular/src/app/tenant-selector/tenant-selector.html#L24)

**404 page**

- Constructor logs the unmatched path via injected `Router`, mirroring the React `useEffect` side effect.
  [`not-found.ts:14`](../../frontend-angular/src/app/not-found/not-found.ts#L14)

- `routerLink="/"` recovery path -- returns to the tenant gate, not a full page reload.
  [`not-found.html:5`](../../frontend-angular/src/app/not-found/not-found.html#L5)

**Root shell cleanup**

- Template reduced to a bare `<router-outlet />` so full-screen pages render without a leftover heading.
  [`app.html:1`](../../frontend-angular/src/app/app.html#L1)

- Placeholder `title` signal removed along with the now-unused `signal` import.
  [`app.ts:1`](../../frontend-angular/src/app/app.ts#L1)

**Peripherals**

- Goal D split into D1 (this spec, done) / D2 / D1-cleanup, tracked for follow-up work.
  [`deferred-work.md`](deferred-work.md)
