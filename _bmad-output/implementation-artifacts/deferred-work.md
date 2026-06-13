# Deferred Work

## From: Angular frontend bootstrap (2026-06-13)

Context: User requested a new Angular project (Tailwind + TypeScript) alongside the existing
`frontend/` React app, with all components recreated and OpenAPI wired up. Scope was split
([S]) into Goal A (spec'd now) plus the following deferred goals, each needing its own
spec/breakdown later.

### Goal B — UI primitive library port (NOW IN PROGRESS, see spec-angular-ui-primitives.md)
Of the ~50 shadcn/Radix components in `frontend/src/components/ui/*`, only **9 are
actually imported** anywhere in the app: `button`, `input`, `label`, `select`, `sonner`,
`switch`, `textarea`, `toaster`, `tooltip`. Scope narrowed (2026-06-13) to just these 9,
ported to Angular via **spartan-ng** (Tailwind + Angular CDK, closest philosophical match
to shadcn/ui). The remaining ~40 unused primitives are dead scaffold code in `frontend/`
and are **out of scope entirely** — not ported, not tracked as deferred work.

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
