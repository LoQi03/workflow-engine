import { Component, signal } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';

@Component({
  selector: 'app-ui-showcase',
  imports: [
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmSelectImports,
    ...HlmSwitchImports,
    ...HlmTextareaImports,
    ...HlmTooltipImports,
    ...HlmToasterImports,
  ],
  templateUrl: './ui-showcase.html',
})
export class UiShowcase {
  protected readonly selectedFruit = signal<string | null | undefined>(undefined);
  protected readonly notificationsEnabled = signal(false);

  protected showToast(): void {
    toast('Event has been created', {
      description: 'Sunday, December 03, 2026 at 9:00 AM',
    });
  }
}
