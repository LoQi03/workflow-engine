import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMaximize, lucideZoomIn, lucideZoomOut } from '@ng-icons/lucide';
import { ComponentNodeEvent, Connection, Edge, Node, Vflow, VflowComponent, createEdge, createEdges, createNode, createNodes, isComponentNode } from 'ngx-vflow';
import { ContextMenuComponent } from '../context-menu/context-menu';
import { NodePropertiesComponent } from '../node-properties/node-properties';
import { NODE_TEMPLATE_DATA_TRANSFER_TYPE, NodePaletteComponent, isNodeTemplate } from '../node-palette/node-palette';
import { SaveDialogComponent } from '../save-dialog/save-dialog';
import { TopBarComponent } from '../top-bar/top-bar';
import { WorkflowManagerComponent } from '../workflow-manager/workflow-manager';
import { WorkflowNodeComponent, WorkflowNodeData } from '../workflow-node/workflow-node';
import { WorkflowStoreService, fromSavedEdges, fromSavedNodes, toSavedEdges, toSavedNodes } from '../workflow-store/workflow-store';

function createInitialNodes(): Node[] {
  return createNodes<WorkflowNodeData>([
    { id: '1', point: { x: 250, y: 50 }, type: WorkflowNodeComponent, data: { label: 'Webhook', type: 'trigger', icon: 'webhook', description: 'POST /api/start' } },
    { id: '2', point: { x: 250, y: 200 }, type: WorkflowNodeComponent, data: { label: 'Validate', type: 'condition', icon: 'condition', description: 'Check payload' } },
    { id: '3', point: { x: 150, y: 370 }, type: WorkflowNodeComponent, data: { label: 'Process', type: 'action', icon: 'code', description: 'Transform data' } },
    { id: '4', point: { x: 400, y: 370 }, type: WorkflowNodeComponent, data: { label: 'Error', type: 'output', icon: 'output', description: 'Return 400' } },
    { id: '5', point: { x: 150, y: 530 }, type: WorkflowNodeComponent, data: { label: 'Send Email', type: 'action', icon: 'email', description: 'Notify user' } },
  ]);
}

function createInitialEdges(): Edge[] {
  return createEdges([
    { id: 'e1-2', source: '1', target: '2', curve: 'smooth-step' },
    { id: 'e2-3', source: '2', target: '3', curve: 'smooth-step' },
    { id: 'e2-4', source: '2', sourceHandle: 'false', target: '4', curve: 'smooth-step' },
    { id: 'e3-5', source: '3', target: '5', curve: 'smooth-step' },
  ]);
}

@Component({
  selector: 'app-workflow-canvas',
  standalone: true,
  imports: [Vflow, NgIcon, NodePaletteComponent, NodePropertiesComponent, ContextMenuComponent, TopBarComponent, SaveDialogComponent, WorkflowManagerComponent],
  providers: [provideIcons({ lucideZoomIn, lucideZoomOut, lucideMaximize })],
  templateUrl: './workflow-canvas.html',
  styles: ':host { display: block; width: 100%; height: 100vh; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeyDown($event)',
  },
})
export class WorkflowCanvasComponent {
  protected readonly workflowStore = inject(WorkflowStoreService);

  protected readonly nodes = signal<Node[]>(createInitialNodes());
  protected readonly edges = signal<Edge[]>(createInitialEdges());
  protected readonly workflowName = signal('My Workflow');
  protected readonly showSaveDialog = signal(false);
  protected readonly showManager = signal(false);

  protected readonly selectedNode = computed(() => {
    const n = this.nodes().find((x) => x.selected?.());
    return n && isComponentNode<WorkflowNodeData>(n) ? n : undefined;
  });

  protected readonly contextMenu = signal<
    | { type: 'node'; x: number; y: number; nodeId: string }
    | { type: 'canvas'; x: number; y: number; flowPoint: { x: number; y: number } }
    | null
  >(null);

  private readonly vflow = viewChild<VflowComponent>('vflow');

  private hasFitView = false;
  private edgeIdCounter = 0;
  private nodeIdCounter = 0;

  constructor() {
    effect(() => {
      const vflow = this.vflow();
      if (!vflow || this.hasFitView || !vflow.initialized()) return;
      this.hasFitView = true;
      vflow.fitView();
    });
  }

  protected onConnect(connection: Connection): void {
    const exists = this.edges().some(
      (edge) =>
        edge.source === connection.source &&
        edge.target === connection.target &&
        edge.sourceHandle === connection.sourceHandle &&
        edge.targetHandle === connection.targetHandle,
    );
    if (exists) return;

    const id = `e-${connection.source}-${connection.target}-${this.edgeIdCounter++}`;
    const edge = createEdge({ ...connection, id, curve: 'smooth-step' });
    this.edges.update((edges) => [...edges, edge]);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();

    const payload = event.dataTransfer?.getData(NODE_TEMPLATE_DATA_TRANSFER_TYPE);
    if (!payload) return;

    let template: unknown;
    try {
      template = JSON.parse(payload);
    } catch {
      return;
    }
    if (!isNodeTemplate(template)) return;

    const vflow = this.vflow();
    if (!vflow) return;

    const point = vflow.documentPointToFlowPoint({ x: event.clientX, y: event.clientY });
    const node = createNode<WorkflowNodeData>({
      id: `node-${this.nodeIdCounter++}`,
      point,
      type: WorkflowNodeComponent,
      data: {
        label: template.label,
        type: template.category,
        icon: template.icon,
        description: template.description,
      },
    });
    this.nodes.update((nodes) => [...nodes, node]);
  }

  protected zoomIn(): void {
    const vflow = this.vflow();
    if (!vflow) return;
    vflow.zoomTo(vflow.viewport().zoom * 1.2);
  }

  protected zoomOut(): void {
    const vflow = this.vflow();
    if (!vflow) return;
    vflow.zoomTo(vflow.viewport().zoom / 1.2);
  }

  protected fitView(): void {
    this.vflow()?.fitView();
  }

  protected onSaveConfirm(name: string): void {
    this.workflowStore.save(name, toSavedNodes(this.nodes()), toSavedEdges(this.edges()), this.workflowStore.activeId() ?? undefined);
    this.workflowName.set(name);
    this.showSaveDialog.set(false);
  }

  protected onOpenManager(): void {
    this.workflowStore.refresh();
    this.showManager.set(true);
  }

  protected onLoadWorkflow(id: string): void {
    const wf = this.workflowStore.load(id);
    if (!wf) return;

    this.nodes.set(fromSavedNodes(wf.nodes));
    this.edges.set(fromSavedEdges(wf.edges));
    this.workflowName.set(wf.name);
    this.contextMenu.set(null);
    this.reseedCounters();
    this.showManager.set(false);
    this.fitView();
  }

  protected onDeleteWorkflow(id: string): void {
    this.workflowStore.remove(id);
    this.workflowStore.refresh();
  }

  private reseedCounters(): void {
    const nodeMatches = this.nodes()
      .map((node) => /^node-(\d+)$/.exec(node.id))
      .filter((match): match is RegExpExecArray => match !== null)
      .map((match) => Number(match[1]));
    this.nodeIdCounter = Math.max(-1, ...nodeMatches) + 1;

    const edgeMatches = this.edges()
      .map((edge) => /^e-.+-(\d+)$/.exec(edge.id))
      .filter((match): match is RegExpExecArray => match !== null)
      .map((match) => Number(match[1]));
    this.edgeIdCounter = Math.max(-1, ...edgeMatches) + 1;
  }

  protected onNewWorkflow(): void {
    this.nodes.set(createInitialNodes());
    this.edges.set(createInitialEdges());
    this.workflowName.set('Untitled Workflow');
    this.contextMenu.set(null);
    this.workflowStore.clearActive();
    this.nodeIdCounter = 0;
    this.edgeIdCounter = 0;
    this.fitView();
  }

  protected onNodeDelete(id: string): void {
    this.nodes.update((nodes) => nodes.filter((node) => node.id !== id));
    this.edges.update((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  }

  protected onNodeDuplicate(id: string): void {
    const source = this.nodes().find((node) => node.id === id);
    if (!source || !isComponentNode<WorkflowNodeData>(source)) return;

    const point = source.point();
    const node = createNode<WorkflowNodeData>({
      id: `node-${this.nodeIdCounter++}`,
      point: { x: point.x + 40, y: point.y + 40 },
      type: WorkflowNodeComponent,
      data: { ...source.data!() },
    });
    this.nodes.update((nodes) => [...nodes, node]);
  }

  protected onComponentNodeEvent(event: ComponentNodeEvent<[WorkflowNodeComponent]>): void {
    if (event.eventName === 'contextMenuRequested') {
      this.contextMenu.set({ type: 'node', x: event.eventPayload.x, y: event.eventPayload.y, nodeId: event.nodeId });
    }
  }

  protected onCanvasContextMenu(event: MouseEvent): void {
    event.preventDefault();

    const vflow = this.vflow();
    if (!vflow) return;

    const flowPoint = vflow.documentPointToFlowPoint({ x: event.clientX, y: event.clientY });
    this.contextMenu.set({ type: 'canvas', x: event.clientX, y: event.clientY, flowPoint });
  }

  protected onAddNodeFromMenu(category: 'trigger' | 'action' | 'condition' | 'output', point: { x: number; y: number }): void {
    const defaults: Record<'trigger' | 'action' | 'condition' | 'output', { label: string; icon: string; description: string }> = {
      trigger: { label: 'New Trigger', icon: 'trigger', description: 'Configure trigger' },
      action: { label: 'New Action', icon: 'action', description: 'Configure action' },
      condition: { label: 'If / Else', icon: 'condition', description: 'Add condition' },
      output: { label: 'Response', icon: 'output', description: 'Return result' },
    };
    const d = defaults[category];
    const node = createNode<WorkflowNodeData>({
      id: `node-${this.nodeIdCounter++}`,
      point,
      type: WorkflowNodeComponent,
      data: { label: d.label, type: category, icon: d.icon, description: d.description },
    });
    this.nodes.update((nodes) => [...nodes, node]);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;

    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, button, [contenteditable="true"], [role="switch"], [role="listbox"], [role="option"]')) return;

    const deletedNodeIds = new Set(this.nodes().filter((node) => node.selected?.()).map((node) => node.id));
    const hasSelectedEdge = this.edges().some((edge) => edge.selected?.());
    if (deletedNodeIds.size === 0 && !hasSelectedEdge) return;

    event.preventDefault();
    this.nodes.update((nodes) => nodes.filter((node) => !node.selected?.()));
    this.edges.update((edges) =>
      edges.filter(
        (edge) =>
          !edge.selected?.() && !deletedNodeIds.has(edge.source) && !deletedNodeIds.has(edge.target),
      ),
    );

    const menu = this.contextMenu();
    if (menu && menu.type === 'node' && deletedNodeIds.has(menu.nodeId)) {
      this.contextMenu.set(null);
    }
  }
}
