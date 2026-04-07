import { useRef, useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import TopBar from '@/components/workflow/TopBar';
import NodePalette from '@/components/workflow/NodePalette';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import WorkflowManager from '@/components/workflow/WorkflowManager';
import SaveDialog from '@/components/workflow/SaveDialog';
import WorkflowSelector from '@/pages/WorkflowSelector';
import { useWorkflowStore } from '@/hooks/useWorkflowStore';
import { toast } from 'sonner';

const WorkflowEditor = () => {
  const store = useWorkflowStore();
  const [showEditor, setShowEditor] = useState(false);
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [canvasKey, setCanvasKey] = useState(0);
  const [loadedNodes, setLoadedNodes] = useState<Node[] | undefined>(undefined);
  const [loadedEdges, setLoadedEdges] = useState<Edge[] | undefined>(undefined);
  const [showManager, setShowManager] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const getStateRef = useRef<(() => { nodes: Node[]; edges: Edge[] }) | null>(null);

  const handleSave = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  const handleSaveConfirm = useCallback((name: string) => {
    if (!getStateRef.current) return;
    const { nodes, edges } = getStateRef.current();
    store.save(name, nodes, edges, store.activeId || undefined);
    setWorkflowName(name);
    setShowSaveDialog(false);
    toast.success('Workflow saved');
  }, [store]);

  const handleLoad = useCallback((id: string) => {
    const wf = store.load(id);
    if (wf) {
      setWorkflowName(wf.name);
      setLoadedNodes(wf.nodes);
      setLoadedEdges(wf.edges);
      setCanvasKey((k) => k + 1);
      setShowManager(false);
      setShowEditor(true);
      toast.success(`Loaded "${wf.name}"`);
    }
  }, [store]);

  const handleDelete = useCallback((id: string) => {
    store.remove(id);
    store.refresh();
    toast.success('Workflow deleted');
  }, [store]);

  const handleNew = useCallback(() => {
    setWorkflowName('Untitled Workflow');
    setLoadedNodes(undefined);
    setLoadedEdges(undefined);
    setCanvasKey((k) => k + 1);
    setShowEditor(true);
    toast.info('New workflow created');
  }, []);

  const handleSelectorSelect = useCallback((id: string) => {
    const wf = store.load(id);
    if (wf) {
      setWorkflowName(wf.name);
      setLoadedNodes(wf.nodes);
      setLoadedEdges(wf.edges);
      setCanvasKey((k) => k + 1);
      setShowEditor(true);
    }
  }, [store]);

  const handleSelectorDelete = useCallback((id: string) => {
    store.remove(id);
    store.refresh();
    toast.success('Workflow deleted');
  }, [store]);

  if (!showEditor) {
    return (
      <WorkflowSelector
        workflows={store.workflows}
        onSelect={handleSelectorSelect}
        onNew={handleNew}
        onDelete={handleSelectorDelete}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <TopBar
        workflowName={workflowName}
        onSave={handleSave}
        onOpenManager={() => { store.refresh(); setShowManager(true); }}
        onNewWorkflow={handleNew}
      />
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <WorkflowCanvas
          key={canvasKey}
          initialNodes={loadedNodes}
          initialEdges={loadedEdges}
          getStateRef={getStateRef}
        />
      </div>
      {showManager && (
        <WorkflowManager
          workflows={store.workflows}
          activeId={store.activeId}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onClose={() => setShowManager(false)}
        />
      )}
      {showSaveDialog && (
        <SaveDialog
          defaultName={workflowName}
          onSave={handleSaveConfirm}
          onClose={() => setShowSaveDialog(false)}
        />
      )}
    </div>
  );
};

export default WorkflowEditor;
