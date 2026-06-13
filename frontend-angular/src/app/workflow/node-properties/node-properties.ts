import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { ComponentNode } from 'ngx-vflow';
import { WorkflowNodeData } from '../workflow-node/workflow-node';

const colorMap: Record<string, string> = {
  trigger: 'var(--node-trigger)',
  action: 'var(--node-action)',
  condition: 'var(--node-condition)',
  output: 'var(--node-output)',
};

@Component({
  selector: 'app-node-properties',
  standalone: true,
  imports: [
    NgIcon,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmSelectImports,
    ...HlmSwitchImports,
    ...HlmTextareaImports,
  ],
  providers: [provideIcons({ lucideX })],
  templateUrl: './node-properties.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodePropertiesComponent {
  readonly node = input.required<ComponentNode<WorkflowNodeData>>();
  readonly deleted = output<string>();

  protected readonly data = computed(() => this.node().data!());

  protected readonly accentColor = computed(() => colorMap[this.data().type] ?? colorMap['action']);

  protected readonly accentColorSolid = computed(() => `hsl(${this.accentColor()})`);

  protected handleChange<K extends keyof WorkflowNodeData>(field: K, value: WorkflowNodeData[K]): void {
    this.node().data!.update((d) => ({ ...d, [field]: value }));
  }

  private toOptionalNumber(raw: string): number | undefined {
    if (raw === '') return undefined;
    const value = Number(raw);
    return Number.isNaN(value) ? undefined : value;
  }

  protected onLabelInput(event: Event): void {
    this.handleChange('label', (event.target as HTMLInputElement).value);
  }

  protected onDescriptionInput(event: Event): void {
    this.handleChange('description', (event.target as HTMLTextAreaElement).value);
  }

  protected onMethodChange(value: string | null | undefined): void {
    this.handleChange('method', value ?? undefined);
  }

  protected onEndpointInput(event: Event): void {
    this.handleChange('endpoint', (event.target as HTMLInputElement).value);
  }

  protected onTimeoutInput(event: Event): void {
    this.handleChange('timeout', this.toOptionalNumber((event.target as HTMLInputElement).value));
  }

  protected onMaxRetriesInput(event: Event): void {
    this.handleChange('maxRetries', this.toOptionalNumber((event.target as HTMLInputElement).value));
  }

  protected onExpressionInput(event: Event): void {
    this.handleChange('expression', (event.target as HTMLTextAreaElement).value);
  }

  protected onStatusCodeInput(event: Event): void {
    this.handleChange('statusCode', this.toOptionalNumber((event.target as HTMLInputElement).value));
  }

  protected onResponseBodyInput(event: Event): void {
    this.handleChange('responseBody', (event.target as HTMLTextAreaElement).value);
  }

  protected close(): void {
    this.node().selected!.set(false);
  }

  protected deleteNode(): void {
    this.deleted.emit(this.node().id);
  }
}
