---
title: 'Port WorkflowSelector as the /editor landing page with route-driven canvas load/reset'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: 'd38941e'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/editor` currently renders `WorkflowCanvasComponent` directly with a hardcoded demo workflow. Users have no dedicated way to browse, search, or pick among saved workflows, and the canvas's "new vs. load" state isn't addressable via URL.

**Approach:** Port `WorkflowSelector.tsx` as a new `WorkflowSelectorComponent` that becomes the `/editor` landing page. Split the existing canvas route into `/editor/new` (blank workflow) and `/editor/:id` (load by id), with `WorkflowCanvasComponent` reacting to route param changes to reset or load.

## Boundaries & Constraints

**Always:**
- Create `WorkflowSelectorComponent` (standalone, `ChangeDetectionStrategy.OnPush`) at `frontend-angular/src/app/workflow/workflow-selector/{workflow-selector.ts,.html}`, porting `WorkflowSelector.tsx`: search input (`hlmInput` + `lucideSearch` icon overlay, case-insensitive filter on name/id, resets to page 1 on change), `ITEMS_PER_PAGE = 6` pagination (computed `totalPages`/`safePage`/`paged`, ChevronLeft/ChevronRight + numbered `hlmBtn` buttons, `variant="default"` for current page / `variant="ghost"` otherwise), dashed-border "New Workflow" card (`lucidePlus`/`lucideArrowRight`), saved-workflow list rows (`lucideZap`/`lucideHash`/`lucideCalendar`/`lucideClock`/`lucideTrash2`/`lucideArrowRight`, formatted `createdAt`/`updatedAt`), empty-search state (`lucideSearch`), "FlowCraft" header (`lucideWorkflow` in `bg-primary/10 border-primary/20` box), and ambient glow divs — match the Tailwind classes/copy from the React reference.
- `WorkflowSelectorComponent` injects `WorkflowStoreService` and `Router`. "New Workflow" card click -> `router.navigate(['/editor/new'])`. Saved-workflow row click -> `router.navigate(['/editor', wf.id])`. Delete button click -> `event.stopPropagation()` then `workflowStore.remove(wf.id)` (the `workflows` signal updates reactively; no separate `refresh()` call needed).
- Update `frontend-angular/src/app/app.routes.ts`: replace `{ path: 'editor', component: WorkflowCanvasComponent }` with, in this order (static-before-param, required for correct matching): `{ path: 'editor', component: WorkflowSelectorComponent }`, `{ path: 'editor/new', component: WorkflowCanvasComponent }`, `{ path: 'editor/:id', component: WorkflowCanvasComponent }`.
- In `WorkflowCanvasComponent`, inject `ActivatedRoute` and react to its `id` route param (e.g. `toSignal(route.paramMap)` + `effect()`): when `id` is absent (`/editor/new`), perform the same reset as the existing `onNewWorkflow()` (demo nodes/edges, `clearActive()`, fit view); when `id` is present (`/editor/:id`), perform the same load as the existing `onLoadWorkflow(id)` (load from store, set nodes/edges/name, reseed id counters, fit view). The effect must re-run on subsequent param changes too (covers browser back/forward between two `/editor/:id` URLs), not just initial activation.
- If `/editor/:id` loads with an `id` not found in `workflowStore` (`load(id)` returns `null`), navigate to `/editor` instead of rendering an empty/broken canvas.

**Ask First:**
- If reusing `onNewWorkflow()`/`onLoadWorkflow(id)` directly from the route effect causes a naming or double-invocation conflict with the existing `WorkflowManager`-modal wiring (which calls them on click), resolve by extracting a small shared private helper rather than changing the modal's behavior — do not change what the in-canvas "Open"/"New" buttons do.

**Never:**
- Do not modify the in-canvas `WorkflowManagerComponent` modal or rewire its `onLoadWorkflow`/`onDeleteWorkflow` calls to use router navigation — it keeps mutating canvas state directly without updating the URL. This can leave the URL's `:id` out of sync with the loaded workflow when used; that's a pre-existing tradeoff, out of scope here.
- Do not add a `RouteReuseStrategy` override — rely on Angular's default behavior (different static/param route configs recreate the component; the same `:id`-pattern route with a different param value reuses it and re-fires the param-change effect).
- Do not add toasts/notifications for select/new/delete actions (`sonner`/`HlmToasterImports` confirmed dead code, per Goal B / D1-cleanup precedent).
- No work on wiring the in-canvas `WorkflowManager`'s "Load" action to also update the URL — defer if ever needed.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Land on /editor, no saved workflows | `workflowStore.workflows()` = `[]` | Selector shows header + "New Workflow" card only; no "Saved Workflows" section | N/A |
| Land on /editor, >6 saved workflows | `workflows().length` = 9 | First 6 (page 1) shown; pagination controls visible ("1-6 of 9") | N/A |
| Search filters list | type `"abc"` matching 1 workflow's name/id | List narrows to 1 row, page resets to 1 | N/A |
| Search with no matches | type `"zzz"` | "No workflows match \"zzz\"" message with Search icon, no rows | N/A |
| Click "New Workflow" card | click dashed card | Navigate to `/editor/new`; canvas shows demo workflow, `activeId` cleared | N/A |
| Click saved-workflow row | click row for `wf-123` | Navigate to `/editor/wf-123`; canvas loads that workflow's nodes/edges/name, sets it active | N/A |
| Click delete on a row | click trash icon on `wf-123` | `stopPropagation` prevents navigation; `workflowStore.remove("wf-123")` removes it from the list | N/A |
| Direct navigation to unknown id | open `/editor/does-not-exist` | `workflowStore.load()` returns `null`; router navigates to `/editor` | Redirect, no thrown error |
| Back/forward between two loaded workflows | `/editor/wf-1` -> `/editor/wf-2` via history | Canvas re-runs the load effect, swaps to `wf-2`'s nodes/edges/name | N/A |

</frozen-after-approval>

## Code Map

- `frontend/src/pages/WorkflowSelector.tsx` -- reference: structure/Tailwind/copy to port for `WorkflowSelectorComponent`
- `frontend/src/pages/WorkflowEditor.tsx` -- reference: how `onSelect`/`onNew`/`onDelete` map to navigation
- `frontend-angular/src/app/workflow/workflow-store/workflow-store.ts` -- `workflows`, `activeId`, `load`, `remove`, `clearActive` used by both new and existing components
- `frontend-angular/src/app/workflow/workflow-manager/workflow-manager.html` -- reference: list-row/timestamp formatting + `hlmBtn`/`<ng-icon>` syntax
- `frontend-angular/src/app/tenant-selector/tenant-selector.html` -- reference: `hlmInput` + icon-overlay search-box pattern
- `frontend-angular/src/app/app.routes.ts` -- target: split `/editor` into landing page + `/editor/new` + `/editor/:id`
- `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` -- target: add `ActivatedRoute`-driven load/reset effect, reusing existing `onNewWorkflow()`/`onLoadWorkflow()` logic

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/src/app/workflow/workflow-selector/workflow-selector.ts` + `.html` -- create standalone OnPush `WorkflowSelectorComponent` with search/pagination/list/new-card per the Boundaries -- ports `WorkflowSelector.tsx` as the new `/editor` landing page
- [x] `frontend-angular/src/app/app.routes.ts` -- split `/editor` into 3 routes (landing, `/new`, `/:id`) in static-before-param order -- registers the landing page and addressable canvas routes
- [x] `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` -- inject `ActivatedRoute`/`Router`, add a param-driven load/reset effect with not-found redirect -- makes canvas state addressable via URL

**Acceptance Criteria:**
- Given the user navigates to `/editor` with saved workflows, when the page renders, then the `WorkflowSelectorComponent` landing page shows (not the canvas).
- Given the user clicks "New Workflow" on the landing page, when navigation completes, then the URL is `/editor/new` and the canvas shows the default demo workflow with no active workflow set.
- Given the user clicks a saved-workflow row, when navigation completes, then the URL is `/editor/<id>` and the canvas shows that workflow's nodes/edges/name with it set as active.
- Given `npm run build` in `frontend-angular/`, when it runs, then it exits 0 with zero TypeScript errors.
- Given `npm test` in `frontend-angular/`, when it runs, then all existing tests still pass (no regressions).

## Spec Change Log

## Design Notes

- Reuse `onNewWorkflow()`/`onLoadWorkflow(id)`'s existing logic for the route-driven reset/load rather than duplicating it — the param-effect should call into the same code path (renaming/extracting a private helper if needed), keeping the in-canvas `WorkflowManager` modal's existing calls working unchanged.
- A brief flash of demo nodes before the `/editor/:id` load-effect applies is acceptable — it matches the existing async `fitView` effect's characteristics. Avoiding it (e.g. reading `route.snapshot` during field initialization) is a nice-to-have, not required.

## Verification

**Commands:**
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors
- `cd frontend-angular && npm test` -- expected: all tests pass (15/15 baseline, plus any new ones)

**Manual checks (if no CLI):**
- `npm start`, navigate to `/editor`: landing page renders with "New Workflow" card; if saved workflows exist, list/search/pagination work.
- Click "New Workflow" -> URL becomes `/editor/new`, canvas shows the demo workflow.
- Save the workflow, return to `/editor`, click the saved row -> URL becomes `/editor/<id>`, canvas loads it.
- Navigate to `/editor/nonexistent-id` directly -> redirected to `/editor`.

## Suggested Review Order

**Routing — entry point**

- Splits `/editor` into the landing page, `/editor/new`, and `/editor/:id`, static-before-param.
  [`app.routes.ts:9`](../../frontend-angular/src/app/app.routes.ts#L9)

**Canvas: route-driven load/reset**

- Derives the `:id` param as a signal, seeded from `route.snapshot` to avoid an initial flash.
  [`workflow-canvas.ts:72`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L72)

- New effect: resets via `onNewWorkflow()` when `id` is absent, loads via `onLoadWorkflow(id)` when present, redirects to `/editor` on not-found. `untracked()` keeps signals read inside those calls from becoming dependencies.
  [`workflow-canvas.ts:88`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L88)

- `onLoadWorkflow` now returns `boolean` so the route effect can detect a missing workflow and redirect.
  [`workflow-canvas.ts:185`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L185)

**Canvas: fitView guard (bug fix)**

- Guards `fitView()` on `vflow.initialized()` — the new route effect can call it during construction, before the canvas is sized, which previously produced NaN SVG transform errors.
  [`workflow-canvas.ts:168`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L168)

**Workflow selector: data & navigation**

- Search/pagination state: case-insensitive `filtered`, `ITEMS_PER_PAGE = 6` `totalPages`/`safePage`/`paged`.
  [`workflow-selector.ts:22`](../../frontend-angular/src/app/workflow/workflow-selector/workflow-selector.ts#L22)

- Navigation handlers: New -> `/editor/new`, row -> `/editor/:id`, delete -> `stopPropagation` + `workflowStore.remove`.
  [`workflow-selector.ts:93`](../../frontend-angular/src/app/workflow/workflow-selector/workflow-selector.ts#L93)

**Workflow selector: template**

- Dashed "New Workflow" card, navigates on click.
  [`workflow-selector.html:20`](../../frontend-angular/src/app/workflow/workflow-selector/workflow-selector.html#L20)

- Search bar, empty-search state, and saved-workflow rows (icons, formatted dates, delete button).
  [`workflow-selector.html:48`](../../frontend-angular/src/app/workflow/workflow-selector/workflow-selector.html#L48)

- Pagination controls (prev/next + numbered buttons).
  [`workflow-selector.html:112`](../../frontend-angular/src/app/workflow/workflow-selector/workflow-selector.html#L112)
