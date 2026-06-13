import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSave, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-save-dialog',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideSave, lucideX })],
  templateUrl: './save-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveDialogComponent {
  readonly defaultName = input.required<string>();

  readonly save = output<string>();
  readonly closed = output<void>();

  protected readonly name = linkedSignal(() => this.defaultName());

  protected onSave(): void {
    const trimmed = this.name().trim();
    if (!trimmed) return;
    this.save.emit(trimmed);
  }
}
