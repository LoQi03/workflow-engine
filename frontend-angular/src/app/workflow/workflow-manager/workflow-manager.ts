import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClock, lucideFileText, lucideFolderOpen, lucideTrash2, lucideX } from '@ng-icons/lucide';
import { SavedWorkflow } from '../workflow-store/workflow-store';

@Component({
  selector: 'app-workflow-manager',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideFolderOpen, lucideTrash2, lucideClock, lucideX, lucideFileText })],
  templateUrl: './workflow-manager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowManagerComponent {
  readonly workflows = input.required<SavedWorkflow[]>();
  readonly activeId = input.required<string | null>();

  readonly load = output<string>();
  readonly deleteWorkflow = output<string>();
  readonly closed = output<void>();

  protected formatTimestamp(updatedAt: string): string {
    const date = new Date(updatedAt);
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} · ${timeStr}`;
  }
}
