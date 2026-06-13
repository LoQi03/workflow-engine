# Deferred Work

## From: Angular frontend bootstrap (2026-06-13)

Context: User requested a new Angular project (Tailwind + TypeScript) alongside the existing
`frontend/` React app, with all components recreated and OpenAPI wired up. Scope was split
([S]) into Goal A (spec'd now) plus the following deferred goals, each needing its own
spec/breakdown later.

### Goal B — UI primitive library port (DONE, see spec-angular-ui-primitives.md)
Of the ~50 shadcn/Radix components in `frontend/src/components/ui/*`, only **9 are
actually imported** anywhere in the app: `button`, `input`, `label`, `select`, `sonner`,
`switch`, `textarea`, `toaster`, `tooltip`. Scope narrowed (2026-06-13) to just these 9,
ported to Angular via **spartan-ng** (Tailwind + Angular CDK, closest philosophical match
to shadcn/ui). The remaining ~40 unused primitives are dead scaffold code in `frontend/`
and are **out of scope entirely** — not ported, not tracked as deferred work.

### Goal C — Workflow editor canvas port (split 2026-06-13)
Recreate `frontend/src/components/workflow/*` (~1,156 lines across 10 files) and
`frontend/src/pages/WorkflowEditor.tsx`, currently built on ReactFlow v11 (the
`reactflow` package, not `@xyflow/react`). No direct Angular equivalent exists;
`ngx-vflow` is the leading candidate. Split into 4 shippable sub-goals:

- **C1 — Canvas core & graph library integration** (DONE, see
  spec-angular-workflow-canvas-core.md): pick and integrate an Angular graph/canvas
  library, port `WorkflowCanvas.tsx` (242 lines) + `WorkflowNode.tsx` (100 lines) —
  background/controls/minimap, pan/zoom/select/connect/delete, single custom node
  type with handles. Architecturally riskiest; gated C2-C4.

- **C2 — Node palette & drag-to-add** (DONE, see
  spec-angular-workflow-node-palette.md): ported `NodePalette.tsx` (108 lines) — left
  sidebar of draggable node templates grouped by category, dropped onto the canvas
  via native HTML5 drag-and-drop + `documentPointToFlowPoint`/`createNode`.

- **C3 — Node properties panel & context menu** (split 2026-06-13 into C3a/C3b):

  - **C3a — Node properties panel** (NOW IN PROGRESS): port `NodeProperties.tsx`
    (202 lines, type-specific config forms built on Goal B's Input/Select/Switch/
    Textarea) — right-side panel that opens on node selection, with 4 type-specific
    config sections (trigger/action/condition/output) plus a delete-node action.
    Depends on C1's selection model and node data shape. Establishes the
    `updateNode`/`deleteNode` API that C3b's context menu will reuse.

  - **C3b — Context menu (node)** (NOW IN PROGRESS, scope narrowed again
    2026-06-13): port only the node-right-click (Duplicate/Delete Node) branch of
    `ContextMenu.tsx` (81 lines). New `ContextMenuComponent` (shared
    positioning/close-on-outside-click infrastructure, `node` branch only for now)
    + a new `contextMenuRequested` output on `WorkflowNodeComponent` (host
    `(contextmenu)`) bubbled through `<vflow>`'s experimental `(componentNodeEvent)`;
    `onNodeDuplicate` ports `WorkflowCanvas.tsx`'s `duplicateNode`. Depends on C3a's
    `onNodeDelete`. The canvas "Add Node" branch is deferred — see C3d below. (The
    edge branch was already deferred as C3c.)

  - **C3c — Edge context menu (Delete Connection)** (deferred 2026-06-13,
    surfaced during C3b investigation): `ngx-vflow`'s default-type edges render as
    bare SVG `<path>` elements with no `id`/data attribute and no per-edge
    right-click/event API — only a `(click)` handler for selection
    (`EdgeComponent` template, `g[edge]`). Supporting a per-edge context menu would
    require switching edges from `type: 'default'` to `type: 'template'` (a custom
    `<ng-template edge>` reimplementing path/marker/selection rendering ourselves) —
    a much larger, regression-risky rewrite of C1's edge rendering for one menu
    item. Deferred; edges remain deletable via the existing select + Delete/Backspace
    flow shipped in C1. Revisit if/when edges need template-based rendering for other
    reasons.

  - **C3d — Canvas context menu (Add Node by category)** (deferred 2026-06-13,
    split from C3b for token budget): port the `canvas` branch of `ContextMenu.tsx`
    — "Add Node" header + Trigger/Action/Condition/Output rows, each calling
    `addNodeAtPosition`. Extends C3b's `ContextMenuComponent` with a `canvas` branch
    (local `colorMap`/icon set mirroring `node-palette.ts`'s `var(--node-*)`
    values); adds `(contextmenu)` on the canvas wrapper div + `documentPointToFlowPoint`
    (mirroring C2's drop handler), plus `onAddNodeFromMenu` (port of
    `addNodeAtPosition`'s category-defaults record: `New Trigger`/`New Action`/
    `If / Else`/`Response`). Depends on C3b's `ContextMenuComponent` and
    `contextMenu` state shape.

- **C4 — Workflow persistence & chrome**: port `useWorkflowStore.ts` (87 lines,
  plain hook + localStorage despite the name — NOT zustand; keys
  `flowcraft-workflows` / `flowcraft-active-workflow`) to an Angular service, plus
  `SaveDialog.tsx` (59), `WorkflowManager.tsx` (85), `TopBar.tsx` (63), and the
  `WorkflowEditor.tsx` (129) page wiring it all together. Depends on C1-C3.

### Goal D — Remaining pages, routing, tenant/auth flow
Recreate `frontend/src/pages/TenantSelector.tsx`, `WorkflowSelector.tsx`, `NotFound.tsx`,
top-level navigation (`NavLink`), and the tenant-selection/auth flow in Angular routing.
Depends on Goal B (and partly Goal C) for page chrome.

## From: Goal B implementation review (2026-06-13)

Surfaced during step-04 review of `spec-angular-ui-primitives.md` (spartan-ng UI
primitives port). Not blocking for Goal B; relevant to later goals.

### No component test coverage convention in `frontend-angular`
`frontend-angular` has no established pattern for component unit tests yet — the new
`UiShowcase` component (and the Goal A scaffold before it) ships without a `.spec.ts`.
Before Goals C/D add significant component surface area (workflow canvas, pages), decide
whether/how to test Angular components in this project (e.g. TestBed harnesses for
spartan-ng `brain` primitives) and retrofit a baseline.

### `/ui-showcase` route has no layout/guard/nav integration; root routing still empty
`app.routes.ts` currently only has `{ path: 'ui-showcase', component: UiShowcase }` — no
`''` redirect, no `'**'` wildcard/NotFound, no auth guard, and no nav link to it. This was
already true before Goal B (routes were `[]`) and is explicitly Goal D's responsibility
("remaining pages, routing, tenant/auth flow"). When Goal D is spec'd, ensure `/ui-showcase`
either gets a permanent home behind the same guard/layout as other pages, or is removed
once it has served its verification purpose.

### Note for Goals B/C — Tailwind v3 vs v4 divergence
`frontend-angular` uses Tailwind CSS v4 (via Angular CLI 21's native `--style=tailwind`
integration: `@tailwindcss/postcss` + `@import 'tailwindcss';`), while `frontend` uses
Tailwind v3.4.17 with the `tailwindcss-animate` plugin and `@tailwind base/components/utilities`
directives plus a CSS-variable theme in `tailwind.config.ts`. Components ported in Goals B/C
(including the spartan-ng primitives and the workflow canvas) cannot be copy-pasted as-is —
their Tailwind config, animation plugin usage, and any v3-only directive syntax need a v4
equivalent (e.g. `@theme` / `@plugin` in CSS, or a compatibility config) before porting.

## From: C1 implementation review (2026-06-13)

Surfaced during step-04 review of `spec-angular-workflow-canvas-core.md` (canvas core port
via `ngx-vflow`). Not blocking for C1; relevant to later goals.

### Edge ID generation not coordinated with persisted edge IDs
`WorkflowCanvasComponent.onConnect` (`workflow-canvas.ts`) generates new edge IDs as
`e-${source}-${target}-${counter}` from an in-memory counter that resets on reload. When C4
ports `useWorkflowStore` (persistence), ensure new-edge ID generation can't collide with
previously-saved edge IDs — including the hardcoded `e1-2`..`e3-5` demo IDs — across reloads.

### `WorkflowNodeData.type` has no runtime validation against its union
`WorkflowNodeComponent`'s icon/color/handle logic (`workflow-node.ts`/`.html`) assumes
`data.type` is one of `'trigger'|'action'|'condition'|'output'`; an unrecognized value
silently falls back (icon → trigger, color → action, handles render as non-trigger/
non-condition). Currently only exercised by the 5 hardcoded demo nodes. When C2/C3/C4
introduce backend- or user-authored node data, add validation or a defined fallback UI for
unknown `type` values.

### Zoom buttons have no min/max clamping
`zoomIn`/`zoomOut` in `WorkflowCanvasComponent` multiply/divide `vflow.viewport().zoom` by
`1.2` with no bounds. Minor UX polish; revisit if `ngx-vflow`'s `<vflow>` `minZoom`/`maxZoom`
inputs are ever wired up (not used by C1).

### `/workflow-canvas` route has no layout/guard/nav integration
Same situation as `/ui-showcase` (see Goal B review note above): added purely "for
verification" per the C1 spec. Goal D should give it a permanent home behind the same
guard/layout as other pages, or remove it once C4's `WorkflowEditor` page supersedes it.

## From: C2 implementation review (2026-06-13)

Surfaced during step-04 review of `spec-angular-workflow-node-palette.md` (node palette &
drag-to-add port). Not blocking for C2; relevant to later goals.

### `nodeIdCounter` not coordinated with persisted node IDs
`WorkflowCanvasComponent.onDrop` (`workflow-canvas.ts`) generates new node IDs as
`node-${counter}` from an in-memory counter that resets on reload — the same pattern as
C1's already-deferred `edgeIdCounter` issue. When C4 ports `useWorkflowStore` (persistence),
ensure new-node ID generation can't collide with previously-saved node IDs — including the
hardcoded `'1'`..`'5'` demo node IDs — across reloads. Address alongside the edge-ID
generation item above; both likely want the same fix (e.g. a single monotonically
increasing ID source seeded from the max persisted ID).

### Node palette drag items have no keyboard-accessible alternative
`NodePaletteComponent`'s template rows are plain `draggable="true"` divs with no `role`,
`tabindex`, or keyboard-triggered "add to canvas" action — a user who cannot perform HTML5
drag-and-drop (keyboard-only or screen-reader users) has no way to add nodes. This mirrors
`frontend/src/components/workflow/NodePalette.tsx`, which has the same gap, so it is not a
regression introduced by C2 — but it's now present in two places. When C3/C4 round out the
editor's interaction model, consider a click/keyboard "add node" affordance (e.g. click a
palette item to add it at a default position, or near the current viewport center) as a
fallback to drag-and-drop.

## From: C3a implementation review (2026-06-13)

Surfaced during step-04 review of `spec-angular-workflow-node-properties.md` (node
properties panel port). Not blocking for C3a; relevant to later goals.

### Type-specific defaults shown in the properties panel are never written back to `node.data`
`NodePropertiesComponent`'s template displays fallback defaults for unset fields (e.g.
`data().method || 'POST'`, `data().endpoint || '/api/webhook'`, `data().retry || false`,
plus the now-`??`-based `timeout`/`maxRetries`/`statusCode` defaults) but never backfills
`node.data` with these defaults — only an explicit edit writes the field. This mirrors
`frontend/src/components/workflow/NodeProperties.tsx`, which has the same gap, so it is not
a regression introduced by C3a. When C4 ports `useWorkflowStore` (persistence), a workflow
saved without ever opening a node's properties panel (or without touching a specific field)
will be missing these display-only defaults from its serialized `node.data` — decide whether
persistence should backfill type-specific defaults on save/load, or treat "unset" as
equivalent to "default" throughout (including wherever the backend/execution engine reads
this config).

### `node-properties` panel and `context-menu` need an accessibility pass
`NodePropertiesComponent`'s `<label hlmLabel>` elements (Label, Description, Method,
Endpoint, Timeout, Retry on failure, Max retries, Expression, Status Code, Response Body)
are not associated via `for`/`id` (or `aria-labelledby`) with their corresponding
`hlmInput`/`hlmTextarea`/`hlm-select`/`hlm-switch` controls, so screen readers may not
announce label-control relationships correctly. C3b's `ContextMenuComponent` (added
2026-06-13) has the same class of gap: its Duplicate/Delete Node rows are plain `<div>`s
with `(click)` handlers and no `role="menuitem"`, `tabindex`, Enter/Space activation, or
Escape-to-close. Bundle all three (this, C2's already-deferred node-palette drag items, and
C3b's context menu) into a single accessibility pass across the `frontend-angular` workflow
editor once C3d/C4 round out the remaining interactive surface.
