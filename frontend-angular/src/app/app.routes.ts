import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found';
import { TenantSelectorComponent } from './tenant-selector/tenant-selector';
import { UiShowcase } from './ui-showcase/ui-showcase';
import { WorkflowCanvasComponent } from './workflow/workflow-canvas/workflow-canvas';

export const routes: Routes = [
  { path: '', component: TenantSelectorComponent },
  { path: 'ui-showcase', component: UiShowcase },
  { path: 'editor', component: WorkflowCanvasComponent },
  { path: '**', component: NotFoundComponent },
];
