---
title: 'Port workflow canvas core to Angular via ngx-vflow'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: '64128910627d81480c2410a3edf3c0cdeec8747e'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `frontend-angular` has no workflow canvas yet. `frontend/src/components/workflow/WorkflowCanvas.tsx` (242 lines) and `WorkflowNode.tsx` (100 lines) render an interactive node-graph on ReactFlow v11, which has no direct Angular equivalent.

**Approach:** Integrate `ngx-vflow` v2.6.0 (signal-based Angular graph library, Angular `19.2.17 || 20.x || 21.x` compatible) as the `<vflow>` canvas. Port `WorkflowNode` to a `WorkflowNodeComponent extends CustomNodeComponent<WorkflowNodeData>` used as a component node, and port `WorkflowCanvas` to a `WorkflowCanvasComponent` covering background/minimap/controls, pan/zoom/select/connect/delete.

## Boundaries & Constraints

**Always:**
- `npm install ngx-vflow` in `frontend-angular` (its peer deps allow Angular 21).
- Create `frontend-angular/src/app/workflow/workflow-node/workflow-node.ts` (+ `.html`) — standalone `WorkflowNodeComponent extends CustomNodeComponent<WorkflowNodeData>`, with `WorkflowNodeData` matching `WorkflowNode.tsx`'s data shape (`label`, `type: 'trigger'|'action'|'condition'|'output'`, `icon?`, `description?`). Mirror the card markup and icon/color maps, reading `this.data()`/`this.selected()`. Render `<handle position="top" type="target">` unless `type === 'trigger'`, always `<handle position="bottom" type="source">`, and `<handle position="right" type="source" id="false">` when `type === 'condition'`.
- Create `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`) — standalone `WorkflowCanvasComponent` rendering `<vflow [nodes]="nodes" [edges]="edges" [background]="{ type: 'dots', gap: 20, size: 1, color: 'hsl(var(--canvas-grid))' }" [snapGrid]="[16, 16]" (connect)="onConnect($event)">` plus `<mini-map>`. Build `nodes`/`edges` via `createNodes`/`createEdges` mirroring `defaultNodes`/`defaultEdges` from `WorkflowCanvas.tsx`, with node `type: WorkflowNodeComponent` and edge `curve: 'smooth-step'`.
- `onConnect(connection: Connection)`: build a new edge via `createEdge({ ...connection, curve: 'smooth-step' })` and append it to `edges` — mirrors React's `onConnect`/`addEdge`.
- Hand-build zoom-in/zoom-out/fit-view buttons in `WorkflowCanvasComponent`'s template, calling the `<vflow>` template reference's `zoomTo`/`fitView`/`viewport()` — covers ngx-vflow's missing Controls.
- Host-listen for `Delete`/`Backspace`: remove any node/edge whose `selected()` is `true` from `nodes`/`edges`, plus any edge referencing a deleted node — mirrors React's cascading delete.
- After `<vflow>`'s `(initialized)` first emits `true`, call `fitView()` once — mirrors the `fitView` prop.
- Register `WorkflowCanvasComponent` at route `workflow-canvas` in `app.routes.ts` for verification.

**Ask First:**
- If `ngx-vflow`'s installed `.d.ts` shapes for `(connect)`/`createEdge`/`createNodes`/`CustomNodeComponent` differ materially, HALT and confirm the approach first.

**Never:**
- No `NodePalette` (C2), `NodeProperties`/`ContextMenu` (C3), or persistence/chrome — `TopBar`/`SaveDialog`/`WorkflowManager`/`WorkflowEditor` (C4) — separate deferred sub-goals.
- No changes under `frontend/` or `backend/`.
- Do not attempt ReactFlow's `MiniMap nodeColor` per-type coloring — ngx-vflow's `<mini-map>` has no equivalent input; use its defaults.

</frozen-after-approval>

## Code Map

- `frontend/src/components/workflow/WorkflowCanvas.tsx` -- reference: canvas wiring, defaults, connect/delete behavior
- `frontend/src/components/workflow/WorkflowNode.tsx` -- reference: node markup, icon/color maps, handles
- `frontend-angular/package.json` -- target: add `ngx-vflow`
- `frontend-angular/src/app/workflow/workflow-node/` -- target: new `WorkflowNodeComponent`
- `frontend-angular/src/app/workflow/workflow-canvas/` -- target: new `WorkflowCanvasComponent`
- `frontend-angular/src/app/app.routes.ts` -- target: register `workflow-canvas` route

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/package.json` -- `npm install ngx-vflow` -- adds the graph/canvas library
- [x] `frontend-angular/src/app/workflow/workflow-node/workflow-node.ts` (+ `.html`) -- create `WorkflowNodeComponent extends CustomNodeComponent<WorkflowNodeData>` with icon/color maps and conditional `<handle>` elements -- ports `WorkflowNode.tsx`
- [x] `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`) -- create `WorkflowCanvasComponent` per the Boundaries above -- ports `WorkflowCanvas.tsx`
- [x] `frontend-angular/src/app/app.routes.ts` -- add route `workflow-canvas` -> `WorkflowCanvasComponent` -- makes it reachable for verification

**Acceptance Criteria:**
- Given `npm run build` in `frontend-angular/`, when it runs, then it exits 0 with zero TypeScript errors.
- Given `/workflow-canvas`, when the page loads, then the 5 default nodes render with custom card UI, the dotted background and minimap are visible, and the viewport auto-fits all nodes.
- Given a drag from one node's source handle to another node's target handle, when released, then a new edge appears connecting them.
- Given a selected node or edge, when Delete or Backspace is pressed, then it is removed (and for a deleted node, any edges referencing it are also removed).
- Given the canvas, when the user drags empty space, scrolls/pinches, or clicks the zoom-in/zoom-out/fit-view buttons, then the viewport pans, zooms, or re-centers accordingly.

## Spec Change Log

## Design Notes

`ngx-vflow`'s `Node`/`Edge` objects wrap mutable fields (`point`, `selected`, `data`) in `WritableSignal`s, built via `createNodes`/`createEdges`. `<handle>` takes lowercase `position` strings (`'top'|'bottom'|'left'|'right'`), unlike ReactFlow's `Position` enum.

## Verification

**Commands:**
- `cd frontend-angular && npm install` -- expected: exits 0
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors
- `cd frontend-angular && npm start` -- expected: serves on port 4200; navigate to `/workflow-canvas` and verify pan/zoom/select/connect/delete plus the zoom/fit-view buttons

## Suggested Review Order

**Library integration & route wiring**

- Entry point: new `<vflow>` canvas replaces ReactFlow — background/snapGrid/connect/minimap config mirrors `WorkflowCanvas.tsx`.
  [`workflow-canvas.html:2`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L2)

- New dependency added for the graph/canvas library.
  [`package.json:27`](../../frontend-angular/package.json#L27)

- New route makes `/workflow-canvas` reachable for manual verification.
  [`app.routes.ts:7`](../../frontend-angular/src/app/app.routes.ts#L7)

**Canvas behavior — connect, delete, zoom/fit**

- Default 5-node/4-edge demo graph, ported 1:1 from `defaultNodes`/`defaultEdges`.
  [`workflow-canvas.ts:7`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L7)

- `onConnect` de-dupes identical connections before appending, matching ReactFlow's `addEdge`.
  [`workflow-canvas.ts:56`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L56)

- One-shot `fitView()` after `<vflow>` reports `initialized()`.
  [`workflow-canvas.ts:47`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L47)

- Delete/Backspace cascade-delete skips editable targets and calls `preventDefault()`, matching ReactFlow's `deleteKeyCode`.
  [`workflow-canvas.ts:87`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L87)

- Hand-built zoom-in/zoom-out/fit-view buttons cover ngx-vflow's missing Controls.
  [`workflow-canvas.html:15`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L15)

**Custom node — icon/color mapping and handles**

- `WorkflowNodeComponent extends CustomNodeComponent<T>`, with icon/color/border computed from `data()`/`selected()`.
  [`workflow-node.ts:62`](../../frontend-angular/src/app/workflow/workflow-node/workflow-node.ts#L62)

- Conditional `<handle>` elements: top target unless trigger, bottom source always, right source `"false"` for condition nodes.
  [`workflow-node.html:15`](../../frontend-angular/src/app/workflow/workflow-node/workflow-node.html#L15)

**Theming**

- New CSS variables for canvas grid color and per-type node accent colors.
  [`styles.css:44`](../../frontend-angular/src/styles.css#L44)
