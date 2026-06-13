---
title: 'Port workflow editor TopBar + New Workflow to Angular'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: '3992a8c9a9855205f4f8c1270ff03701df4ff826'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/workflow-canvas` has no chrome -- no title bar, no New/Open/Save/Run controls, and no way to reset the canvas. `TopBar.tsx` and `WorkflowEditor.tsx`'s "New Workflow" wiring are unported.

**Approach:** Port `TopBarComponent` (all 7 controls, raw Tailwind + `@ng-icons/lucide`, no shadcn -- Goal B not yet done) and wire its `newWorkflow` output into `WorkflowCanvasComponent`. `workflow-canvas.html` gains an outer flex-col wrapper: `TopBar` above the existing palette+canvas row. `save`/`openManager` outputs stay unbound for now (like Undo/Redo/Settings) -- SaveDialog+Save (C4b-2) and WorkflowManager+Open/Load/Delete (C4b-3) are follow-ups.

## Boundaries & Constraints

**Always:**
1. `frontend-angular/src/app/workflow/top-bar/top-bar.ts` (+ `.html`): standalone OnPush `TopBarComponent`, selector `app-top-bar`. `workflowName = input.required<string>()`; outputs `save`/`openManager`/`newWorkflow` (`output<void>`). Port `TopBar.tsx` verbatim (title/badge/divider/name + New/Open/Undo/Redo/Settings/Save/Run buttons) using raw `<button>` + Tailwind approximating shadcn `Button variant="ghost" size="icon"` / default `size="sm"` (cf. `workflow-canvas.html:19-26`). `provideIcons`: `lucideFilePlus`, `lucideFolderOpen`, `lucideUndo2`, `lucideRedo2`, `lucideSettings`, `lucideSave`, `lucidePlay`. New->`newWorkflow.emit()`, Open->`openManager.emit()`, Save->`save.emit()`; Undo/Redo/Settings/Run stay handler-less (matches React).
2. `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts`: new state `protected readonly workflowName = signal('My Workflow')`. New method `protected onNewWorkflow(): void` -- `nodes.set(createInitialNodes())`, `edges.set(createInitialEdges())`, `workflowName.set('Untitled Workflow')`, `nodeIdCounter = 0`, `edgeIdCounter = 0`, `this.fitView()`.
3. `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html`: wrap the existing root `<div class="flex w-full h-full overflow-hidden">` (change its class to `flex flex-1 overflow-hidden`) in a new outer `<div class="h-full w-full flex flex-col overflow-hidden">`. Add `<app-top-bar [workflowName]="workflowName()" (newWorkflow)="onNewWorkflow()" />` above the row; leave `(save)`/`(openManager)` unbound.

**Ask First:** None -- fully derivable from `TopBar.tsx` and `WorkflowEditor.tsx`'s `handleNew`.

**Never:**
- `SaveDialogComponent` + Save wiring -- deferred follow-up (C4b-2).
- `WorkflowManagerComponent` + Open/Load/Delete -- deferred follow-up (C4b-3).
- No `WorkflowSelector`/`app.routes.ts` changes -- Goal D.
- No toast/notification system (`sonner` unported, Goal B).
- No edge context menu (C3c, deferred).
- No changes under `frontend/`/`backend/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|----------|--------------|---------------------------|
| Initial mount | `workflowName()` = `'My Workflow'` | TopBar renders title bar with that name and all 7 controls |
| Click New Workflow | -- | nodes/edges reset to `createInitialNodes()`/`createInitialEdges()`; `workflowName` = `'Untitled Workflow'`; id counters reset to 0; view re-fits |
| Click Save/Open | -- | `save`/`openManager` emit; no bound listener (no-op) |

</frozen-after-approval>

## Code Map

- Reference: `frontend/src/components/workflow/TopBar.tsx`, `frontend/src/pages/WorkflowEditor.tsx` (`handleNew`)
- `frontend-angular/src/app/workflow/top-bar/top-bar.ts` (+ `.html`, NEW)
- `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`)

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/src/app/workflow/top-bar/top-bar.ts` (+ `.html`) -- `TopBarComponent`
- [x] `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`) -- TopBar wiring, `workflowName` state, `onNewWorkflow`

**Acceptance Criteria:**
- Given `npm run build` in `frontend-angular/`, when run, then it exits 0 with zero TypeScript errors.
- Given `/workflow-canvas`, when loaded, then `TopBar` renders above the canvas with the title, `'My Workflow'`, and all 7 controls (New/Open/Undo/Redo/Settings/Save/Run).
- Given New Workflow is clicked, when the canvas re-renders, then nodes/edges equal `createInitialNodes()`/`createInitialEdges()`, `workflowName()` is `'Untitled Workflow'`, and the view re-fits.
- Given Save or Open is clicked, when observed, then nothing happens (outputs emit with no bound handler), matching Undo/Redo/Settings's current state.

## Spec Change Log

- React's `animate-pulse-glow` (a custom keyframe defined only in `frontend/tailwind.config.ts`, unported to `frontend-angular`'s Tailwind v4 setup) was substituted with Tailwind's built-in `animate-pulse` for the status-dot indicator -- equivalent intent (pulsing indicator), no new CSS needed.

## Verification

**Commands:**
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors

**Manual checks (if no CLI):**
- `npm start`, `/workflow-canvas`: TopBar renders with "My Workflow"; click New Workflow and confirm the canvas resets to the demo layout with the title now "Untitled Workflow".

## Suggested Review Order

**TopBar chrome (new component)**

- Entry point: `TopBarComponent`'s contract -- `workflowName` input plus `save`/`openManager`/`newWorkflow` outputs.
  [`top-bar.ts:13`](../../frontend-angular/src/app/workflow/top-bar/top-bar.ts#L13)

- Ports `TopBar.tsx` verbatim: title/badge/name display, then New/Open/Undo/Redo/Settings/Save/Run as raw-Tailwind buttons.
  [`top-bar.html:1`](../../frontend-angular/src/app/workflow/top-bar/top-bar.html#L1)

- New/Open/Save buttons emit their outputs; Undo/Redo/Settings/Run stay handler-less, matching React.
  [`top-bar.html:17`](../../frontend-angular/src/app/workflow/top-bar/top-bar.html#L17)

**Canvas wiring**

- `workflowName` signal seeds the title bar and is reset by "New Workflow".
  [`workflow-canvas.ts:45`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L45)

- `onNewWorkflow` resets nodes/edges/id-counters to the demo layout and re-fits the view.
  [`workflow-canvas.ts:143`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L143)

- `<app-top-bar>` sits above the palette+canvas row inside a new flex-col wrapper; `save`/`openManager` stay unbound for C4b-2/C4b-3.
  [`workflow-canvas.html:1`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L1)

**Peripherals**

- `TopBarComponent` registered in the canvas's standalone `imports`.
  [`workflow-canvas.ts:33`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L33)

- `deferred-work.md`'s C4b entry split into C4b-1 (this story)/C4b-2/C4b-3, plus a review-surfaced `contextMenu`-staleness item for C4b-3.
  [`deferred-work.md:89`](deferred-work.md#L89)
