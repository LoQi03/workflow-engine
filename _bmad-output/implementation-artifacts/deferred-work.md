# Deferred Work

## From: Angular frontend bootstrap (2026-06-13)

Context: User requested a new Angular project (Tailwind + TypeScript) alongside the existing
`frontend/` React app, with all components recreated and OpenAPI wired up. Scope was split
([S]) into Goal A (spec'd now) plus the following deferred goals, each needing its own
spec/breakdown later.

### Goal B — UI primitive library port
Recreate `frontend/src/components/ui/*` (~50 shadcn/Radix components) for Angular.
No 1:1 Radix equivalent exists — direction agreed: **spartan-ng** (Tailwind + Angular CDK,
closest philosophical match to shadcn/ui). Likely needs its own multi-spec breakdown
given the number of components.

### Goal C — Workflow editor canvas port
Recreate `frontend/src/components/workflow/*` and `frontend/src/pages/WorkflowEditor.tsx`,
currently built on `reactflow` (React-only). Needs an Angular graph/canvas library
(e.g. ngx-vflow, or custom) and redesign of canvas interaction logic
(`useWorkflowStore`, node palette, properties panel, context menu).
Depends on Goal B for shared UI chrome (dialogs, buttons, panels).

### Goal D — Remaining pages, routing, tenant/auth flow
Recreate `frontend/src/pages/TenantSelector.tsx`, `WorkflowSelector.tsx`, `NotFound.tsx`,
top-level navigation (`NavLink`), and the tenant-selection/auth flow in Angular routing.
Depends on Goal B (and partly Goal C) for page chrome.

### Note for Goals B/C — Tailwind v3 vs v4 divergence
`frontend-angular` uses Tailwind CSS v4 (via Angular CLI 21's native `--style=tailwind`
integration: `@tailwindcss/postcss` + `@import 'tailwindcss';`), while `frontend` uses
Tailwind v3.4.17 with the `tailwindcss-animate` plugin and `@tailwind base/components/utilities`
directives plus a CSS-variable theme in `tailwind.config.ts`. Components ported in Goals B/C
(including the spartan-ng primitives and the workflow canvas) cannot be copy-pasted as-is —
their Tailwind config, animation plugin usage, and any v3-only directive syntax need a v4
equivalent (e.g. `@theme` / `@plugin` in CSS, or a compatibility config) before porting.
