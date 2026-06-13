import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCode,
  lucideDatabase,
  lucideGitBranch,
  lucideGripVertical,
  lucideMail,
  lucidePlay,
  lucideSend,
  lucideWebhook,
  lucideZap,
  lucideClock,
} from '@ng-icons/lucide';

export interface NodeTemplate {
  type: string;
  category: 'trigger' | 'action' | 'condition' | 'output';
  label: string;
  icon: string;
  description: string;
}

interface NodeTemplateGroup {
  category: string;
  label: string;
  color: string;
  templates: NodeTemplate[];
}

const nodeTemplates: NodeTemplate[] = [
  { type: 'webhook-trigger', category: 'trigger', label: 'Webhook', icon: 'webhook', description: 'Start on HTTP request' },
  { type: 'timer-trigger', category: 'trigger', label: 'Schedule', icon: 'timer', description: 'Run on a schedule' },
  { type: 'event-trigger', category: 'trigger', label: 'Event', icon: 'trigger', description: 'Listen for events' },
  { type: 'code-action', category: 'action', label: 'Run Code', icon: 'code', description: 'Execute custom code' },
  { type: 'api-action', category: 'action', label: 'HTTP Request', icon: 'webhook', description: 'Call an external API' },
  { type: 'db-action', category: 'action', label: 'Database', icon: 'database', description: 'Query a database' },
  { type: 'email-action', category: 'action', label: 'Send Email', icon: 'email', description: 'Send an email' },
  { type: 'condition-node', category: 'condition', label: 'If / Else', icon: 'condition', description: 'Branch on condition' },
  { type: 'output-node', category: 'output', label: 'Response', icon: 'output', description: 'Return a response' },
];

const iconMap: Record<string, string> = {
  trigger: 'lucideZap',
  webhook: 'lucideWebhook',
  timer: 'lucideClock',
  code: 'lucideCode',
  database: 'lucideDatabase',
  email: 'lucideMail',
  condition: 'lucideGitBranch',
  output: 'lucideSend',
  action: 'lucidePlay',
};

const colorMap: Record<string, string> = {
  trigger: 'var(--node-trigger)',
  action: 'var(--node-action)',
  condition: 'var(--node-condition)',
  output: 'var(--node-output)',
};

const categoryLabels: Record<string, string> = {
  trigger: 'Triggers',
  action: 'Actions',
  condition: 'Logic',
  output: 'Output',
};

export const NODE_TEMPLATE_DATA_TRANSFER_TYPE = 'application/x-vflow-node-template';

const nodeCategories: NodeTemplate['category'][] = ['trigger', 'action', 'condition', 'output'];

export function isNodeTemplate(value: unknown): value is NodeTemplate {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['type'] === 'string' &&
    typeof candidate['label'] === 'string' &&
    typeof candidate['icon'] === 'string' &&
    typeof candidate['description'] === 'string' &&
    nodeCategories.includes(candidate['category'] as NodeTemplate['category'])
  );
}

function groupTemplates(templates: NodeTemplate[]): NodeTemplateGroup[] {
  const grouped = templates.reduce((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {} as Record<string, NodeTemplate[]>);

  return Object.entries(grouped).map(([category, groupTemplates]) => ({
    category,
    label: categoryLabels[category],
    color: colorMap[category],
    templates: groupTemplates,
  }));
}

@Component({
  selector: 'app-node-palette',
  standalone: true,
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideZap,
      lucidePlay,
      lucideGitBranch,
      lucideSend,
      lucideClock,
      lucideDatabase,
      lucideMail,
      lucideCode,
      lucideWebhook,
      lucideGripVertical,
    }),
  ],
  templateUrl: './node-palette.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodePaletteComponent {
  protected readonly groups: NodeTemplateGroup[] = groupTemplates(nodeTemplates);
  protected readonly colorMap = colorMap;

  protected iconFor(template: NodeTemplate): string {
    return iconMap[template.icon] ?? iconMap['action'];
  }

  protected onDragStart(event: DragEvent, template: NodeTemplate): void {
    event.dataTransfer?.setData(NODE_TEMPLATE_DATA_TRANSFER_TYPE, JSON.stringify(template));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }
}
