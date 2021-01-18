import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ExperimentsComponent} from './experiments.component';
import {SMSharedModule} from '../../webapp-common/shared/shared.module';
import {SelectableListComponent} from '../../webapp-common/shared/ui-components/data/selectable-list/selectable-list.component';
import {SelectableFilterListComponent} from '../../webapp-common/shared/ui-components/data/selectable-filter-list/selectable-filter-list.component';
import {ExperimentInfoGeneralComponent} from '../../webapp-common/experiments/containers/experiment-info-general/experiment-info-general.component';
import {ExperimentOutputComponent} from '../../webapp-common/experiments/containers/experiment-ouptut/experiment-output.component';
import {ExperimentOutputScalarsComponent} from '../../webapp-common/experiments/containers/experiment-output-scalars/experiment-output-scalars.component';
import {ExperimentOutputPlotsComponent} from '../../webapp-common/experiments/containers/experiment-output-plots/experiment-output-plots.component';
import {ExperimentOutputLogComponent} from '../../webapp-common/experiments/containers/experiment-output-log/experiment-output-log.component';
import {ExperimentInfoComponent} from './containers/experiment-info/experiment-info.component';
import {ExperimentInfoHyperParametersComponent} from '../../webapp-common/experiments/containers/experiment-info-hyper-parameters/experiment-info-hyper-parameters.component';
import {DebugImagesComponent} from '../../webapp-common/debug-images/debug-images.component';
import {ExperimentInfoArtifactsComponent} from '../../webapp-common/experiments/containers/experiment-info-aritfacts/experiment-info-artifacts.component';
import {ExperimentInfoInputModelComponent} from '../../webapp-common/experiments/containers/experiment-info-input-model/experiment-info-input-model.component';
import {ExperimentInfoOutputModelComponent} from '../../webapp-common/experiments/containers/experiment-info-output-model/experiment-info-output-model.component';
import {ExperimentInfoArtifactItemComponent} from '../../webapp-common/experiments/containers/experiment-info-artifact-item/experiment-info-artifact-item.component';
import {LeavingBeforeSaveAlertGuard} from '../../webapp-common/shared/guards/leaving-before-save-alert.guard';
import {ExperimentInfoTaskModelComponent} from '../../webapp-common/experiments/containers/experiment-info-task-model/experiment-info-task-model.component';
import {ExperimentInfoHyperParametersFormContainerComponent} from '../../webapp-common/experiments/containers/experiment-info-hyper-parameters-form-container/experiment-info-hyper-parameters-form-container.component';
import {ExperimentInfoExecutionComponent} from '../../webapp-common/experiments/containers/experiment-info-execution/experiment-info-execution.component';

export const routes: Routes = [
  {
    path     : '',
    component: ExperimentsComponent,
    children : [
      {
        path    : ':experimentId', component: ExperimentInfoComponent,
        children: [
          {path: '', redirectTo: 'execution', pathMatch: 'full'},
          {path: 'execution', component: ExperimentInfoExecutionComponent, canDeactivate: [LeavingBeforeSaveAlertGuard], data: {minimized: true}},
          {
            path    : 'artifacts', component: ExperimentInfoArtifactsComponent, canDeactivate: [LeavingBeforeSaveAlertGuard],
            data     : {minimized: true},
            children: [
              {path: '', redirectTo: 'input-model', pathMatch: 'full'},
              {path: 'input-model', component: ExperimentInfoInputModelComponent},
              {path: 'output-model', component: ExperimentInfoOutputModelComponent},
              {path: 'artifact/:artifactId', children: [{path: ':mode', component: ExperimentInfoArtifactItemComponent}]},
              {path: 'other/:artifactId', children: [{path: ':mode', component: ExperimentInfoArtifactItemComponent}]}
            ]
          },
          {
            path    : 'hyper-params', component: ExperimentInfoHyperParametersComponent, canDeactivate: [LeavingBeforeSaveAlertGuard],
            data     : {minimized: true},
            children: [
              {path: 'configuration/:configObject', component: ExperimentInfoTaskModelComponent},
              {path: 'hyper-param/:hyperParamId', component: ExperimentInfoHyperParametersFormContainerComponent}
            ]
          },
          {path: 'general', component: ExperimentInfoGeneralComponent, data: {minimized: true}},
          {
            path     : 'info-output',
            component: ExperimentOutputComponent,
            data     : {minimized: true},
            children : [
              {path: '', redirectTo: 'log'},
              {path: 'metrics/scalar', component: ExperimentOutputScalarsComponent, data: {minimized: true}},
              {path: 'metrics/plots', component: ExperimentOutputPlotsComponent, data: {minimized: true}},
              {path: 'debugImages', component: DebugImagesComponent, data: {minimized: true}},
              {path: 'log', component: ExperimentOutputLogComponent},
            ]
          }
        ]
      },
    ]
  },

  {
    path     : ':experimentId/output',
    component: ExperimentOutputComponent,
    data: {search: false},
    children : [
      {path: '', redirectTo: 'execution'},
      {path: 'execution', component: ExperimentInfoExecutionComponent, data: {}, canDeactivate: [LeavingBeforeSaveAlertGuard]},
      {path: 'hyper-params', component: ExperimentInfoHyperParametersComponent, data: {}, canDeactivate: [LeavingBeforeSaveAlertGuard],
        children: [
          {path: 'configuration/:configObject', component: ExperimentInfoTaskModelComponent},
          {path: 'hyper-param/:hyperParamId', component: ExperimentInfoHyperParametersFormContainerComponent}
        ]
      },
      {path: 'artifacts', component: ExperimentInfoArtifactsComponent, data: {}, canDeactivate: [LeavingBeforeSaveAlertGuard],
        children: [
          {path: '', redirectTo: 'input-model', pathMatch: 'full'},
          {path: 'input-model', component: ExperimentInfoInputModelComponent},
          {path: 'output-model', component: ExperimentInfoOutputModelComponent},
          {path: 'artifact/:artifactId', children: [{path: ':mode', component: ExperimentInfoArtifactItemComponent}]},
          {path: 'other/:artifactId', children: [{path: ':mode', component: ExperimentInfoArtifactItemComponent}]}
        ]
      },
      {path: 'general', component: ExperimentInfoGeneralComponent, data: {}},
      {path: 'metrics/scalar', component: ExperimentOutputScalarsComponent, data: {}},
      {path: 'metrics/plots', component: ExperimentOutputPlotsComponent, data: {}},
      {path: 'debugImages', component: DebugImagesComponent},
      {path: 'log', component: ExperimentOutputLogComponent},
    ]
  }
];

@NgModule({
  imports: [
    SMSharedModule,
    RouterModule.forChild(routes),

  ],
  exports: [RouterModule, SelectableListComponent, SelectableFilterListComponent]
})
export class ExperimentRouterModule {
}

