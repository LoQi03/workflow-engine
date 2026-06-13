import { TestBed } from '@angular/core/testing';
import { Edge, Node, createEdges, createNodes, isComponentNode } from 'ngx-vflow';
import { WorkflowNodeComponent, WorkflowNodeData } from '../workflow-node/workflow-node';
import {
  SavedEdge,
  SavedNode,
  WorkflowStoreService,
  fromSavedEdges,
  fromSavedNodes,
  toSavedEdges,
  toSavedNodes,
} from './workflow-store';

const STORAGE_KEY = 'flowcraft-workflows';
const ACTIVE_KEY = 'flowcraft-active-workflow';

function makeSavedNodes(): SavedNode[] {
  return [
    { id: '1', point: { x: 10, y: 20 }, data: { label: 'Webhook', type: 'trigger', icon: 'webhook' } },
    { id: '2', point: { x: 30, y: 40 }, data: { label: 'Validate', type: 'condition' } },
  ];
}

function makeSavedEdges(): SavedEdge[] {
  return [{ id: 'e1-2', source: '1', target: '2', curve: 'smooth-step' }];
}

describe('WorkflowStoreService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts with empty workflows and null activeId when storage is empty', () => {
    const service = TestBed.inject(WorkflowStoreService);
    expect(service.workflows()).toEqual([]);
    expect(service.activeId()).toBeNull();
  });

  it('falls back to empty array when storage contains corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    const service = TestBed.inject(WorkflowStoreService);
    expect(service.workflows()).toEqual([]);
  });

  it('migrates workflows missing createdAt by backfilling from updatedAt', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: 'wf-old', name: 'Old', nodes: [], edges: [], updatedAt: '2020-01-01T00:00:00.000Z' }]),
    );
    const service = TestBed.inject(WorkflowStoreService);
    expect(service.workflows()[0].createdAt).toBe('2020-01-01T00:00:00.000Z');
  });

  it('saves a new workflow, prepends it, sets activeId, and persists to localStorage', () => {
    const service = TestBed.inject(WorkflowStoreService);
    const nodes = makeSavedNodes();
    const edges = makeSavedEdges();

    const id = service.save('My Workflow', nodes, edges);

    expect(id).toMatch(/^wf-/);
    expect(service.activeId()).toBe(id);
    expect(localStorage.getItem(ACTIVE_KEY)).toBe(id);

    const all = service.workflows();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(id);
    expect(all[0].name).toBe('My Workflow');
    expect(all[0].nodes).toEqual(nodes);
    expect(all[0].edges).toEqual(edges);

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(persisted.length).toBe(1);
    expect(persisted[0].id).toBe(id);
  });

  it('saving with an existing id updates in place, keeps createdAt, refreshes updatedAt', async () => {
    const service = TestBed.inject(WorkflowStoreService);
    const nodes = makeSavedNodes();
    const edges = makeSavedEdges();

    const id = service.save('My Workflow', nodes, edges);
    const original = service.workflows().find((w) => w.id === id)!;

    // ensure the timestamp will differ
    await new Promise((resolve) => setTimeout(resolve, 5));

    const renamedId = service.save('Renamed', nodes, edges, id);

    expect(renamedId).toBe(id);
    const all = service.workflows();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(id);
    expect(all[0].name).toBe('Renamed');
    expect(all[0].createdAt).toBe(original.createdAt);
    expect(all[0].updatedAt).not.toBe(original.updatedAt);
  });

  it('loads a workflow by id and sets activeId', () => {
    const service = TestBed.inject(WorkflowStoreService);
    const id = service.save('My Workflow', makeSavedNodes(), makeSavedEdges());

    // simulate a fresh instance reading from localStorage
    service.activeId.set(null);
    localStorage.removeItem(ACTIVE_KEY);

    const loaded = service.load(id);

    expect(loaded).not.toBeNull();
    expect(loaded?.id).toBe(id);
    expect(service.activeId()).toBe(id);
    expect(localStorage.getItem(ACTIVE_KEY)).toBe(id);
  });

  it('load returns null for a missing id and does not change activeId', () => {
    const service = TestBed.inject(WorkflowStoreService);
    const id = service.save('My Workflow', makeSavedNodes(), makeSavedEdges());

    const result = service.load('nope');

    expect(result).toBeNull();
    expect(service.activeId()).toBe(id);
  });

  it('removes a workflow and clears activeId if it was active', () => {
    const service = TestBed.inject(WorkflowStoreService);
    const id = service.save('My Workflow', makeSavedNodes(), makeSavedEdges());

    expect(service.activeId()).toBe(id);

    service.remove(id);

    expect(service.workflows().find((w) => w.id === id)).toBeUndefined();
    expect(service.activeId()).toBeNull();
    expect(localStorage.getItem(ACTIVE_KEY)).toBeNull();
  });

  it('removes a non-active workflow without touching activeId', () => {
    const service = TestBed.inject(WorkflowStoreService);
    const idA = service.save('A', makeSavedNodes(), makeSavedEdges(), 'wf-a');
    const idB = service.save('B', makeSavedNodes(), makeSavedEdges(), 'wf-b');

    // idB is active (most recent save)
    expect(service.activeId()).toBe(idB);

    service.remove(idA);

    expect(service.workflows().find((w) => w.id === idA)).toBeUndefined();
    expect(service.activeId()).toBe(idB);
    expect(localStorage.getItem(ACTIVE_KEY)).toBe(idB);
  });

  it('refresh re-syncs workflows from localStorage', () => {
    const service = TestBed.inject(WorkflowStoreService);
    service.save('My Workflow', makeSavedNodes(), makeSavedEdges());

    // simulate external change to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    expect(service.workflows().length).toBe(1);

    service.refresh();

    expect(service.workflows()).toEqual([]);
  });

  it('round-trips nodes through toSavedNodes/fromSavedNodes preserving id/point/data', () => {
    const liveNodes: Node[] = createNodes<WorkflowNodeData>([
      { id: '1', point: { x: 10, y: 20 }, type: WorkflowNodeComponent, data: { label: 'Webhook', type: 'trigger' } },
      { id: '2', point: { x: 30, y: 40 }, type: WorkflowNodeComponent, data: { label: 'Validate', type: 'condition' } },
    ]);

    const saved = toSavedNodes(liveNodes);
    expect(saved).toEqual([
      { id: '1', point: { x: 10, y: 20 }, data: { label: 'Webhook', type: 'trigger' } },
      { id: '2', point: { x: 30, y: 40 }, data: { label: 'Validate', type: 'condition' } },
    ]);

    const restored = fromSavedNodes(saved);
    expect(restored.length).toBe(2);
    for (let i = 0; i < restored.length; i++) {
      const node = restored[i];
      expect(node.id).toBe(saved[i].id);
      expect(isComponentNode<WorkflowNodeData>(node)).toBe(true);
      if (isComponentNode<WorkflowNodeData>(node)) {
        expect(node.point()).toEqual(saved[i].point);
        expect(node.data!()).toEqual(saved[i].data);
      }
    }
  });

  it('round-trips edges through toSavedEdges/fromSavedEdges preserving id/source/target', () => {
    const liveEdges: Edge[] = createEdges([
      { id: 'e1-2', source: '1', target: '2', curve: 'smooth-step' },
      { id: 'e2-3', source: '2', target: '3', sourceHandle: 'false', curve: 'bezier' },
    ]);

    const saved = toSavedEdges(liveEdges);
    expect(saved).toEqual([
      { id: 'e1-2', source: '1', target: '2', sourceHandle: undefined, targetHandle: undefined, curve: 'smooth-step' },
      { id: 'e2-3', source: '2', target: '3', sourceHandle: 'false', targetHandle: undefined, curve: 'bezier' },
    ]);

    const restored = fromSavedEdges(saved);
    expect(restored.length).toBe(2);
    for (let i = 0; i < restored.length; i++) {
      expect(restored[i].id).toBe(saved[i].id);
      expect(restored[i].source).toBe(saved[i].source);
      expect(restored[i].target).toBe(saved[i].target);
    }
  });

  it('fromSavedEdges defaults curve to smooth-step when not provided', () => {
    const saved: SavedEdge[] = [{ id: 'e1-2', source: '1', target: '2' }];
    const restored = fromSavedEdges(saved);
    expect(restored[0].curve?.()).toBe('smooth-step');
  });
});
