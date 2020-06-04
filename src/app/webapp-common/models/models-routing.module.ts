import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ModelsComponent} from './models.component';
import {ModelInfoComponent} from './containers/model-info/model-info.component';
import {ModelInfoGeneralComponent} from './containers/model-info-general/model-info-general.component';
import {ModelInfoNetworkComponent} from './containers/model-info-network/model-info-network.component';
import {ModelInfoLabelsComponent} from './containers/model-info-labels/model-info-labels.component';
import {LeavingBeforeSaveAlertGuard} from '../shared/guards/leaving-before-save-alert.guard';

export const routes: Routes = [
  {
    path     : '',
    component: ModelsComponent,
    children : [
      {
        path    : ':modelId', component: ModelInfoComponent,
        children: [
          {path: '', redirectTo: 'general'},
          {path: 'general', component: ModelInfoGeneralComponent},
          {path: 'network', component: ModelInfoNetworkComponent, canDeactivate: [LeavingBeforeSaveAlertGuard]},
          {path: 'labels', component: ModelInfoLabelsComponent, canDeactivate: [LeavingBeforeSaveAlertGuard]},
        ]
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ModelRouterModule {
}

