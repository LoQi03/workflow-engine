---
title: 'Port workflow node context menu to Angular'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: '0f18c047647044aeddb1e27bbf4a15b42a9c2b61'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `frontend-angular`'s workflow canvas has no right-click node menu. `frontend/src/components/workflow/ContextMenu.tsx` (81 lines)'s `node` branch (Duplicate, Delete Node) is unported.

**Approach:** Add a standalone `ContextMenuComponent` for the `node` branch — C3d will later extend its positioning/close-on-outside-click infrastructure with a canvas "Add Node" branch. `WorkflowNodeComponent` gets a `contextMenuRequested` output + host `(contextmenu)` listener, bubbled via `<vflow (componentNodeEvent)>`. Canvas (C3d) and edge (C3c) menus remain deferred.

## Boundaries & Constraints

**Always:**
- Create `frontend-angular/src/app/workflow/context-menu/context-menu.ts` (+ `.html`): standalone `ContextMenuComponent` with `x = input.required<number>()`, `y = input.required<number>()`, outputs `closed = output<void>()`, `duplicateNode = output<void>()`, `deleteNode = output<void>()`. Port `ContextMenu.tsx`'s `node` branch: a "Duplicate" row (`lucideCopy` or closest `@ng-icons/lucide` equivalent) + divider + destructive "Delete Node" row (`lucideTrash2`), with its viewport-clamped fixed positioning (`Math.min(x, window.innerWidth - 200)` / `Math.min(y, window.innerHeight - 250)`) and item classes/animation. Close on outside click via a host `(document:mousedown)` listener + injected `ElementRef.nativeElement.contains()`, emitting `closed`.
- In `frontend-angular/src/app/workflow/workflow-node/workflow-node.ts` (+ `.html`): add `readonly contextMenuRequested = output<{ x: number; y: number }>();` and `host: { '(contextmenu)': 'onContextMenu($event)' }`, with `protected onContextMenu(event: MouseEvent)` calling `event.preventDefault(); event.stopPropagation();` then emitting `{ x: event.clientX, y: event.clientY }`.
- In `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts`: add `protected readonly contextMenu = signal<{ x: number; y: number; nodeId: string } | null>(null);`. Add `(componentNodeEvent)="onComponentNodeEvent($event)"` to `<vflow>`; `onComponentNodeEvent(event: ComponentNodeEvent<[WorkflowNodeComponent]>)` sets `contextMenu` to `{ x: event.eventPayload.x, y: event.eventPayload.y, nodeId: event.nodeId }` when `event.eventName === 'contextMenuRequested'`.
- Add `onNodeDuplicate(id: string)` to `WorkflowCanvasComponent` (ports `duplicateNode`): find the node by id, `createNode<WorkflowNodeData>` with `id: node-${this.nodeIdCounter++}`, `point: { x: node.point().x + 40, y: node.point().y + 40 }`, `data: { ...node.data!() }`; append to `nodes`.
- In `workflow-canvas.html`: render `@if (contextMenu(); as menu) { <app-context-menu [x]="menu.x" [y]="menu.y" (closed)="contextMenu.set(null)" (duplicateNode)="onNodeDuplicate(menu.nodeId); contextMenu.set(null)" (deleteNode)="onNodeDelete(menu.nodeId); contextMenu.set(null)" /> }`.

**Ask First:** None — investigated during C3b scoping (see `deferred-work.md` C3c/C3d); the `(componentNodeEvent)` + host `(contextmenu)` pattern is confirmed feasible.

**Never:**
- No canvas "Add Node" (C3d) or edge "Delete Connection" (C3c) menus — both deferred.
- No changes under `frontend/` or `backend/`.
- No template-type edge rewrite.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Right-click a node | `contextmenu` on a node | Menu opens at cursor (Duplicate, Delete Node) | `stopPropagation()` stops further bubbling |
| Click outside an open menu | `mousedown` outside it | `contextMenu` set to `null`, menu closes | N/A |
| Duplicate Node | click "Duplicate" | Copy created at +40/+40 with same data; menu closes | N/A |
| Delete Node (from menu) | click "Delete Node" | Node + edges removed (`onNodeDelete`); menu closes | N/A |

</frozen-after-approval>

## Code Map

- `frontend/src/components/workflow/ContextMenu.tsx` -- reference: `node` branch only (canvas/edge out of scope — C3d/C3c)
- `frontend/src/components/workflow/WorkflowCanvas.tsx` -- reference: `duplicateNode`, context-menu state shape
- `frontend-angular/src/app/workflow/context-menu/` -- target: new `ContextMenuComponent`
- `frontend-angular/src/app/workflow/workflow-node/workflow-node.ts` (+ `.html`) -- target: `contextMenuRequested` output + host `(contextmenu)`
- `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`) -- target: `contextMenu` state, `onComponentNodeEvent`, `onNodeDuplicate`, render `<app-context-menu>`

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/src/app/workflow/context-menu/context-menu.ts` (+ `.html`) -- create `ContextMenuComponent` -- Duplicate/Delete Node menu, positioning, click-outside
- [x] `frontend-angular/src/app/workflow/workflow-node/workflow-node.ts` (+ `.html`) -- add `contextMenuRequested` output + host `(contextmenu)` listener -- captures node right-click
- [x] `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`) -- add `contextMenu` state, `onComponentNodeEvent`, `onNodeDuplicate`, render `<app-context-menu>` -- wires the menu into the canvas

**Acceptance Criteria:**
- Given `npm run build` in `frontend-angular/`, when it runs, then it exits 0 with zero TypeScript errors.
- Given `/workflow-canvas`, when a node is right-clicked, then a menu with Duplicate and Delete Node appears at the cursor.
- Given the node menu, when "Duplicate" is clicked, then a copy of the node appears offset by (40, 40) and the menu closes.
- Given the node menu, when "Delete Node" is clicked, then the node and its connected edges are removed and the menu closes.
- Given an open menu, when a click occurs outside it, then the menu closes.

## Spec Change Log

## Verification

**Commands:**
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors

**Manual checks (if no CLI):**
- `cd frontend-angular && npm start`, on `/workflow-canvas`: right-click a node — verify the menu appears, Duplicate creates an offset copy, Delete Node removes the node+edges, and outside clicks dismiss it.

## Suggested Review Order

**New context menu component**

- Entry point: standalone menu with viewport-clamped positioning and click-outside close.
  [`context-menu.ts:17`](../../frontend-angular/src/app/workflow/context-menu/context-menu.ts#L17)

- Duplicate/Delete Node rows ported from `ContextMenu.tsx`'s `node` branch.
  [`context-menu.html:6`](../../frontend-angular/src/app/workflow/context-menu/context-menu.html#L6)

**Node right-click → event bubbling**

- Host listener captures the native right-click and stops it bubbling to the canvas.
  [`workflow-node.ts:73`](../../frontend-angular/src/app/workflow/workflow-node/workflow-node.ts#L73)

- New `contextMenuRequested` output carries cursor coordinates to the canvas.
  [`workflow-node.ts:78`](../../frontend-angular/src/app/workflow/workflow-node/workflow-node.ts#L78)

**Canvas wiring**

- `(componentNodeEvent)` subscribes the canvas to per-node component events.
  [`workflow-canvas.html:13`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L13)

- `onComponentNodeEvent` narrows on `eventName` and opens the menu at the click position.
  [`workflow-canvas.ts:156`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L156)

- `onNodeDuplicate` ports `duplicateNode`, offsetting the copy by (40, 40).
  [`workflow-canvas.ts:142`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L142)

- Menu is rendered conditionally and wired to duplicate/delete/close handlers.
  [`workflow-canvas.html:50`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L50)

- Keyboard delete now also closes a stale menu pointing at the removed node (review patch).
  [`workflow-canvas.ts:181`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L181)

**Peripherals**

- Scope record: C3b narrowed to the node branch; C3c/C3d split out; a11y note extended.
  [`deferred-work.md:44`](deferred-work.md#L44)
