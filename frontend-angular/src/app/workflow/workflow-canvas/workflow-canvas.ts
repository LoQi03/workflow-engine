import { ChangeDetectionStrategy, Component, effect, signal, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMaximize, lucideZoomIn, lucideZoomOut } from '@ng-icons/lucide';
import { Connection, Edge, Node, Vflow, VflowComponent, createEdge, createEdges, createNodes } from 'ngx-vflow';
import { WorkflowNodeComponent, WorkflowNodeData } from '../workflow-node/workflow-node';

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
  imports: [Vflow, NgIcon],
  providers: [provideIcons({ lucideZoomIn, lucideZoomOut, lucideMaximize })],
  templateUrl: './workflow-canvas.html',
  styles: ':host { display: block; width: 100%; height: 100vh; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeyDown($event)',
  },
})
export class WorkflowCanvasComponent {
  protected readonly nodes = signal<Node[]>(createInitialNodes());
  protected readonly edges = signal<Edge[]>(createInitialEdges());

  private readonly vflow = viewChild<VflowComponent>('vflow');

  private hasFitView = false;
  private edgeIdCounter = 0;

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

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;

    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, [contenteditable="true"]')) return;

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
  }
}
