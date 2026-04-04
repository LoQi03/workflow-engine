import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';

export interface SavedWorkflow {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
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
  } catch { return []; }
}

function persistAll(workflows: SavedWorkflow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

export function useWorkflowStore() {
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>(loadAll);
  const [activeId, setActiveId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_KEY)
  );

  const save = useCallback((name: string, nodes: Node[], edges: Edge[], existingId?: string) => {
    const now = new Date().toISOString();
    const id = existingId || `wf-${Date.now()}`;
    setWorkflows((prev) => {
      const existing = prev.find((w) => w.id === id);
      const workflow: SavedWorkflow = {
        id,
        name,
        nodes,
        edges,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      const filtered = prev.filter((w) => w.id !== id);
      const next = [workflow, ...filtered];
      persistAll(next);
      return next;
    });
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
    return id;
  }, []);

  const load = useCallback((id: string): SavedWorkflow | null => {
    const all = loadAll();
    const wf = all.find((w) => w.id === id) || null;
    if (wf) {
      setActiveId(id);
      localStorage.setItem(ACTIVE_KEY, id);
    }
    return wf;
  }, []);

  const remove = useCallback((id: string) => {
    setWorkflows((prev) => {
      const next = prev.filter((w) => w.id !== id);
      persistAll(next);
      return next;
    });
    if (activeId === id) {
      setActiveId(null);
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [activeId]);

  const refresh = useCallback(() => {
    setWorkflows(loadAll());
  }, []);

  return { workflows, activeId, save, load, remove, refresh };
}
