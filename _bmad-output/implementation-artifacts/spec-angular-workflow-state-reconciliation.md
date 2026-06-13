---
title: 'Workflow state reconciliation: New/Refresh activeId + contextMenu cleanup'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: 'c49e40104550ba15629aa5ed40bad562184457c0'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `onNewWorkflow` doesn't clear `contextMenu` or `workflowStore.activeId`, so a stale context menu can linger and "New -> Save" overwrites the previously-active saved entry instead of creating a new one. Separately, `WorkflowStoreService.refresh()` doesn't reconcile `activeId` against `workflows()`, so a stale `activeId` can keep showing the "Active" badge on a deleted entry.

**Approach:** Add a `clearActive()` method to `WorkflowStoreService` (sets `activeId` to `null` and removes the persisted key), call it from `onNewWorkflow` alongside a `contextMenu` reset, refactor `remove()` to reuse it, and have `refresh()` call it when `activeId()` no longer matches any loaded workflow. `SavedWorkflow.nodes`/`edges` validation: accept the existing gap (see Design Notes) -- no code.

## Boundaries & Constraints

**Always:**
1. `frontend-angular/src/app/workflow/workflow-store/workflow-store.ts`: add `clearActive(): void` to `WorkflowStoreService` -- `this.activeId.set(null); localStorage.removeItem(ACTIVE_KEY);`. Refactor `remove(id)`'s `if (this.activeId() === id) { ... }` branch to call `this.clearActive()` instead of its current two inline statements.
2. `frontend-angular/src/app/workflow/workflow-store/workflow-store.ts`: `refresh()` -- after `this.workflows.set(loadAll())`, if `this.activeId()` is non-null and no entry in the freshly-loaded array has that `id`, call `this.clearActive()`.
3. `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts`: in `onNewWorkflow()`, add `this.contextMenu.set(null);` and `this.workflowStore.clearActive();` alongside the existing `nodes`/`edges`/`workflowName`/counter resets.

**Ask First:** None -- both items are directly named in `deferred-work.md`'s "C4b-3 follow-up" and the C4b-1/C4b-2 review items, fully derivable from `remove()`'s existing activeId-clearing pattern.

**Never:**
- No `SavedWorkflow.nodes`/`edges` validation before `fromSavedNodes`/`fromSavedEdges` -- accept the gap, matching `loadAll()`'s "trust the JSON" approach and React's `useWorkflowStore.ts` (see Design Notes).
- No changes to `WorkflowManagerComponent`, `SaveDialogComponent`, or `TopBarComponent` -- this story only touches `WorkflowStoreService` and `WorkflowCanvasComponent`.
- No toast/notification system (Goal B, `sonner` unported).
- No changes under `frontend/`/`backend/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Click New Workflow while a saved workflow is active | `activeId()` = `'wf-123'`, `contextMenu()` non-null | Canvas resets; `contextMenu()` -> `null`; `activeId()` -> `null` and `localStorage[ACTIVE_KEY]` removed | N/A |
| Click New Workflow, then Save with a new name | After above, Save dialog confirmed | `onSaveConfirm`'s `activeId() ?? undefined` is `undefined` -> `WorkflowStoreService.save` creates a NEW entry instead of overwriting `wf-123` | N/A |
| `refresh()` when active workflow still exists | `activeId()` = `'wf-123'`, reloaded `workflows()` still contains `wf-123` | `activeId()` unchanged | N/A |
| `refresh()` when active workflow was deleted elsewhere | `activeId()` = `'wf-123'`, reloaded `workflows()` no longer contains `wf-123` | `activeId()` -> `null`, `localStorage[ACTIVE_KEY]` removed; "Active" badge disappears | N/A |
| `refresh()` when `activeId()` is already `null` | `activeId()` = `null` | No-op on `activeId` | N/A |

</frozen-after-approval>

## Code Map

- `frontend-angular/src/app/workflow/workflow-store/workflow-store.ts` -- `WorkflowStoreService`: new `clearActive()`, `refresh()` reconciliation, `remove()` refactor
- `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` -- `onNewWorkflow()`: clear `contextMenu` + `activeId` via `clearActive()`

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/src/app/workflow/workflow-store/workflow-store.ts` -- add `clearActive()`, refactor `remove()` to use it, add `activeId` reconciliation to `refresh()`
- [x] `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` -- `onNewWorkflow()`: add `this.contextMenu.set(null)` and `this.workflowStore.clearActive()`

**Acceptance Criteria:**
- Given `npm run build` in `frontend-angular/`, when run, then it exits 0 with zero TypeScript errors.
- Given a saved workflow is active (`activeId()` set) and a node's context menu is open, when "New Workflow" is clicked, then `contextMenu()` is `null` and `activeId()` is `null`.
- Given `activeId()` points to an id no longer present in `workflows()` (simulating external deletion), when `refresh()` is called, then `activeId()` becomes `null` and `localStorage.getItem('flowcraft-active-workflow')` is `null`.
- Given New Workflow was clicked (clearing `activeId`) and the canvas is then saved with a name, when `WorkflowStoreService.save` is invoked, then a new entry is created and existing saved workflows are untouched (`workflows().length` increases by one).

## Spec Change Log

## Design Notes

- `SavedWorkflow.nodes`/`edges` validation decision (final): accept the gap. `fromSavedNodes`/`fromSavedEdges` continue to trust the shape returned by `load()`/`loadAll()` without runtime validation -- matches `loadAll()`'s existing "trust the JSON" (`try`/`catch` around `JSON.parse` only) and React's `useWorkflowStore.ts` (same gap there). Hand-edited/corrupted `localStorage` can still break Open, as it already can in the React app. Closes the open question from the C4a and C4b-3 deferred items -- no further tracking needed.
- `clearActive()` centralizes the `activeId.set(null)` + `localStorage.removeItem(ACTIVE_KEY)` pair so `remove()`, `refresh()`, and `onNewWorkflow()` all stay in sync -- the signal and the persisted key never diverge.

## Verification

**Commands:**
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors

**Manual checks (if no CLI):**
- `npm start`, `/workflow-canvas`: Save the canvas as "A" (sets `activeId`). Click New Workflow -- title resets to "Untitled Workflow". Click Open -- confirm no row shows "Active". Click Save, name it "B" -- confirm both "A" and "B" now exist as separate entries (New didn't overwrite "A").
- DevTools console: with "A" active, remove it from `localStorage['flowcraft-workflows']` directly (simulating external deletion), then click Open (triggers `refresh()`) -- confirm `activeId()`/`localStorage['flowcraft-active-workflow']` are cleared and no row shows "Active".

## Suggested Review Order

- `clearActive()` centralizes clearing `activeId` and the persisted `ACTIVE_KEY` so the signal and `localStorage` never diverge.
  [`workflow-store.ts:137`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.ts#L137)

- `refresh()` reconciles a stale `activeId` against the freshly-loaded `workflows()`, clearing it via `clearActive()` when the active entry no longer exists.
  [`workflow-store.ts:152`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.ts#L152)

- `remove()` is refactored to call `clearActive()` instead of its previous inline `activeId.set(null)` + `localStorage.removeItem`.
  [`workflow-store.ts:142`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.ts#L142)

- `onNewWorkflow()` clears the stale context menu and the active workflow reference, so a subsequent Save creates a new entry instead of overwriting.
  [`workflow-canvas.ts:193`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L193)
