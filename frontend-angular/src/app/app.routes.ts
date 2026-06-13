import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found';
import { TenantSelectorComponent } from './tenant-selector/tenant-selector';
import { WorkflowCanvasComponent } from './workflow/workflow-canvas/workflow-canvas';
import { WorkflowSelectorComponent } from './workflow/workflow-selector/workflow-selector';

export const routes: Routes = [
  { path: '', component: TenantSelectorComponent },
  { path: 'editor', component: WorkflowSelectorComponent },
  { path: 'editor/new', component: WorkflowCanvasComponent },
  { path: 'editor/:id', component: WorkflowCanvasComponent },
  { path: '**', component: NotFoundComponent },
];
