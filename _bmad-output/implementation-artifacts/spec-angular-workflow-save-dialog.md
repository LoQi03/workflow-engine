---
title: 'Port SaveDialog + Save wiring to Angular'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: 'ffe7932308dd28a7bd54eb39806b06891bea85e1'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** C4b-1 wired `TopBar`'s `save` output but left it unbound -- clicking Save does nothing. There's no UI to rename and persist the current canvas via `WorkflowStoreService`.

**Approach:** Port `SaveDialogComponent` (raw Tailwind + `@ng-icons/lucide` modal, name input + Save/Cancel, `linkedSignal` for the editable name seeded from `workflowName`). Bind `TopBar.save` to open it; add `showSaveDialog` state and `onSaveConfirm` to `WorkflowCanvasComponent`, calling `WorkflowStoreService.save` via `toSavedNodes`/`toSavedEdges`.

## Boundaries & Constraints

**Always:**
1. `frontend-angular/src/app/workflow/save-dialog/save-dialog.ts` (+ `.html`): standalone OnPush `SaveDialogComponent`, selector `app-save-dialog`. `defaultName = input.required<string>()`; outputs `save = output<string>()` (emits trimmed name), `closed = output<void>()`. Internal `protected readonly name = linkedSignal(() => this.defaultName())`. Port `SaveDialog.tsx` verbatim: `fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm` overlay; card `bg-card border border-border rounded-lg shadow-2xl shadow-black/50 w-[380px] animate-in fade-in zoom-in-95 duration-150`; header (Save icon + "Save Workflow" title + close `X` button -> `closed.emit()`); body (label "Workflow Name" + text input bound to `name`, autofocus, Enter triggers save if non-empty); footer (Cancel -> `closed.emit()`, Save -> emits `name().trim()`, disabled when `name().trim()` empty). `provideIcons`: `lucideSave`, `lucideX`.
2. `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts`: import `SaveDialogComponent` and `WorkflowStoreService`/`toSavedNodes`/`toSavedEdges` from `../workflow-store/workflow-store`. Add `SaveDialogComponent` to standalone `imports`. Inject `private readonly workflowStore = inject(WorkflowStoreService)`. New state `protected readonly showSaveDialog = signal(false)`. New method `protected onSaveConfirm(name: string): void` -- calls `this.workflowStore.save(name, toSavedNodes(this.nodes()), toSavedEdges(this.edges()), this.workflowStore.activeId() ?? undefined)`, then `this.workflowName.set(name)`, then `this.showSaveDialog.set(false)`.
3. `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html`: bind `<app-top-bar [workflowName]="workflowName()" (newWorkflow)="onNewWorkflow()" (save)="showSaveDialog.set(true)" />`. Add `@if (showSaveDialog()) { <app-save-dialog [defaultName]="workflowName()" (save)="onSaveConfirm($event)" (closed)="showSaveDialog.set(false)" /> }` as a sibling near the end of the outer `flex flex-col` wrapper (fixed positioning makes DOM placement order-independent).

**Ask First:** None -- fully derivable from `SaveDialog.tsx`, `WorkflowEditor.tsx`'s `handleSave`/`handleSaveConfirm`, and C4a's `WorkflowStoreService`.

**Never:**
- `WorkflowManagerComponent` + Open/Load/Delete -- deferred follow-up (C4b-3).
- No toast/notification system (`sonner` unported, Goal B) -- skip React's `toast.success('Workflow saved')`.
- No `WorkflowSelector`/`app.routes.ts` changes -- Goal D.
- No changes under `frontend/`/`backend/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|----------|--------------|---------------------------|
| Click Save in TopBar | `showSaveDialog()` false | `showSaveDialog` -> true; `SaveDialogComponent` opens, `name()` seeded from current `workflowName()` |
| Confirm with non-empty name | Save clicked or Enter pressed, `name().trim()` non-empty | `WorkflowStoreService.save(...)` called with `toSavedNodes(nodes())`/`toSavedEdges(edges())`/`activeId() ?? undefined`; `workflowName` updated; dialog closes |
| Confirm with empty/whitespace name | `name().trim()` empty | Save button disabled; Enter is a no-op |
| Cancel / close (X) | -- | `showSaveDialog` -> false; no store mutation |

</frozen-after-approval>

## Code Map

- Reference: `frontend/src/components/workflow/SaveDialog.tsx`, `frontend/src/pages/WorkflowEditor.tsx` (`handleSave`/`handleSaveConfirm`)
- `frontend-angular/src/app/workflow/save-dialog/save-dialog.ts` (+ `.html`, NEW)
- `frontend-angular/src/app/workflow/workflow-store/workflow-store.ts` (reference: `WorkflowStoreService.save`, `activeId`, `toSavedNodes`/`toSavedEdges`)
- `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`)

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/src/app/workflow/save-dialog/save-dialog.ts` (+ `.html`) -- `SaveDialogComponent`
- [x] `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`) -- `showSaveDialog` state, `onSaveConfirm`, TopBar `(save)` wiring, `<app-save-dialog>`

**Acceptance Criteria:**
- Given `npm run build` in `frontend-angular/`, when run, then it exits 0 with zero TypeScript errors.
- Given `/workflow-canvas`, when the Save button in TopBar is clicked, then `SaveDialogComponent` renders centered over the canvas, pre-filled with the current workflow name.
- Given the dialog is open and the name is edited then Save is clicked (or Enter pressed), when `WorkflowStoreService.save` is invoked, then `workflows()` gains/updates an entry with the new name, `activeId()` is set, and the dialog closes.
- Given the name field is empty or whitespace-only, when observed, then the Save button is disabled and Enter does nothing.
- Given Cancel or the close (X) is clicked, when observed, then the dialog closes and `WorkflowStoreService.workflows()`/`activeId()` are unchanged.

## Verification

**Commands:**
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors

**Manual checks (if no CLI):**
- `npm start`, `/workflow-canvas`: click Save, edit the name, click Save -> dialog closes and the title bar updates; open browser devtools and confirm `localStorage['flowcraft-workflows']` contains the new entry with the edited name.

## Suggested Review Order

**SaveDialog (new component)**

- Entry point: `SaveDialogComponent`'s contract -- `defaultName` input, `save`/`closed` outputs, and the `linkedSignal`-backed editable `name`.
  [`save-dialog.ts:14`](../../frontend-angular/src/app/workflow/save-dialog/save-dialog.ts#L14)

- Ports `SaveDialog.tsx` verbatim: overlay/card/header/body/footer in raw Tailwind + `@ng-icons/lucide`.
  [`save-dialog.html:1`](../../frontend-angular/src/app/workflow/save-dialog/save-dialog.html#L1)

- `onSave` trims and emits; the template's `[disabled]`/Enter guards both gate on the same `name().trim()` check, matching React's duplicated guard.
  [`save-dialog.ts:21`](../../frontend-angular/src/app/workflow/save-dialog/save-dialog.ts#L21)

**Canvas wiring**

- `onSaveConfirm` persists via `WorkflowStoreService.save`, using `toSavedNodes`/`toSavedEdges` and the current `activeId` as `existingId`.
  [`workflow-canvas.ts:148`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L148)

- TopBar's `save` output now opens the dialog instead of being a no-op.
  [`workflow-canvas.html:2`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L2)

- `<app-save-dialog>` renders conditionally on `showSaveDialog`, wired to `onSaveConfirm`/dismiss.
  [`workflow-canvas.html:66`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L66)

**Peripherals**

- `WorkflowStoreService` injected and `showSaveDialog` state added alongside existing canvas state.
  [`workflow-canvas.ts:45`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L45)

- Review surfaced that `onNewWorkflow` doesn't reset `activeId`, so New -> Save overwrites the previously-active entry -- deferred to C4b-3 alongside its `activeId` reconciliation work.
  [`deferred-work.md:128`](deferred-work.md#L128)
