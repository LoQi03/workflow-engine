---
title: 'Port React UI primitives to Angular via spartan-ng'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: 'd117ae75ceb5925abd85a19d4514dd0da928bc8f'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `frontend-angular` has no UI component library yet. The planned Angular port of `frontend/`'s pages and workflow editor (deferred Goals C/D) needs Angular equivalents of the 8 shadcn/Radix primitives actually used by the React app: `button`, `input`, `label`, `select`, `switch`, `textarea`, `tooltip`, and `sonner` (toast).

**Approach:** Use `@spartan-ng/cli` (Tailwind v4 + Angular CDK, the closest shadcn/ui equivalent for Angular — direction agreed in a prior session) to generate each primitive into `frontend-angular`, then build a `/ui-showcase` route rendering all 8 so Tailwind styling and interactivity are verified end-to-end.

## Boundaries & Constraints

**Always:**
- Add `@angular/cdk` and `tw-animate-css` as dependencies, and `@spartan-ng/cli` (currently `0.0.1-alpha.712`, requires Angular `>=21 <23` and Tailwind `>=4` — both satisfied) as a dev dependency.
- Run spartan-ng's init generator first to wire its Tailwind v4 preset/theme into `frontend-angular/src/styles.css`, then run its `ui` generator for: `button`, `input`, `select`, `switch`, `textarea`, `tooltip`, `sonner` (7 components), accepting the generator's default output locations.
- For `label`: use spartan-ng's generator if one directly maps; otherwise hand-author a minimal `hlmLabel` directive matching Radix Label's Tailwind classes (`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`).
- Build a standalone `UiShowcase` component registered at route `/ui-showcase` (populate `app.routes.ts`) rendering one usage example of each of the 8 primitives: a button (with a non-default variant), a labeled input, a select, a switch, a textarea, a tooltip on a button, and a button that fires a `sonner` toast.

**Ask First:**
- If `ng g @spartan-ng/cli:init` or `ng g @spartan-ng/cli:ui <name>` fail in this non-Nx Angular CLI workspace (the CLI's published deps include `@nx/*` packages), HALT and ask whether to fall back to hand-authoring the `brain`/`helm` files by copying spartan-ng's published component source (its `helm` components are designed to be copied into the consuming repo, shadcn-style).

**Never:**
- No work on deferred Goals C (workflow canvas port) or D (remaining pages/routing/tenant flow).
- No changes under `frontend/` or `backend/` (reference only).
- Do not port `frontend/src/components/ui/{toast,toaster}.tsx` or `frontend/src/hooks/use-toast.ts` — confirmed dead code (the Radix `<Toaster />` is mounted in `App.tsx` but `useToast()`/`toast()` from this system is never called anywhere; the app only uses `sonner`'s `toast()` directly).

</frozen-after-approval>

## Code Map

- `frontend/src/components/ui/{button,input,label,select,switch,textarea,tooltip,sonner}.tsx` -- reference: React/Radix component shapes, CVA variants, and prop surfaces to mirror
- `frontend-angular/src/styles.css` -- target: spartan-ng Tailwind v4 preset/theme import lands here (currently just `@import 'tailwindcss';`)
- `frontend-angular/package.json` -- target: add `@angular/cdk`, `tw-animate-css`, `@spartan-ng/cli`
- `frontend-angular/src/app/app.routes.ts` -- target: currently `export const routes: Routes = [];` -- register `/ui-showcase`
- `frontend-angular/src/app/` -- target: spartan-ng `ui` generator adds new component directories here (exact structure determined by the generator)

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/package.json` -- `npm install @angular/cdk tw-animate-css` and `npm install -D @spartan-ng/cli` -- adds the Angular CDK peer dep and spartan-ng tooling
- [x] `frontend-angular/src/styles.css` -- run `ng g @spartan-ng/cli:init` -- wires the Tailwind v4 preset/theme alongside the existing Tailwind import
- [x] `frontend-angular/src/app/` -- run `ng g @spartan-ng/cli:ui <name>` for `button`, `input`, `select`, `switch`, `textarea`, `tooltip`, `sonner` -- generates the brain+helm pair for each of these 7 primitives
- [x] `frontend-angular/src/app/` -- generate or hand-author the `label` primitive (`hlmLabel`) -- completes the 8-primitive set
- [x] `frontend-angular/src/app/ui-showcase/ui-showcase.ts` (+ template) -- create standalone component rendering one example of each of the 8 primitives, including a button wired to fire a `sonner` toast
- [x] `frontend-angular/src/app/app.routes.ts` -- add a route for `UiShowcase` at path `ui-showcase` -- makes it reachable via the existing `<router-outlet />`

**Acceptance Criteria:**
- Given `npm run build` in `frontend-angular/`, when it runs, then it exits 0 with zero TypeScript errors.
- Given `npm start` and navigating to `/ui-showcase`, when the page renders, then all 8 primitives (button, input, label, select, switch, textarea, tooltip, sonner-toast trigger) are visible with Tailwind styling applied.
- Given the showcase's toast-trigger button, when clicked, then a `sonner` toast appears on screen.
- Given any generated component under `frontend-angular/src/app/`, when imported by `UiShowcase`, then it is a typed Angular standalone component/directive usable without further manual configuration.

## Spec Change Log

## Design Notes

spartan-ng splits each component into a `brain` half (headless behavior, built on `@angular/cdk`) and a `helm` half (Tailwind-styled, copied into the consuming repo like shadcn). The `ui` generator adds `brain` as an npm dependency and copies `helm` source into the project — new files will appear under `frontend-angular/src/app/...` at whatever path the generator defaults to; do not pre-create directories for them.

## Verification

**Commands:**
- `cd frontend-angular && npm install` -- expected: exits 0
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors
- `cd frontend-angular && npm start` -- expected: serves on port 4200; navigate to `/ui-showcase` and manually verify all 8 primitives render styled, and the toast button produces a visible `sonner` toast

## Suggested Review Order

**UI Showcase (entry point)**

- Standalone component importing all 8 `Hlm*Imports` arrays, plus signals and the toast trigger.
  [`ui-showcase.ts:12`](../../frontend-angular/src/app/ui-showcase/ui-showcase.ts#L12)

- Renders one example of each primitive — button, input+label, select, switch, textarea, tooltip, toast.
  [`ui-showcase.html:1`](../../frontend-angular/src/app/ui-showcase/ui-showcase.html#L1)

- `<hlm-select>` two-way-bound via `[(value)]`, content placed in `<ng-template hlmSelectPortal>` per BrnDialogContent's TemplateRef requirement.
  [`ui-showcase.html:19`](../../frontend-angular/src/app/ui-showcase/ui-showcase.html#L19)

- `showToast()` calls spartan-ng's `toast()` helper; `<hlm-toaster />` renders the toast surface.
  [`ui-showcase.ts:30`](../../frontend-angular/src/app/ui-showcase/ui-showcase.ts#L30)

- Route registration makes the showcase reachable at `/ui-showcase`.
  [`app.routes.ts:4`](../../frontend-angular/src/app/app.routes.ts#L4)

**Hand-authored primitive**

- `hlmLabel` directive, hand-authored since spartan-ng has no `label` generator — composes Radix-equivalent classes via `hostDirectives`.
  [`hlm-label.ts:5`](../../frontend-angular/libs/ui/label/src/lib/hlm-label.ts#L5)

**Tooling & build wiring**

- `components.json` pre-created with spartan-ng's zod-schema defaults to bypass interactive generator prompts.
  [`components.json:1`](../../frontend-angular/components.json#L1)

- New deps: Angular CDK, spartan-ng brain/cli, CVA, clsx, tailwind-merge, tw-animate-css, ng-icons.
  [`package.json:15`](../../frontend-angular/package.json#L15)

- `tsconfig.json` path aliases map `@spartan-ng/helm/*` imports to the generated `libs/ui/**` sources.
  [`tsconfig.json:17`](../../frontend-angular/tsconfig.json#L17)

**Styling**

- `ng g @spartan-ng/cli:init` rewrote `styles.css`: Tailwind v4 layered imports plus the spartan-ng preset.
  [`styles.css:1`](../../frontend-angular/src/styles.css#L1)

- Full oklch theme (light + `:root.dark`) and base layer applying `border-border`/`bg-background` tokens.
  [`styles.css:9`](../../frontend-angular/src/styles.css#L9)

**Generated vendor primitives (spartan-ng CLI output, not hand-reviewed)**

- 40 generated files under `libs/ui/**` (button, input, select, switch, textarea, tooltip, sonner, icon, utils).
  [`hlm-button.ts:1`](../../frontend-angular/libs/ui/button/src/lib/hlm-button.ts#L1)
