import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCode,
  lucideDatabase,
  lucideGitBranch,
  lucideMail,
  lucidePlay,
  lucideSend,
  lucideWebhook,
  lucideZap,
  lucideClock,
} from '@ng-icons/lucide';
import { CustomNodeComponent, Vflow } from 'ngx-vflow';

export interface WorkflowNodeData {
  label: string;
  type: 'trigger' | 'action' | 'condition' | 'output';
  icon?: string;
  description?: string;
  // trigger
  method?: string;
  endpoint?: string;
  // action
  timeout?: number;
  retry?: boolean;
  maxRetries?: number;
  // condition
  expression?: string;
  // output
  statusCode?: number;
  responseBody?: string;
}

const iconMap: Record<string, string> = {
  trigger: 'lucideZap',
  action: 'lucidePlay',
  condition: 'lucideGitBranch',
  output: 'lucideSend',
  timer: 'lucideClock',
  database: 'lucideDatabase',
  email: 'lucideMail',
  code: 'lucideCode',
  webhook: 'lucideWebhook',
};

const colorMap: Record<string, string> = {
  trigger: 'var(--node-trigger)',
  action: 'var(--node-action)',
  condition: 'var(--node-condition)',
  output: 'var(--node-output)',
};

@Component({
  selector: 'app-workflow-node',
  standalone: true,
  imports: [Vflow, NgIcon],
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
    }),
  ],
  templateUrl: './workflow-node.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowNodeComponent extends CustomNodeComponent<WorkflowNodeData> {
  protected readonly icon = computed(() => {
    const data = this.data();
    return iconMap[data?.icon ?? data?.type ?? ''] ?? iconMap['trigger'];
  });

  protected readonly accentColor = computed(() => colorMap[this.data()?.type ?? ''] ?? colorMap['action']);

  protected readonly accentColorSolid = computed(() => `hsl(${this.accentColor()})`);

  protected readonly accentColorSoft = computed(() => `hsl(${this.accentColor()} / 0.15)`);

  protected readonly borderColor = computed(() =>
    this.selected() ? this.accentColorSolid() : 'hsl(var(--border))',
  );

  protected readonly cardClass = computed(() => {
    const base =
      'relative rounded-lg border bg-card px-4 py-3 min-w-[180px] max-w-[220px] transition-all duration-200 cursor-grab active:cursor-grabbing';
    return this.selected()
      ? `${base} ring-2 ring-primary shadow-lg shadow-primary/20`
      : `${base} shadow-md shadow-black/30 hover:shadow-lg hover:shadow-black/40`;
  });
}
