import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ProjectInfoComponent} from './project-info.component';
import {generalLeavingBeforeSaveAlertGuard} from '../shared/guards/general-leaving-before-save-alert.guard';

export const routes: Routes = [
  {
    path     : '',
    component: ProjectInfoComponent,
    data: {search: false, archiveLabel: ''},
    canDeactivate: [generalLeavingBeforeSaveAlertGuard],
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ProjectInfoRoutingModule {
}

