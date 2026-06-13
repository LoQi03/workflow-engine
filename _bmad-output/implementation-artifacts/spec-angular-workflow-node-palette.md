---
title: 'Port workflow node palette & drag-to-add to Angular'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: '49a183f971c252dddb14f97d334db0093a08145b'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `frontend-angular` has no way to add new nodes to the canvas. `frontend/src/components/workflow/NodePalette.tsx` (108 lines) renders a draggable sidebar of node templates that drop onto `WorkflowCanvas` via native HTML5 drag-and-drop + ReactFlow's `project()`.

**Approach:** Port `NodePalette` to a standalone `NodePaletteComponent` rendered as a flex sidebar inside `WorkflowCanvasComponent`. Wire native HTML5 drag-and-drop (`dragstart`/`dragover`/`drop`) into `WorkflowCanvasComponent`, using `ngx-vflow`'s `VflowComponent.documentPointToFlowPoint()` for coordinate conversion and `createNode` + `WorkflowNodeComponent` for node creation.

## Boundaries & Constraints

**Always:**
- Create `frontend-angular/src/app/workflow/node-palette/node-palette.ts` (+ `.html`) — standalone `NodePaletteComponent`. Port the 9 `nodeTemplates`, `iconMap`, `colorMap`, `categoryLabels` from `NodePalette.tsx`, grouped by category (Triggers/Actions/Logic/Output). Add `lucideGripVertical` to the lucide icon set for the drag handle.
- Each template item is `draggable`, with `(dragstart)` calling `event.dataTransfer.setData('application/x-vflow-node-template', JSON.stringify(template))` and setting `dataTransfer.effectAllowed = 'move'`.
- Modify `workflow-canvas.ts`/`.html`: wrap the existing `<vflow>` + zoom/fit buttons alongside `<app-node-palette>` in a flex row — mirrors `WorkflowEditor.tsx`'s `<div class="flex flex-1 overflow-hidden"><NodePalette /><WorkflowCanvas /></div>`.
- Add `(dragover)` (calls `event.preventDefault()`, sets `dataTransfer.dropEffect = 'move'`) and `(drop)` handlers on the canvas wrapper div. `onDrop`: read the `application/x-vflow-node-template` payload; if present and parsable, convert `{ x: event.clientX, y: event.clientY }` via `vflow.documentPointToFlowPoint(...)` and append a new node via `createNode<WorkflowNodeData>({ id: \`node-${counter++}\`, point, type: WorkflowNodeComponent, data: { label, type: category, icon, description } })` to the `nodes` signal — mirrors React's `onDrop`/`addNodeAtPosition`. Use a `private nodeIdCounter` instance field, same pattern as C1's `edgeIdCounter`.

**Ask First:**
- If `VflowComponent.documentPointToFlowPoint`'s installed `.d.ts` signature/behavior differs materially from "document point -> flow point" (e.g. requires extra setup or a different input shape), HALT and confirm the approach first.

**Never:**
- No `NodeProperties`/`ContextMenu` (C3) or persistence/chrome — `TopBar`/`SaveDialog`/`WorkflowManager`/`WorkflowEditor`/`WorkflowSelector` (C4) — separate deferred sub-goals.
- No changes under `frontend/` or `backend/`.
- No `@angular/cdk/drag-drop` (`cdkDrag`/`cdkDropList`) — use native HTML5 drag-and-drop to mirror the React reference.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Drag template, drop on canvas | `dragstart` sets payload; `drop` at `(x, y)` | New node appended at `documentPointToFlowPoint({x, y})` with the template's label/category/icon/description | N/A |
| Drop with no/invalid payload | `dataTransfer.getData(...)` returns `''` or unparsable JSON | No node added, no error thrown | Guard on empty string + `try`/`catch` around `JSON.parse` |
| Dragover on canvas | any `dragover` event | `preventDefault()` + `dropEffect = 'move'` so drop is allowed | N/A |

</frozen-after-approval>

## Code Map

- `frontend/src/components/workflow/NodePalette.tsx` -- reference: templates, grouping, drag payload
- `frontend/src/pages/WorkflowEditor.tsx` -- reference: palette+canvas flex layout composition
- `frontend-angular/src/app/workflow/workflow-node/workflow-node.ts` -- reference: `WorkflowNodeData` shape and icon naming for new nodes
- `frontend-angular/src/app/workflow/node-palette/` -- target: new `NodePaletteComponent`
- `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`) -- target: flex layout + dragover/drop handling

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/src/app/workflow/node-palette/node-palette.ts` (+ `.html`) -- create `NodePaletteComponent` with grouped, draggable node templates -- ports `NodePalette.tsx`
- [x] `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`) -- add flex sidebar layout, `onDragOver`/`onDrop` handlers using `documentPointToFlowPoint`/`createNode` -- ports drag-to-add from `WorkflowEditor.tsx`/`WorkflowCanvas.tsx`

**Acceptance Criteria:**
- Given `npm run build` in `frontend-angular/`, when it runs, then it exits 0 with zero TypeScript errors.
- Given `/workflow-canvas`, when the page loads, then a left sidebar lists node templates grouped into Triggers/Actions/Logic/Output, each with an icon, label, and description.
- Given a drag from a palette item to a point on the canvas, when released, then a new node of the template's category appears at that point with the template's label/icon/description.
- Given a drop with no recognizable payload (e.g. a stray file drag), when released on the canvas, then nothing is added and no error is thrown.

## Spec Change Log

## Design Notes

`VflowComponent.documentPointToFlowPoint(point: Point): Point` converts a document-space point (e.g. `{ x: event.clientX, y: event.clientY }`) directly to flow coordinates — no manual `getBoundingClientRect()` subtraction needed, unlike ReactFlow's `project()`.

## Verification

**Commands:**
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors
- `cd frontend-angular && npm start` -- expected: serves on port 4200; navigate to `/workflow-canvas`, drag palette items onto the canvas, and verify new nodes appear at the drop point

## Suggested Review Order

**Layout**

- Entry point: flex row composes the new palette sidebar with a drop-target wrapper around `<vflow>`, mirroring `WorkflowEditor.tsx`'s layout.
  [`workflow-canvas.html:1`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L1)

**Drag-to-add wiring**

- `onDrop` converts the drop point via `documentPointToFlowPoint` and appends a new node via `createNode` — the core of C2.
  [`workflow-canvas.ts:80`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L80)

- `isNodeTemplate` type-guards the parsed drag payload before it can reach `createNode`, rejecting malformed/invalid categories.
  [`workflow-canvas.ts:92`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L92)

- `onDragOver` calls `preventDefault()`/`dropEffect = 'move'` so the wrapper accepts the drop.
  [`workflow-canvas.ts:73`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L73)

**Node palette**

- Grouped, draggable template rows ported 1:1 from `NodePalette.tsx`, with `(dragstart)` setting the drag payload.
  [`node-palette.html:18`](../../frontend-angular/src/app/workflow/node-palette/node-palette.html#L18)

- `onDragStart` serializes the template and sets `effectAllowed = 'move'` via the shared MIME constant.
  [`node-palette.ts:128`](../../frontend-angular/src/app/workflow/node-palette/node-palette.ts#L128)

**Shared producer/consumer contract**

- `NODE_TEMPLATE_DATA_TRANSFER_TYPE` and `isNodeTemplate` are exported here (palette = producer) and imported by the canvas (consumer) to avoid string-literal drift.
  [`node-palette.ts:69`](../../frontend-angular/src/app/workflow/node-palette/node-palette.ts#L69)
