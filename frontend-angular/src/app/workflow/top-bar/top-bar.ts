import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFilePlus, lucideFolderOpen, lucidePlay, lucideRedo2, lucideSave, lucideSettings, lucideUndo2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideFilePlus, lucideFolderOpen, lucideUndo2, lucideRedo2, lucideSettings, lucideSave, lucidePlay })],
  templateUrl: './top-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  readonly workflowName = input.required<string>();

  readonly save = output<void>();
  readonly openManager = output<void>();
  readonly newWorkflow = output<void>();
}
