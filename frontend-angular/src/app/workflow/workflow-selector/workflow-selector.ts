import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideCalendar,
  lucideChevronLeft,
  lucideChevronRight,
  lucideClock,
  lucideFolderOpen,
  lucideHash,
  lucidePlus,
  lucideSearch,
  lucideTrash2,
  lucideWorkflow,
  lucideZap,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { WorkflowStoreService } from '../workflow-store/workflow-store';

const ITEMS_PER_PAGE = 6;

@Component({
  selector: 'app-workflow-selector',
  standalone: true,
  imports: [NgIcon, ...HlmButtonImports, ...HlmInputImports],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideCalendar,
      lucideChevronLeft,
      lucideChevronRight,
      lucideClock,
      lucideFolderOpen,
      lucideHash,
      lucidePlus,
      lucideSearch,
      lucideTrash2,
      lucideWorkflow,
      lucideZap,
    }),
  ],
  templateUrl: './workflow-selector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowSelectorComponent {
  private readonly workflowStore = inject(WorkflowStoreService);
  private readonly router = inject(Router);

  protected readonly workflows = this.workflowStore.workflows;

  protected readonly search = signal('');
  protected readonly page = signal(1);

  protected readonly filtered = computed(() => {
    const query = this.search().toLowerCase().trim();
    if (!query) return this.workflows();
    return this.workflows().filter(
      (wf) => wf.name.toLowerCase().includes(query) || wf.id.toLowerCase().includes(query),
    );
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / ITEMS_PER_PAGE)));
  protected readonly safePage = computed(() => Math.min(this.page(), this.totalPages()));
  protected readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  protected readonly paged = computed(() => {
    const start = (this.safePage() - 1) * ITEMS_PER_PAGE;
    return this.filtered().slice(start, start + ITEMS_PER_PAGE);
  });

  protected readonly rangeStart = computed(() => (this.safePage() - 1) * ITEMS_PER_PAGE + 1);
  protected readonly rangeEnd = computed(() => Math.min(this.safePage() * ITEMS_PER_PAGE, this.filtered().length));

  protected onSearchInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.page.set(1);
  }

  protected prevPage(): void {
    this.page.set(Math.max(1, this.safePage() - 1));
  }

  protected nextPage(): void {
    this.page.set(Math.min(this.totalPages(), this.safePage() + 1));
  }

  protected setPage(page: number): void {
    this.page.set(page);
  }

  protected onNew(): void {
    this.router.navigate(['/editor/new']);
  }

  protected onSelect(id: string): void {
    this.router.navigate(['/editor', id]);
  }

  protected onDelete(event: Event, id: string): void {
    event.stopPropagation();
    this.workflowStore.remove(id);
  }

  protected formatDate(iso: string): string {
    const date = new Date(iso);
    return (
      date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' +
      date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    );
  }
}
