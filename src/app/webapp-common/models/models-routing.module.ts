import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ModelsComponent} from './models.component';
import {ModelInfoComponent} from './containers/model-info/model-info.component';
import {ModelInfoGeneralComponent} from './containers/model-info-general/model-info-general.component';
import {ModelInfoNetworkComponent} from './containers/model-info-network/model-info-network.component';
import {ModelInfoLabelsComponent} from './containers/model-info-labels/model-info-labels.component';
import {LeavingBeforeSaveAlertGuard} from '../shared/guards/leaving-before-save-alert.guard';
import {ModelInfoMetadataComponent} from './containers/model-info-metadata/model-info-metadata.component';
import {
  ModelInfoExperimentsComponent
} from "@common/models/containers/model-info-experiments/model-info-experiments.component";
import {ModelInfoScalarsComponent} from '@common/models/containers/model-info-scalars/model-info-scalars.component';
import {ModelInfoPlotsComponent} from '@common/models/containers/model-info-plots/model-info-plots.component';

export const routes: Routes = [
  {
    path     : '',
    component: ModelsComponent,
    children : [
      {
        path    : ':modelId', component: ModelInfoComponent,
        children: [
          {path: '', redirectTo: 'general', pathMatch: 'full'},
          {path: 'general', component: ModelInfoGeneralComponent},
          {path: 'network', component: ModelInfoNetworkComponent, canDeactivate: [LeavingBeforeSaveAlertGuard]},
          {path: 'labels', component: ModelInfoLabelsComponent, canDeactivate: [LeavingBeforeSaveAlertGuard]},
          {path: 'metadata', component: ModelInfoMetadataComponent, canDeactivate: [LeavingBeforeSaveAlertGuard]},
          {path: 'experiments', component: ModelInfoExperimentsComponent, canDeactivate: [LeavingBeforeSaveAlertGuard]},
          {path: 'scalars', component: ModelInfoScalarsComponent, data: {minimized: true}},
          {path: 'plots', component: ModelInfoPlotsComponent},
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

