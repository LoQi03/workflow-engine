import { Routes } from '@angular/router';
import { UiShowcase } from './ui-showcase/ui-showcase';
import { WorkflowCanvasComponent } from './workflow/workflow-canvas/workflow-canvas';

export const routes: Routes = [
  { path: 'ui-showcase', component: UiShowcase },
  { path: 'workflow-canvas', component: WorkflowCanvasComponent },
];
