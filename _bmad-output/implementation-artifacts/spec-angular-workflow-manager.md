---
title: 'Port WorkflowManager (Open/Load/Delete) to Angular'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: 'cf1e71ba6dab390cbf86109436a6a1af4bedcfb8'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `TopBar.openManager` is unbound -- clicking Open does nothing, and there's no UI to browse, load, or delete saved workflows.

**Approach:** Port `WorkflowManagerComponent` (list, Active badge, date formatting, node count, delete row -- raw Tailwind + `@ng-icons/lucide`). Bind `TopBar.openManager` to open it; add `showManager` state plus `onOpenManager`/`onLoadWorkflow`/`onDeleteWorkflow`/`reseedCounters` to `WorkflowCanvasComponent`.

## Boundaries & Constraints

**Always:**
1. New `frontend-angular/src/app/workflow/workflow-manager/workflow-manager.ts` (+ `.html`): standalone OnPush `WorkflowManagerComponent`, selector `app-workflow-manager`. Inputs: `workflows = input.required<SavedWorkflow[]>()`, `activeId = input.required<string | null>()` (import `SavedWorkflow` from `../workflow-store/workflow-store`). Outputs: `load = output<string>()`, `deleteWorkflow = output<string>()`, `closed = output<void>()`. Port `WorkflowManager.tsx` verbatim: overlay/card `bg-card border border-border rounded-lg shadow-2xl shadow-black/50 w-[480px] max-h-[70vh] flex flex-col animate-in fade-in zoom-in-95 duration-150`; header (FolderOpen icon + "Saved Workflows" title + close `X` -> `closed.emit()`); body: when `workflows().length === 0` show empty state (FileText icon + "No saved workflows yet" / "Save your current workflow to see it here"), else `@for (wf of workflows(); track wf.id)` rows with `isActive = wf.id === activeId()` styling (`border-primary/40 bg-primary/5` vs `border-transparent hover:bg-muted/50`) -- name, "Active" badge when `isActive`, Clock icon + formatted timestamp (`new Date(wf.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })` + `' · '` + `.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })`) + `{{ wf.nodes.length }} nodes`; row click -> `load.emit(wf.id)`; trash button with `(click)="$event.stopPropagation(); deleteWorkflow.emit(wf.id)"`. `provideIcons`: `lucideFolderOpen`, `lucideTrash2`, `lucideClock`, `lucideX`, `lucideFileText`.
2. `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts`: import `WorkflowManagerComponent`; add `fromSavedEdges`/`fromSavedNodes` to the existing `../workflow-store/workflow-store` import; register `WorkflowManagerComponent` in standalone `imports`. Change `private readonly workflowStore` to `protected readonly workflowStore` (template needs `workflowStore.workflows()`/`workflowStore.activeId()`). New state `protected readonly showManager = signal(false)`. New methods:
   - `protected onOpenManager(): void` -- `this.workflowStore.refresh(); this.showManager.set(true);`
   - `protected onLoadWorkflow(id: string): void` -- `const wf = this.workflowStore.load(id); if (!wf) return;` then set `this.nodes` via `fromSavedNodes(wf.nodes)`, `this.edges` via `fromSavedEdges(wf.edges)`, `this.workflowName.set(wf.name)`, `this.contextMenu.set(null)`, `this.reseedCounters()`, `this.showManager.set(false)`, `this.fitView()`.
   - `protected onDeleteWorkflow(id: string): void` -- `this.workflowStore.remove(id); this.workflowStore.refresh();`
   - `private reseedCounters(): void` -- recompute `nodeIdCounter`/`edgeIdCounter` from current `nodes()`/`edges()` ids matching `/^node-(\d+)$/` / `/^e-.+-(\d+)$/` respectively; set each counter to `Math.max(-1, ...matchedNumbers) + 1` (yields `0` when no id matches).
3. `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html`: bind `(openManager)="onOpenManager()"` on `<app-top-bar>`. Add `@if (showManager()) { <app-workflow-manager [workflows]="workflowStore.workflows()" [activeId]="workflowStore.activeId()" (load)="onLoadWorkflow($event)" (deleteWorkflow)="onDeleteWorkflow($event)" (closed)="showManager.set(false)" /> }` as a sibling near the existing `@if (showSaveDialog())` block.

**Ask First:** None -- fully derivable from `WorkflowManager.tsx`, `WorkflowEditor.tsx`'s `handleLoad`/`handleDelete`/`onOpenManager` wiring, and C4a's `WorkflowStoreService`.

**Never:**
- `onNewWorkflow`'s `contextMenu`/`activeId` resets, `WorkflowStoreService.refresh()` activeId reconciliation, and the `SavedWorkflow.nodes`/`edges` validation decision -- split into a follow-up (`deferred-work.md`, "C4b-3 follow-up").
- No toast/notification system (`sonner` unported, Goal B) -- skip React's `toast.success`/`toast.error` on load/delete.
- No `WorkflowSelector`/`app.routes.ts` changes -- Goal D.
- No edge context menu (C3c, permanently deferred).
- No changes under `frontend/`/`backend/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Click Open in TopBar | `showManager()` false | `workflowStore.refresh()` runs; `showManager` -> true; manager lists `workflows()`, "Active" badge on `activeId()`'s row | N/A |
| No saved workflows | `workflows().length === 0` | Empty state renders (FileText icon + "No saved workflows yet" + helper text) | N/A |
| Click a workflow row | row for `wf.id` | `onLoadWorkflow`: `nodes`/`edges` replaced via `fromSavedNodes`/`fromSavedEdges`, `workflowName` set, `contextMenu` cleared, counters reseeded, manager closes, view re-fits | `load(id)` returns `null` -> no-op, manager stays open |
| Click trash on a row | row for `wf.id`, event stops propagation | `onDeleteWorkflow`: `remove(id)` + `refresh()`; row removed without triggering Load | If `wf.id === activeId()`, `remove` clears `activeId` and the badge disappears |
| Close (X) | -- | `showManager` -> false; `workflows()`/`activeId()` unchanged | N/A |

</frozen-after-approval>

## Code Map

- Reference: `frontend/src/components/workflow/WorkflowManager.tsx`, `frontend/src/pages/WorkflowEditor.tsx` (`handleLoad`/`handleDelete`/`onOpenManager`)
- `frontend-angular/src/app/workflow/workflow-manager/workflow-manager.ts` (+ `.html`, NEW)
- `frontend-angular/src/app/workflow/workflow-store/workflow-store.ts` (reference: `load`/`remove`/`refresh`/`fromSavedNodes`/`fromSavedEdges`/`activeId`/`workflows`)
- `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`)

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/src/app/workflow/workflow-manager/workflow-manager.ts` (+ `.html`) -- `WorkflowManagerComponent`: list/empty-state/Active badge/date/node-count/delete row
- [x] `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`) -- `showManager` state, `onOpenManager`/`onLoadWorkflow`/`onDeleteWorkflow`/`reseedCounters`, TopBar `(openManager)` wiring, `<app-workflow-manager>`

**Acceptance Criteria:**
- Given `npm run build` in `frontend-angular/`, when run, then it exits 0 with zero TypeScript errors.
- Given a saved workflow containing a node id like `node-3` and an edge id like `e-1-2-5` is loaded via Open, when a new node/edge is then created on the canvas, then its generated id does not collide with any id already present in the loaded workflow (`reseedCounters` seeds `nodeIdCounter`/`edgeIdCounter` past the loaded max).

## Spec Change Log

## Design Notes

- `reseedCounters` regex rationale: the demo ids (`'1'`-`'5'`, `e1-2`, `e2-3`, ...) match neither `/^node-(\d+)$/` nor `/^e-.+-(\d+)$/` (no `node-` prefix; no literal `e-` prefix), so loading the demo workflow seeds both counters to `0`. Loading a workflow containing `node-3`/`e-1-2-5` seeds `nodeIdCounter=4`/`edgeIdCounter=6`.

## Verification

**Commands:**
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors

**Manual checks (if no CLI):**
- `npm start`, `/workflow-canvas`: Save the canvas twice under two different names, click Open, confirm both rows appear with "Active" on the second. Click the first row to load it -- canvas updates, title bar changes, manager closes. Delete the now-loaded (active) entry -- it disappears and no row shows "Active".

## Suggested Review Order

**WorkflowManager (new component)**

- Entry point: `WorkflowManagerComponent`'s contract -- `workflows`/`activeId` inputs, `load`/`deleteWorkflow`/`closed` outputs.
  [`workflow-manager.ts:14`](../../frontend-angular/src/app/workflow/workflow-manager/workflow-manager.ts#L14)

- Ports `WorkflowManager.tsx` verbatim: overlay/card/header/empty-state/row/Active badge in raw Tailwind + `@ng-icons/lucide`.
  [`workflow-manager.html:1`](../../frontend-angular/src/app/workflow/workflow-manager/workflow-manager.html#L1)

- `formatTimestamp` reproduces React's exact date/time formatting (`toLocaleDateString` + ` · ` + `toLocaleTimeString`).
  [`workflow-manager.ts:22`](../../frontend-angular/src/app/workflow/workflow-manager/workflow-manager.ts#L22)

**Canvas wiring (Open/Load/Delete)**

- `onLoadWorkflow` replaces nodes/edges/name, clears the stale context menu, reseeds id counters, then re-fits the view.
  [`workflow-canvas.ts:161`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L161)

- `reseedCounters` recomputes `nodeIdCounter`/`edgeIdCounter` from the loaded ids so newly-created nodes/edges can't collide.
  [`workflow-canvas.ts:179`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L179)

- `onOpenManager` refreshes the store before showing the manager, so the list reflects current `localStorage` state.
  [`workflow-canvas.ts:156`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L156)

- `onDeleteWorkflow` removes the entry and refreshes; `WorkflowStoreService.remove` already clears `activeId` if it was active.
  [`workflow-canvas.ts:174`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L174)

- TopBar's `openManager` output now opens the manager instead of being a no-op.
  [`workflow-canvas.html:2`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L2)

- The conditional `<app-workflow-manager>` block, wired to the new canvas methods.
  [`workflow-canvas.html:70`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L70)

**Peripherals**

- `WorkflowManagerComponent` registered alongside `fromSavedEdges`/`fromSavedNodes` imports and the new `showManager` state; `workflowStore` widened to `protected` for template access.
  [`workflow-canvas.ts:46`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L46)

- Review surfaced two pre-existing gaps now extended by Open/Load -- unsaved-changes warnings and modal/list accessibility -- deferred alongside the existing C4b-3 follow-up items.
  [`deferred-work.md:138`](deferred-work.md#L138)

