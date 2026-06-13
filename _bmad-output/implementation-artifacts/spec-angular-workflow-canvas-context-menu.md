---
title: 'Port workflow canvas "Add Node" context menu to Angular'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: '09079944f8c3879e03afc9d185e1240fdf2fbe2d'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `frontend-angular`'s workflow canvas has no right-click "Add Node" menu; `ContextMenu.tsx`'s `canvas` branch (header + Trigger/Action/Condition/Output rows) is unported -- C3b shipped only the `node` branch.

**Approach:** Extend C3b's `ContextMenuComponent` with a `type: 'node' | 'canvas'` input and an `addNode` output. `WorkflowCanvasComponent` gets a `(contextmenu)` listener on the canvas wrapper (nodes already `stopPropagation()`), computing the flow position via `documentPointToFlowPoint`; `onAddNodeFromMenu` ports `addNodeAtPosition`.

## Boundaries & Constraints

**Always:**
- In `frontend-angular/src/app/workflow/context-menu/context-menu.ts` (+ `.html`): add `readonly type = input.required<'node' | 'canvas'>();` and `readonly addNode = output<'trigger' | 'action' | 'condition' | 'output'>();`; register `lucideZap`, `lucidePlay`, `lucideGitBranch`, `lucideSend` alongside `lucideCopy`/`lucideTrash2` in `provideIcons`. Template: wrap the existing rows in `@if (type() === 'node') { ... } @else { ... }`; the `@else` branch ports `ContextMenu.tsx`'s `canvas` branch verbatim -- an "Add Node" header row, then Trigger/`lucideZap`/`--node-trigger`, Action/`lucidePlay`/`--node-action`, Condition/`lucideGitBranch`/`--node-condition`, Output/`lucideSend`/`--node-output` rows, each styled via `[style.color]="'hsl(var(--node-*))'"` + `(click)="addNode.emit('category')"`.
- In `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts`: change `contextMenu`'s type to `{ type: 'node'; x: number; y: number; nodeId: string } | { type: 'canvas'; x: number; y: number; flowPoint: { x: number; y: number } } | null`; `onComponentNodeEvent` sets `{ type: 'node', ... }`. Add `protected onCanvasContextMenu(event: MouseEvent)`: `event.preventDefault()`; if `this.vflow()` exists, compute `flowPoint` via `documentPointToFlowPoint({ x: event.clientX, y: event.clientY })` and set `contextMenu` to `{ type: 'canvas', x: event.clientX, y: event.clientY, flowPoint }`. Add `protected onAddNodeFromMenu(category: 'trigger' | 'action' | 'condition' | 'output', point: { x: number; y: number })`, porting `addNodeAtPosition` verbatim (category-defaults record + `createNode<WorkflowNodeData>` with `id: node-${this.nodeIdCounter++}`, `point`, `type: WorkflowNodeComponent`, `data` from the matched default), appended to `nodes`. In `onKeyDown`'s menu-close guard, narrow on `menu.type === 'node'` before reading `nodeId`.
- In `workflow-canvas.html`: add `(contextmenu)="onCanvasContextMenu($event)"` to the canvas wrapper `<div>` (the one with `(dragover)`/`(drop)`). Update `<app-context-menu>`: add `[type]="menu.type"`, guard `duplicateNode`/`deleteNode` with `menu.type === 'node' &&`, and add `(addNode)="menu.type === 'canvas' && onAddNodeFromMenu($event, menu.flowPoint); contextMenu.set(null)"`.

**Ask First:** None -- fully derivable from `ContextMenu.tsx`'s `canvas` branch, `WorkflowCanvas.tsx`'s `addNodeAtPosition`, and C3b's `ContextMenuComponent`/`contextMenu` patterns.

**Never:**
- No edge context menu (C3c deferred); no changes under `frontend/`/`backend/`; no regression to C3b's Duplicate/Delete behavior.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Right-click empty canvas | `contextmenu` on background | "Add Node" menu opens at cursor; flow position captured | -- |
| Right-click a node | `contextmenu` on node | Node menu opens; canvas menu doesn't also open | C3b's `stopPropagation()` |
| Click a category row | click Trigger/Action/Condition/Output | Node with category defaults appears at flow position; menu closes | -- |
| Click outside an open menu | `mousedown` outside it | menu closes regardless of `type` | -- |

</frozen-after-approval>

## Code Map

- `frontend/src/components/workflow/ContextMenu.tsx` (reference)
- `frontend/src/components/workflow/WorkflowCanvas.tsx` (reference)
- `frontend-angular/src/app/workflow/context-menu/context-menu.ts` (+ `.html`)
- `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`)

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/src/app/workflow/context-menu/context-menu.ts` (+ `.html`) -- `type` input + `addNode` output, canvas "Add Node" branch
- [x] `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` -- `contextMenu` union type, `onCanvasContextMenu`, `onAddNodeFromMenu`, `onComponentNodeEvent`/`onKeyDown` updates
- [x] `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html` -- `(contextmenu)` binding + `<app-context-menu>` updates

**Acceptance Criteria:**
- Given `npm run build` in `frontend-angular/`, when it runs, then it exits 0 with zero TypeScript errors.
- Given `/workflow-canvas`, when empty canvas is right-clicked, then the "Add Node" menu (Trigger/Action/Condition/Output) appears at the cursor.
- Given the canvas menu, when a category row is clicked, then a node with that category's defaults appears at the captured flow position and the menu closes.
- Given a node's context menu (C3b), when "Duplicate"/"Delete Node" is clicked, then behavior is unchanged.
- Given an open menu, when a click occurs outside it, then it closes.

## Spec Change Log

## Verification

**Commands:**
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors

**Manual checks (if no CLI):**
- `cd frontend-angular && npm start`, on `/workflow-canvas`: right-click empty canvas to open "Add Node"; click each category and confirm a labeled/colored node appears at the click position; right-click a node to confirm Duplicate/Delete Node still work; outside clicks dismiss both menus.

## Suggested Review Order

**Canvas right-click → flow position capture**

- Entry point: right-click on empty canvas now captures the flow-space point via `documentPointToFlowPoint`.
  [`workflow-canvas.ts:166`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L166)

- `(contextmenu)` binding added to the canvas wrapper, alongside the existing drag/drop handlers.
  [`workflow-canvas.html:4`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L4)

**Context menu's node/canvas branching**

- `type` input + `addNode` output extend C3b's menu for the new canvas variant.
  [`context-menu.ts:19`](../../frontend-angular/src/app/workflow/context-menu/context-menu.ts#L19)

- Template splits into `@if (type() === 'node')` (Duplicate/Delete) vs `@else` (Add Node).
  [`context-menu.html:6`](../../frontend-angular/src/app/workflow/context-menu/context-menu.html#L6)

- Canvas branch ports `ContextMenu.tsx`'s "Add Node" header + category rows with `--node-*` colors.
  [`context-menu.html:22`](../../frontend-angular/src/app/workflow/context-menu/context-menu.html#L22)

**Add-node wiring**

- `contextMenu` signal becomes a discriminated union (`node` | `canvas`) to carry the flow point.
  [`workflow-canvas.ts:50`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L50)

- `onAddNodeFromMenu` ports `addNodeAtPosition`'s category-defaults record and node creation.
  [`workflow-canvas.ts:176`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L176)

- `<app-context-menu>` now passes `[type]`, guards Duplicate/Delete by `menu.type === 'node'`, and wires `addNode`.
  [`workflow-canvas.html:51`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L51)

**Peripherals**

- `onComponentNodeEvent` tags node-menu state with `type: 'node'` for the new union.
  [`workflow-canvas.ts:162`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L162)

- Keyboard-delete's stale-menu check now narrows on `menu.type === 'node'` before reading `nodeId`.
  [`workflow-canvas.ts:213`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L213)

- Review surfaced two non-blocking items: defaults duplication and the bundled a11y pass scope.
  [`deferred-work.md:200`](deferred-work.md#L200)
