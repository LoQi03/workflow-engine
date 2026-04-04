import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  ReactFlowInstance,
  BackgroundVariant,
  MarkerType,
  Node,
  NodeMouseHandler,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import WorkflowNode from './WorkflowNode';
import NodeProperties from './NodeProperties';
import ContextMenu from './ContextMenu';

const nodeTypes = { workflowNode: WorkflowNode };

const defaultNodes: Node[] = [
  { id: '1', type: 'workflowNode', position: { x: 250, y: 50 }, data: { label: 'Webhook', type: 'trigger', icon: 'webhook', description: 'POST /api/start' } },
  { id: '2', type: 'workflowNode', position: { x: 250, y: 200 }, data: { label: 'Validate', type: 'condition', icon: 'condition', description: 'Check payload' } },
  { id: '3', type: 'workflowNode', position: { x: 150, y: 370 }, data: { label: 'Process', type: 'action', icon: 'code', description: 'Transform data' } },
  { id: '4', type: 'workflowNode', position: { x: 400, y: 370 }, data: { label: 'Error', type: 'output', icon: 'output', description: 'Return 400' } },
  { id: '5', type: 'workflowNode', position: { x: 150, y: 530 }, data: { label: 'Send Email', type: 'action', icon: 'email', description: 'Notify user' } },
];

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 }, animated: true },
  { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 } },
  { id: 'e2-4', source: '2', sourceHandle: 'false', target: '4', markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 }, style: { strokeDasharray: '5 5' } },
  { id: 'e3-5', source: '3', target: '5', markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 } },
];

let nodeId = 10;

type ContextMenuState = {
  x: number;
  y: number;
  type: 'node' | 'canvas' | 'edge';
  nodeId?: string;
  edgeId?: string;
  flowPosition?: { x: number; y: number };
} | null;

interface WorkflowCanvasInnerProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  getStateRef: React.MutableRefObject<(() => { nodes: Node[]; edges: Edge[] }) | null>;
}

const WorkflowCanvasInner = ({ initialNodes, initialEdges, getStateRef }: WorkflowCanvasInnerProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || defaultEdges);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  // Expose current state to parent
  getStateRef.current = () => ({ nodes, edges });

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 } }, eds)
      ),
    [setEdges]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node);
    setContextMenu(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setContextMenu(null);
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode((prev) => (prev?.id === id ? null : prev));
  }, [setNodes, setEdges]);

  const duplicateNode = useCallback((id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    const newNode: Node = {
      id: `node-${nodeId++}`,
      type: 'workflowNode',
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      data: { ...node.data },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  const deleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== id));
  }, [setEdges]);

  const addNodeAtPosition = useCallback((category: string, position: { x: number; y: number }) => {
    const defaults: Record<string, { label: string; icon: string; description: string }> = {
      trigger: { label: 'New Trigger', icon: 'trigger', description: 'Configure trigger' },
      action: { label: 'New Action', icon: 'action', description: 'Configure action' },
      condition: { label: 'If / Else', icon: 'condition', description: 'Add condition' },
      output: { label: 'Response', icon: 'output', description: 'Return result' },
    };
    const d = defaults[category] || defaults.action;
    const newNode: Node = {
      id: `node-${nodeId++}`,
      type: 'workflowNode',
      position,
      data: { label: d.label, type: category, icon: d.icon, description: d.description },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, type: 'node', nodeId: node.id });
  }, []);

  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, type: 'edge', edgeId: edge.id });
  }, []);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    if (!rfInstance || !reactFlowWrapper.current) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const flowPosition = rfInstance.project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    setContextMenu({ x: event.clientX, y: event.clientY, type: 'canvas', flowPosition });
  }, [rfInstance]);

  const onNodeDataUpdate = useCallback((id: string, data: Record<string, any>) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data } : n)));
    setSelectedNode((prev) => (prev && prev.id === id ? { ...prev, data } : prev));
  }, [setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const data = event.dataTransfer.getData('application/reactflow');
      if (!data || !rfInstance || !reactFlowWrapper.current) return;
      const template = JSON.parse(data);
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.project({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
      const newNode: Node = {
        id: `node-${nodeId++}`,
        type: 'workflowNode',
        position,
        data: { label: template.label, type: template.category, icon: template.icon, description: template.description },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [rfInstance, setNodes]
  );

  const currentSelectedNode = selectedNode ? nodes.find((n) => n.id === selectedNode.id) || null : null;

  return (
    <div className="flex flex-1 overflow-hidden">
      <div ref={reactFlowWrapper} className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setRfInstance}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
          snapToGrid
          snapGrid={[16, 16]}
          defaultEdgeOptions={{ type: 'smoothstep', style: { strokeWidth: 2 } }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--canvas-grid))" />
          <Controls />
          <MiniMap nodeColor={() => 'hsl(var(--primary))'} maskColor="hsl(var(--background) / 0.8)" style={{ borderRadius: 8 }} />
        </ReactFlow>
      </div>
      {currentSelectedNode && (
        <NodeProperties
          node={currentSelectedNode}
          onUpdate={onNodeDataUpdate}
          onClose={() => setSelectedNode(null)}
          onDelete={deleteNode}
        />
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          onClose={() => setContextMenu(null)}
          onDeleteNode={contextMenu.nodeId ? () => { deleteNode(contextMenu.nodeId!); setContextMenu(null); } : undefined}
          onDuplicateNode={contextMenu.nodeId ? () => { duplicateNode(contextMenu.nodeId!); setContextMenu(null); } : undefined}
          onDeleteEdge={contextMenu.edgeId ? () => { deleteEdge(contextMenu.edgeId!); setContextMenu(null); } : undefined}
          onAddNode={contextMenu.flowPosition ? (category: string) => { addNodeAtPosition(category, contextMenu.flowPosition!); setContextMenu(null); } : undefined}
        />
      )}
    </div>
  );
};

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  getStateRef: React.MutableRefObject<(() => { nodes: Node[]; edges: Edge[] }) | null>;
}

const WorkflowCanvas = ({ initialNodes, initialEdges, getStateRef }: WorkflowCanvasProps) => (
  <ReactFlowProvider>
    <WorkflowCanvasInner initialNodes={initialNodes} initialEdges={initialEdges} getStateRef={getStateRef} />
  </ReactFlowProvider>
);

export default WorkflowCanvas;
