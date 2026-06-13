---
title: 'Port workflow persistence service to Angular'
type: 'feature'
created: '2026-06-13'
status: 'done'
context: []
baseline_commit: '74129d57970168ef4debf91407549c92af2f7f70'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `frontend-angular` has no persistence layer; `frontend/src/hooks/useWorkflowStore.ts` (87 lines, localStorage-backed save/load/remove/refresh of named workflows) is unported -- C4b's TopBar/SaveDialog/WorkflowManager chrome depends on it.

**Approach:** Port to an injectable `WorkflowStoreService` (`providedIn: 'root'`, signals for `workflows`/`activeId`, same localStorage keys). `ngx-vflow`'s `Node`/`Edge` are signal-backed and not JSON-serializable, so `SavedWorkflow.nodes`/`edges` use a plain shape, with `toSavedNodes`/`toSavedEdges`/`fromSavedNodes`/`fromSavedEdges` bridging to/from live canvas state for C4b. No UI changes in this story.

## Boundaries & Constraints

**Always:**
- Create `frontend-angular/src/app/workflow/workflow-store/workflow-store.ts`: `@Injectable({ providedIn: 'root' })` class `WorkflowStoreService`. Export `SavedNode = { id: string; point: { x: number; y: number }; data: WorkflowNodeData }`, `SavedEdge = { id: string; source: string; target: string; sourceHandle?: string; targetHandle?: string; curve?: Curve }`, and `SavedWorkflow = { id: string; name: string; nodes: SavedNode[]; edges: SavedEdge[]; createdAt: string; updatedAt: string }`.
- `localStorage` keys: `'flowcraft-workflows'` / `'flowcraft-active-workflow'`.
- State: `readonly workflows = signal<SavedWorkflow[]>(loadAll())`, `readonly activeId = signal<string | null>(localStorage.getItem(ACTIVE_KEY))`.
- Port `useWorkflowStore.ts`'s methods (signals instead of `useState`/`useCallback`):
  - `save(name: string, nodes: SavedNode[], edges: SavedEdge[], existingId?: string): string` -- `id = existingId || \`wf-${Date.now()}\``; preserve `createdAt` for an existing entry, refresh `updatedAt`; prepend to `workflows`, persist, set `activeId` + `ACTIVE_KEY`, return `id`.
  - `load(id: string): SavedWorkflow | null` -- re-read via `loadAll()` (matches React's re-read-on-load), set `activeId` + `ACTIVE_KEY` if found.
  - `remove(id: string): void` -- filter out, persist; if it was `activeId`, clear `activeId` + remove `ACTIVE_KEY`.
  - `refresh(): void` -- re-sync `workflows` from `localStorage`.
  - Private `loadAll()`/`persistAll()`: port verbatim incl. the `createdAt` backfill migration and `try/catch` -> `[]` on parse failure.
- Export conversion helpers (consumed by C4b, unused here): `toSavedNodes(nodes: Node[]): SavedNode[]` (filter `isComponentNode<WorkflowNodeData>`, read `point()`/`data!()`); `toSavedEdges(edges: Edge[]): SavedEdge[]` (read `curve?.()`); `fromSavedNodes(nodes: SavedNode[]): Node[]` (`createNodes<WorkflowNodeData>` with `type: WorkflowNodeComponent`); `fromSavedEdges(edges: SavedEdge[]): Edge[]` (`createEdges`, default `curve: 'smooth-step'`).
- Create `frontend-angular/src/app/workflow/workflow-store/workflow-store.spec.ts` (`TestBed`, clear `localStorage` in `beforeEach`): cover `save`/`load`/`remove`/`refresh` and a `toSavedNodes`/`fromSavedNodes` (and edges) round-trip.

**Ask First:** None -- fully derivable from `useWorkflowStore.ts` and `ngx-vflow`'s `Node`/`Edge`/`createNodes`/`createEdges` APIs.

**Never:**
- No changes to existing components/routes (`workflow-canvas.ts`, `app.routes.ts`, etc.) or new chrome components (`TopBar`/`SaveDialog`/`WorkflowManager`) -- all C4b.
- No changes under `frontend/` or `backend/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Empty storage | no `flowcraft-workflows` key | `workflows()` `[]`, `activeId()` `null` | -- |
| Corrupted JSON | invalid `flowcraft-workflows` value | `workflows()` `[]` | `try/catch` -> `[]` |
| Save new | `save('WF', nodes, edges)` | entry prepended; `id` returned; `activeId` set | -- |
| Save existing id | `save('Renamed', nodes, edges, id)` | entry updated in place; `createdAt` kept, `updatedAt` refreshed | -- |
| Remove active | `remove(activeId())` | entry removed; `activeId()` `null`; `ACTIVE_KEY` cleared | -- |
| Load missing id | `load('nope')` | returns `null`; `activeId` unchanged | -- |

</frozen-after-approval>

## Code Map

- `frontend/src/hooks/useWorkflowStore.ts` (reference)
- `frontend-angular/src/app/workflow/workflow-node/workflow-node.ts` (reference: `WorkflowNodeData`)
- `frontend-angular/src/app/workflow/workflow-store/workflow-store.ts` (+ `.spec.ts`)

## Tasks & Acceptance

**Execution:**
- [x] `frontend-angular/src/app/workflow/workflow-store/workflow-store.ts` -- `WorkflowStoreService`, `SavedWorkflow`/`SavedNode`/`SavedEdge` types, conversion helpers
- [x] `frontend-angular/src/app/workflow/workflow-store/workflow-store.spec.ts` -- unit tests for save/load/remove/refresh + conversion round-trip

**Acceptance Criteria:**
- Given `npm run build` and `npm test` in `frontend-angular/`, when run, then both exit 0 (no TS errors, `workflow-store.spec.ts` passes).
- Given empty `localStorage`, when `WorkflowStoreService` is injected, then `workflows()` is `[]` and `activeId()` is `null`.
- Given `save('My Workflow', nodes, edges)` then `save('Renamed', nodes, edges, returnedId)`, when `workflows()` is read, then it has one entry for `returnedId` with `createdAt` unchanged and `updatedAt` refreshed.
- Given live canvas `Node[]`/`Edge[]`, when round-tripped through `toSavedNodes`/`toSavedEdges` then `fromSavedNodes`/`fromSavedEdges`, then `id`/`point`/`data` (nodes) and `id`/`source`/`target` (edges) are preserved.

## Spec Change Log

- `toSavedEdges`: ngx-vflow's `createEdges` (with `useDefaults: true`, the default) fills `sourceHandle`/`targetHandle` with `''` when not supplied, rather than leaving them `undefined`. Since `SavedEdge.sourceHandle?`/`targetHandle?` are typed as optional `string`, `toSavedEdges` normalizes empty-string handles to `undefined` (`e.sourceHandle || undefined`) so persisted JSON and the `fromSavedEdges` round-trip don't carry meaningless empty-string handles. This is a clarification of "read `curve?.()`"-style field mapping, not a change to any exported signature, type, or constraint.
- Pre-existing failure noted but not fixed: `src/app/app.spec.ts` > "should render title" fails on `main` before this change too (expects `'Hello, frontend-angular'`, component renders `'frontend-angular'`). Left untouched per the "Never modify existing components" constraint; `npm test` still exits non-zero overall due to this pre-existing failure, but all new `workflow-store.spec.ts` tests (14/14) pass and `npm run build` exits 0.

## Verification

**Commands:**
- `cd frontend-angular && npm run build && npm test` -- expected: both exit 0, `workflow-store.spec.ts` passes alongside existing specs

## Suggested Review Order

**Storage shape & service core**

- Entry point: the plain `SavedNode`/`SavedEdge`/`SavedWorkflow` types this whole service is built around -- the JSON-safe answer to ngx-vflow's signal-backed `Node`/`Edge`.
  [`workflow-store.ts:12`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.ts#L12)

- `WorkflowStoreService` signals (`workflows`/`activeId`) seeded from `localStorage`, mirroring React's lazy `useState` initializers.
  [`workflow-store.ts:101`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.ts#L101)

- `save` ports `useWorkflowStore.ts`'s id-generation, `createdAt`/`updatedAt` bookkeeping, and prepend-and-persist logic.
  [`workflow-store.ts:104`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.ts#L104)

- `load` re-reads via `loadAll()` (not the `workflows` signal) before setting `activeId`, matching React's re-read-on-load.
  [`workflow-store.ts:127`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.ts#L127)

- `remove` clears `activeId`/`ACTIVE_KEY` only when removing the active workflow.
  [`workflow-store.ts:137`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.ts#L137)

**Signal <-> JSON conversion helpers (for C4b)**

- `toSavedNodes` reads live `point()`/`data!()` off component nodes, filtering via `isComponentNode`.
  [`workflow-store.ts:56`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.ts#L56)

- `toSavedEdges` reads `curve?.()` and normalizes ngx-vflow's `''`-default handles to `undefined` (see Spec Change Log).
  [`workflow-store.ts:64`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.ts#L64)

- `fromSavedNodes`/`fromSavedEdges` rehydrate via `createNodes`/`createEdges`, re-attaching `type: WorkflowNodeComponent` and defaulting `curve` to `'smooth-step'`.
  [`workflow-store.ts:75`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.ts#L75)

**Peripherals**

- `loadAll`/`persistAll` -- verbatim-ported `createdAt` backfill migration and try/catch-to-`[]` fallback.
  [`workflow-store.ts:39`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.ts#L39)

- Unit tests cover save/load/remove/refresh plus node/edge conversion round-trips.
  [`workflow-store.spec.ts:1`](../../frontend-angular/src/app/workflow/workflow-store/workflow-store.spec.ts#L1)

- Review surfaced two non-blocking items for C4b: malformed-storage validation and `activeId` reconciliation.
  [`deferred-work.md:239`](deferred-work.md#L239)
