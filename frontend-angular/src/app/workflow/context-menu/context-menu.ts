import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideTrash2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideCopy, lucideTrash2 })],
  templateUrl: './context-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:mousedown)': 'onDocumentMouseDown($event)',
  },
})
export class ContextMenuComponent {
  readonly x = input.required<number>();
  readonly y = input.required<number>();

  readonly closed = output<void>();
  readonly duplicateNode = output<void>();
  readonly deleteNode = output<void>();

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly left = computed(() => Math.min(this.x(), window.innerWidth - 200));
  protected readonly top = computed(() => Math.min(this.y(), window.innerHeight - 250));

  protected onDocumentMouseDown(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closed.emit();
    }
  }
}
