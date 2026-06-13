---
title: 'Bootstrap Angular frontend project (Tailwind + OpenAPI client)'
type: 'chore'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: '74a67b059fb2f71601f0ebac7a1164df07c48948'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** This repo has only a React frontend (`frontend/`). A planned React→Angular port (UI components, workflow editor, pages — tracked separately) needs a working Angular project to land in, with the same OpenAPI-typed API access pattern as `frontend/`.

**Approach:** Scaffold a standalone Angular 21 SPA at `frontend-angular/` (sibling to `frontend/` and `backend/`) using the CLI's built-in Tailwind CSS v4 support, then add an `openapi-typescript` + `openapi-fetch` client that mirrors `frontend/src/api` against the same backend (`https://localhost:7258`).

## Boundaries & Constraints

**Always:**
- New project at `frontend-angular/`, created via `@angular/cli@21`, standalone components, TypeScript, npm as package manager.
- Tailwind CSS via Angular CLI's native `--style=tailwind` integration — no separate manual PostCSS setup.
- API client mirrors `frontend/src/api`: `client.ts` (`apiClient` via `openapi-fetch`), `index.ts` (re-exports), `schema.d.ts` generated via `openapi-typescript`, same `baseUrl: "https://localhost:7258/"`, same `generate-api` script pattern.

**Ask First:**
- If the backend (`backend/WorkflowEngine.Service`) can't be started to reach `https://localhost:7258/openapi/v1.json` for schema generation, HALT and ask whether to seed `schema.d.ts` from `backend/openapi_fixed.json` instead.

**Never:**
- No UI component porting, page porting, or workflow-canvas work here — tracked separately in `_bmad-output/implementation-artifacts/deferred-work.md` (Goals B/C/D).
- No changes under `frontend/` or `backend/` (reference only).
- No component-library install (spartan-ng, Angular Material, etc.) — out of scope for this scaffold.

</frozen-after-approval>

## Code Map

- `frontend/src/api/client.ts` -- reference: `openapi-fetch` client shape to mirror
- `frontend/src/api/index.ts` -- reference: re-export pattern to mirror
- `frontend/package.json:14` -- reference: `generate-api` script pattern
- `backend/WorkflowEngine.Service/Properties/launchSettings.json` -- confirms HTTPS dev URL `https://localhost:7258`
- `frontend-angular/` -- NEW: target Angular app root

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/` -- run `npx @angular/cli@21 new frontend-angular --routing --style=tailwind --ssr=false --zoneless=false --skip-git --package-manager=npm` from repo root -- scaffolds standalone Angular 21 SPA with TypeScript, routing, and Tailwind v4 wired into the build
- [x] `frontend-angular/package.json` -- `npm install openapi-fetch` and `npm install -D openapi-typescript` -- adds typed-fetch tooling matching `frontend`
- [x] `frontend-angular/package.json` -- add script `"generate-api": "curl -k https://localhost:7258/openapi/v1.json -o src/app/api/v1.json && npx openapi-typescript src/app/api/v1.json -o src/app/api/schema.d.ts"` -- mirrors `frontend/package.json:14`
- [x] `frontend-angular/src/app/api/client.ts` -- create, exporting `apiClient = createClient<paths>({ baseUrl: "https://localhost:7258/" })` -- mirrors `frontend/src/api/client.ts`
- [x] `frontend-angular/src/app/api/index.ts` -- create, re-exporting `apiClient`, `paths`, `components` -- mirrors `frontend/src/api/index.ts`
- [x] `frontend-angular/src/app/api/schema.d.ts`, `v1.json` -- start backend (`dotnet run --launch-profile https` in `backend/WorkflowEngine.Service`) and run `npm run generate-api` -- produces real typed schema from the live OpenAPI spec
- [x] `frontend-angular/src/app/app.html` -- replace default scaffold content with `<h1 class="text-2xl font-bold underline">frontend-angular</h1>` and a `<router-outlet />` -- proves Tailwind utilities are applied and routing is live

**Acceptance Criteria:**
- Given a fresh clone, when `npm install && npm run build` runs in `frontend-angular/`, then it exits 0 with zero TypeScript errors and emits to `frontend-angular/dist/`.
- Given `npm start` in `frontend-angular/`, when the app serves on `http://localhost:4200`, then the placeholder `<h1>` renders bold, underlined, and at `text-2xl` size (Tailwind active).
- Given the backend running on `https://localhost:7258`, when `npm run generate-api` runs in `frontend-angular/`, then `src/app/api/schema.d.ts` contains `paths`/`components` types for the backend's endpoints (e.g. `/api/Company`), and `client.ts` compiles cleanly against them.
- Given `frontend-angular/src/app/api/client.ts`, when called as `apiClient.GET('/api/Company')`, then TypeScript resolves the call with no type errors.

## Spec Change Log

## Verification

**Commands:**
- `cd frontend-angular && npm install` -- expected: exits 0
- `cd frontend-angular && npm run build` -- expected: exits 0, no TS errors
- `cd frontend-angular && npm run generate-api` -- expected: writes `src/app/api/v1.json` and `schema.d.ts` (requires backend on `https://localhost:7258`)
- `cd frontend-angular && npm start` -- expected: serves on port 4200; manually verify Tailwind styling on the placeholder heading

## Suggested Review Order

**OpenAPI client (mirrors `frontend/src/api`)**

- Entry point: typed client created via `openapi-fetch`, same `baseUrl` as the React app's client.
  [`client.ts:14`](../../frontend-angular/src/app/api/client.ts#L14)

- Re-export surface mirrors `frontend/src/api/index.ts` exactly.
  [`index.ts:1`](../../frontend-angular/src/app/api/index.ts#L1)

- Generated schema includes `/api/Company`, proving live OpenAPI generation against the running backend worked.
  [`schema.d.ts:7`](../../frontend-angular/src/app/api/schema.d.ts#L7)

- `generate-api` script reproduces the schema from `https://localhost:7258/openapi/v1.json`.
  [`package.json:10`](../../frontend-angular/package.json#L10)

**Tailwind v4 wiring (Angular CLI native `--style=tailwind`)**

- PostCSS plugin enables the Tailwind v4 build pipeline, no manual config needed.
  [`.postcssrc.json:3`](../../frontend-angular/.postcssrc.json#L3)

- Single `@import` replaces v3's three `@tailwind` directives.
  [`styles.css:3`](../../frontend-angular/src/styles.css#L3)

**Placeholder shell proving Tailwind + routing are live**

- Utility classes (`text-2xl`, `font-bold`, `underline`) plus `<router-outlet />` confirm both Tailwind and the router are wired correctly.
  [`app.html:1`](../../frontend-angular/src/app/app.html#L1)

**Peripherals**

- Excludes the regenerable OpenAPI dump, matching `frontend/.gitignore:20`.
  [`.gitignore:10`](../../frontend-angular/.gitignore#L10)

- Tracks the deferred UI-port goals (B/C/D) and a new Tailwind v3→v4 migration note for those ports.
  [`deferred-work.md:28`](deferred-work.md#L28)
