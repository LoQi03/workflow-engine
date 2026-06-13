---
title: 'Port workflow node properties panel to Angular'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: 'c35559053d2a2fa81c5dad3f8198ef0b92ca5209'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `frontend-angular` has no way to view or edit a selected node's configuration. `frontend/src/components/workflow/NodeProperties.tsx` (202 lines) renders a right-side panel with label/description fields plus 4 type-specific config sections (trigger/action/condition/output), built on Goal B's Input/Select/Switch/Textarea/Label/Button primitives.

**Approach:** Port to a standalone `NodePropertiesComponent` shown in `WorkflowCanvasComponent` whenever a node is selected, using `ngx-vflow`'s built-in `selected` signal (selection mode `'default'` — no extra click wiring). Extend `WorkflowNodeData` with the optional type-specific fields the React component reads, and edit them by mutating `node.data` (a `WritableSignal`) directly via `.update()`.

## Boundaries & Constraints

**Always:**
- In `frontend-angular/src/app/workflow/workflow-node/workflow-node.ts`, extend `WorkflowNodeData` with optional fields: `method?`, `endpoint?` (trigger), `timeout?`, `retry?`, `maxRetries?` (action), `expression?` (condition), `statusCode?`, `responseBody?` (output) — mirrors every `node.data.X` access in `NodeProperties.tsx`.
- Create `frontend-angular/src/app/workflow/node-properties/node-properties.ts` (+ `.html`) — standalone `NodePropertiesComponent` with `node = input.required<ComponentNode<WorkflowNodeData>>()` and `deleted = output<string>()`. Read current data via `node().data!()`; mutate via `node().data!.update(d => ({ ...d, [field]: value }))`. The close (X) button calls `node().selected!.set(false)` directly — no extra output needed.
- Port label/description fields, the node-id badge, all 4 type-specific config sections (trigger: Method select + Endpoint input; action: Timeout input + Retry switch + conditional Max retries input; condition: Expression textarea; output: Status code input + Response body textarea), and the "Delete Node" button from `NodeProperties.tsx`, using `HlmInputImports`/`HlmTextareaImports`/`HlmSelectImports`/`HlmSwitchImports`/`HlmLabelImports`/`HlmButtonImports` (per `ui-showcase.html`'s usage patterns) and `NgIcon` with `lucideX` for the close icon.
- In `workflow-canvas.ts`, import `isComponentNode` from `ngx-vflow` and add `selectedNode = computed(() => { const n = this.nodes().find(x => x.selected?.()); return n && isComponentNode<WorkflowNodeData>(n) ? n : undefined; })`. In `workflow-canvas.html`, add `@if (selectedNode(); as node) { <app-node-properties [node]="node" (deleted)="onNodeDelete($event)" /> }` as a third flex child alongside the palette and canvas wrapper.
- Add `onNodeDelete(id: string)` to `WorkflowCanvasComponent`: filter the deleted id out of `nodes`, and filter edges where `source === id || target === id` out of `edges` — mirrors the deletion logic already in `onKeyDown`.

**Ask First:**
- If `ngx-vflow`'s default `selectionMode` does not actually toggle `node.selected` on click/pane-click as the `.d.ts` strategy comments imply (verify by clicking a node and an empty area while the panel is open), HALT and confirm before adding manual click handlers.

**Never:**
- No context menu (deferred to C3b) or persistence/chrome (C4).
- No changes under `frontend/` or `backend/`.
- No new node-ID generation — deletion only removes existing ids, never creates new ones.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Select a node | click sets `node.selected` true | Properties panel renders on the right with that node's id/label/description/type-specific fields | N/A |
| Edit a field | type/select/toggle in the panel | `node.data` updates via `.update()`; `WorkflowNodeComponent` reflects the new label/icon live (same signal) | N/A |
| Close panel | click the X | `node.selected.set(false)`; `selectedNode` recomputes to `undefined`, panel disappears | N/A |
| Delete node | click "Delete Node" | node removed from `nodes`, its edges removed from `edges`, panel disappears | N/A |
| Multiple nodes selected (e.g. marquee) | `nodes().filter(n => n.selected?.())` has >1 entries | Panel shows the first match from `.find()` | N/A |

</frozen-after-approval>

## Code Map

- `frontend/src/components/workflow/NodeProperties.tsx` -- reference: fields, type-specific sections, defaults
- `frontend-angular/src/app/workflow/workflow-node/workflow-node.ts` -- target: extend `WorkflowNodeData`
- `frontend-angular/src/app/ui-showcase/ui-showcase.html` -- reference: `hlm-select`/`hlm-switch`/`hlmInput`/`hlmTextarea`/`hlmLabel` usage
- `frontend-angular/src/app/workflow/node-properties/` -- target: new `NodePropertiesComponent`
- `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`) -- target: `selectedNode` computed, panel rendering, `onNodeDelete`

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/src/app/workflow/workflow-node/workflow-node.ts` -- extend `WorkflowNodeData` with optional `method`, `endpoint`, `timeout`, `retry`, `maxRetries`, `expression`, `statusCode`, `responseBody` -- supports type-specific config persistence
- [x] `frontend-angular/src/app/workflow/node-properties/node-properties.ts` (+ `.html`) -- create `NodePropertiesComponent` with label/description/type-specific fields + delete button -- ports `NodeProperties.tsx`
- [x] `frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts` (+ `.html`) -- add `selectedNode` computed (via `isComponentNode`), render `<app-node-properties>`, add `onNodeDelete` -- wires selection to the properties panel

**Acceptance Criteria:**
- Given `npm run build` in `frontend-angular/`, when it runs, then it exits 0 with zero TypeScript errors.
- Given `/workflow-canvas`, when a node is clicked, then a right-side panel shows its id, label, description, and type-specific config fields matching `node.data.type`.
- Given a field is edited in the panel, when the change is made, then the node's label/icon on the canvas updates immediately.
- Given "Delete Node" is clicked, when it executes, then the node and its connected edges are removed and the panel closes.
- Given the close (X) button is clicked, when it executes, then the panel closes without modifying node data.

## Spec Change Log

## Design Notes

`node.data` and `node.selected` are `WritableSignal`s on `ComponentNode<T>` (per `ngx-vflow`'s `node.interface.d.ts`) — mutate them directly with `.update()`/`.set()`; no need to replace entries in the `nodes` array. `isComponentNode<T>` (exported by `ngx-vflow`) narrows the `Node[]` union so `.data`/`.selected` are typed; non-null-assert (`!`) since `createNode` with defaults always populates both.

## Verification

**Commands:**
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors
- `cd frontend-angular && npm start` -- expected: serves on port 4200; navigate to `/workflow-canvas`, click a node to open the properties panel, edit fields, delete the node, and verify the panel opens/updates/closes correctly

## Suggested Review Order

**Selection & rendering**

- Entry point: `selectedNode` narrows the first selected node via `isComponentNode`, driving the panel's visibility.
  [`workflow-canvas.ts:44`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L44)

- `@if (selectedNode(); as node)` renders `<app-node-properties>` as a third flex sidebar alongside the palette and canvas.
  [`workflow-canvas.html:45`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.html#L45)

**Properties panel component**

- `data`/`handleChange` read and mutate `node.data` in place via `.update()` — no array replacement needed.
  [`node-properties.ts:40`](../../frontend-angular/src/app/workflow/node-properties/node-properties.ts#L40)

- `close()` directly flips `node.selected` to deselect the node and dismiss the panel.
  [`node-properties.ts:92`](../../frontend-angular/src/app/workflow/node-properties/node-properties.ts#L92)

- Four type-specific `@if` sections (trigger/action/condition/output) port `NodeProperties.tsx`'s config forms onto spartan-ng primitives.
  [`node-properties.html:42`](../../frontend-angular/src/app/workflow/node-properties/node-properties.html#L42)

**Node lifecycle (data shape & deletion)**

- `WorkflowNodeData` gains 8 optional type-specific fields read and written by the panel.
  [`workflow-node.ts:21`](../../frontend-angular/src/app/workflow/workflow-node/workflow-node.ts#L21)

- `onNodeDelete` removes the node and its connected edges, mirroring `onKeyDown`'s existing deletion logic.
  [`workflow-canvas.ts:134`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L134)

**Review fixes**

- `onKeyDown`'s focus guard now also excludes buttons/switch/listbox/option, so using the panel's select/switch/buttons can't trigger Delete/Backspace node deletion.
  [`workflow-canvas.ts:143`](../../frontend-angular/src/app/workflow/workflow-canvas/workflow-canvas.ts#L143)

- `toOptionalNumber` guards Timeout/Max retries/Status Code inputs against empty/`NaN` values; `??` (not `||`) preserves a stored `0`.
  [`node-properties.ts:50`](../../frontend-angular/src/app/workflow/node-properties/node-properties.ts#L50)
