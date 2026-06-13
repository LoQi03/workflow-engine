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

- **C1 — Canvas core & graph library integration** (NOW IN PROGRESS, see
  spec-angular-workflow-canvas-core.md): pick and integrate an Angular graph/canvas
  library, port `WorkflowCanvas.tsx` (242 lines) + `WorkflowNode.tsx` (100 lines) —
  background/controls/minimap, pan/zoom/select/connect/delete, single custom node
  type with handles. Architecturally riskiest; gates C2-C4.

- **C2 — Node palette & drag-to-add**: port `NodePalette.tsx` (108 lines) — left
  sidebar of draggable node templates grouped by category, dropped onto the canvas
  via the `application/reactflow` dataTransfer MIME type (Angular CDK drag-drop +
  custom payload). Depends on C1's coordinate-projection and node-creation APIs.

- **C3 — Node properties panel & context menu**: port `NodeProperties.tsx`
  (202 lines, type-specific config forms built on Goal B's Input/Select/Switch/
  Textarea) and `ContextMenu.tsx` (81 lines, right-click node/edge/canvas actions).
  Depends on C1's selection model and node data shape.

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
