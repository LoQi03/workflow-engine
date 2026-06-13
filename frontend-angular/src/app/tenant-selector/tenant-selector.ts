import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-tenant-selector',
  standalone: true,
  imports: [NgIcon, ...HlmButtonImports, ...HlmInputImports, ...HlmLabelImports],
  providers: [provideIcons({ lucideBuilding2 })],
  templateUrl: './tenant-selector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantSelectorComponent {
  private readonly router = inject(Router);

  protected readonly tenant = signal('');

  protected onTenantInput(event: Event): void {
    this.tenant.set((event.target as HTMLInputElement).value);
  }

  protected handleApply(): void {
    if (!this.tenant().trim()) return;
    this.router.navigate(['/editor']);
  }
}
