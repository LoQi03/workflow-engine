import { Injectable, signal } from '@angular/core';
import {
  createEdges,
  createNodes,
  Curve,
  Edge,
  isComponentNode,
  Node,
} from 'ngx-vflow';
import { WorkflowNodeComponent, WorkflowNodeData } from '../workflow-node/workflow-node';

export interface SavedNode {
  id: string;
  point: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface SavedEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  curve?: Curve;
}

export interface SavedWorkflow {
  id: string;
  name: string;
  nodes: SavedNode[];
  edges: SavedEdge[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'flowcraft-workflows';
const ACTIVE_KEY = 'flowcraft-active-workflow';

function loadAll(): SavedWorkflow[] {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // Migrate old workflows missing createdAt
    return items.map((w: any) => ({
      ...w,
      createdAt: w.createdAt || w.updatedAt,
    }));
  } catch {
    return [];
  }
}

function persistAll(workflows: SavedWorkflow[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

export function toSavedNodes(nodes: Node[]): SavedNode[] {
  return nodes.filter(isComponentNode<WorkflowNodeData>).map((n) => ({
    id: n.id,
    point: n.point(),
    data: n.data!(),
  }));
}

export function toSavedEdges(edges: Edge[]): SavedEdge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle || undefined,
    targetHandle: e.targetHandle || undefined,
    curve: e.curve?.(),
  }));
}

export function fromSavedNodes(nodes: SavedNode[]): Node[] {
  return createNodes<WorkflowNodeData>(
    nodes.map((n) => ({
      id: n.id,
      point: n.point,
      type: WorkflowNodeComponent,
      data: n.data,
    })),
  );
}

export function fromSavedEdges(edges: SavedEdge[]): Edge[] {
  return createEdges(
    edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      curve: e.curve ?? 'smooth-step',
    })),
  );
}

@Injectable({ providedIn: 'root' })
export class WorkflowStoreService {
  readonly workflows = signal<SavedWorkflow[]>(loadAll());
  readonly activeId = signal<string | null>(localStorage.getItem(ACTIVE_KEY));

  save(name: string, nodes: SavedNode[], edges: SavedEdge[], existingId?: string): string {
    const now = new Date().toISOString();
    const id = existingId || `wf-${Date.now()}`;

    const existing = this.workflows().find((w) => w.id === id);
    const workflow: SavedWorkflow = {
      id,
      name,
      nodes,
      edges,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    const filtered = this.workflows().filter((w) => w.id !== id);
    const next = [workflow, ...filtered];
    persistAll(next);
    this.workflows.set(next);

    this.activeId.set(id);
    localStorage.setItem(ACTIVE_KEY, id);
    return id;
  }

  load(id: string): SavedWorkflow | null {
    const all = loadAll();
    const wf = all.find((w) => w.id === id) || null;
    if (wf) {
      this.activeId.set(id);
      localStorage.setItem(ACTIVE_KEY, id);
    }
    return wf;
  }

  clearActive(): void {
    this.activeId.set(null);
    localStorage.removeItem(ACTIVE_KEY);
  }

  remove(id: string): void {
    const next = this.workflows().filter((w) => w.id !== id);
    persistAll(next);
    this.workflows.set(next);

    if (this.activeId() === id) {
      this.clearActive();
    }
  }

  refresh(): void {
    const next = loadAll();
    this.workflows.set(next);

    const active = this.activeId();
    if (active !== null && !next.some((w) => w.id === active)) {
      this.clearActive();
    }
  }
}
